#include <ArduinoJson.h>
#include <PersWiFiManager.h>  // https://github.com/r-downing/PersWiFiManage
#include <EasySSDP.h>         // http://ryandowning.net/EasySSDP/
#include <SPIFFSReadServer.h> // http://ryandowning.net/SPIFFSReadServer/
#include <ESP8266WiFi.h>
#include <ESP8266SSDP.h>
#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <FS.h>
#include <ESP8266mDNS.h>

#define DEVICE_NAME "MintyHydroSlave"
#define LED 2

const char *metaRefreshStr = "<script>window.location='/wifi.htm'</script><a href='/'>redirecting...</a>";
ESP8266WebServer server(80);
DNSServer dnsServer;
PersWiFiManager persWM(server, dnsServer);

void setup() {
  pinMode(LED, OUTPUT);
  register_Connect_handler();
  register_AP_handler();
  register_404_handler();
  register_reset_handler();
  register_API_handler();
  register_SSDP_handler();
  SPIFFS.begin();
  Serial.begin(115200);
  WiFi.hostname(DEVICE_NAME);
  persWM.setApCredentials(DEVICE_NAME);
  persWM.setConnectNonBlock(true);
  persWM.begin();
  MDNS.begin(DEVICE_NAME);
  server.begin();
  flash_led();
}

void loop() {
  persWM.handleWiFi();
  dnsServer.processNextRequest();
  server.handleClient();
}

void register_AP_handler() {
 persWM.onAp([](){

 });
}

void register_Connect_handler() {
   EasySSDP::begin(server);
}

void register_API_handler() {
 server.on("/api", []() {
    led_on();
    String message = "Timed Out...";
    Serial.println("READ");
    for (int i = 0; i < 50; i++) {    
      if (Serial.available()) {
        message = Serial.readString();  
        break;
      }
      delay(100);
    }
    server.sendHeader("Access-Control-Allow-Origin","*");
    server.send(200, "application/json", message);
    led_off();
  });
}

void register_reset_handler() {
  server.on("/reset", []() {
    persWM.resetSettings();
    flash_led();
    server.sendHeader("Access-Control-Allow-Origin","*");
    server.send(200, "text/plain", "Reset...");
  });
}

void register_404_handler() {
  server.onNotFound([]() {
    if (!handleFileRead(server.uri())) {
      server.sendHeader("Access-Control-Allow-Origin","*");
      server.sendHeader("Cache-Control", " max-age=172800");
      server.send(302, "text/html", metaRefreshStr);
    }
  });
}

void register_SSDP_handler() { //SSDP makes device visible on windows network
  server.on("/description.xml", HTTP_GET, []() {
    SSDP.schema(server.client());
  });
  SSDP.setSchemaURL("description.xml");
  SSDP.setHTTPPort(80);
  SSDP.setName(DEVICE_NAME);
  SSDP.setURL("/");
  SSDP.setDeviceType("upnp:rootdevice");
  SSDP.begin();
}

void flash_led() {
  led_on();
  delay(1000);
  led_off();
}

void led_off() {
  digitalWrite(LED, HIGH);
}

void led_on() {
  digitalWrite(LED, LOW);
}

bool handleFileRead(String path) {
  if (path.endsWith("/")) path += "index.htm";
  String contentType;
  if (path.endsWith(".htm") || path.endsWith(".html")) contentType = "text/html";
  else if (path.endsWith(".css")) contentType = "text/css";
  else if (path.endsWith(".js")) contentType = "application/javascript";
  else if (path.endsWith(".png")) contentType = "image/png";
  else if (path.endsWith(".gif")) contentType = "image/gif";
  else if (path.endsWith(".jpg")) contentType = "image/jpeg";
  else if (path.endsWith(".ico")) contentType = "image/x-icon";
  else if (path.endsWith(".xml")) contentType = "text/xml";
  else if (path.endsWith(".pdf")) contentType = "application/x-pdf";
  else if (path.endsWith(".zip")) contentType = "application/x-zip";
  else if (path.endsWith(".gz")) contentType = "application/x-gzip";
  else if (path.endsWith(".json")) contentType = "application/json";
  else contentType = "text/plain";

  //split filepath and extension
  String prefix = path, ext = "";
  int lastPeriod = path.lastIndexOf('.');
  if (lastPeriod >= 0) {
    prefix = path.substring(0, lastPeriod);
    ext = path.substring(lastPeriod);
  }

  if (SPIFFS.exists(prefix + ".min" + ext)) path = prefix + ".min" + ext;
  if (SPIFFS.exists(prefix + ext + ".gz")) path = prefix + ext + ".gz";
  if (SPIFFS.exists(prefix + ".min" + ext + ".gz")) path = prefix + ".min" + ext + ".gz";
  if (SPIFFS.exists(path)) {
    File file = SPIFFS.open(path, "r");
    server.sendHeader("Access-Control-Allow-Origin","*");
    if (server.hasArg("download"))
      server.sendHeader("Content-Disposition", " attachment;");
    if (server.uri().indexOf("nocache") < 0)
      server.sendHeader("Cache-Control", " max-age=172800");
    if (WiFi.status() == WL_CONNECTED && server.hasArg("alt")) {
      server.sendHeader("Location", server.arg("alt"), true);
      server.send ( 302, "text/plain", "");
    } else {
      size_t sent = server.streamFile(file, contentType);
    }
    file.close();
    return true;
  }
  return false;
}
