#include <PersWiFiManager.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266SSDP.h>
#include <ESP8266WebServer.h>
#include <DNSServer.h>

#define DEVICE_NAME "MintyHydroSlave"

const char *metaRefreshStr = "<script>window.location='/api'</script><a href='/'>redirecting...</a>";
ESP8266WebServer server(80);
DNSServer dnsServer;
PersWiFiManager persWM(server, dnsServer);

#define LED 2

void setup() {
  pinMode(LED, OUTPUT);
  persWM.begin();
  persWM.setApCredentials(DEVICE_NAME);
  register_404_handler();
  register_reset_handler();
  register_API_handler();
  register_SSDP_handler();
  server.begin();
  Serial.begin(115200);
  flash_led();
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

void loop() {
  dnsServer.processNextRequest();
  server.handleClient();
}

void register_API_handler() {
 server.on("/api", []() {
    led_on();
    String message = "Timed Out...";
    Serial.println("READ");
    for (int i = 0; i < 30; i++) {    
      if (Serial.available()) {
        message = Serial.readString();  
        break;
      }
      delay(250);
    }
    server.send(200, "application/json", message);
    led_off();
  });
}

void register_reset_handler() {
  server.on("/reset", []() {
    persWM.resetSettings();
    flash_led();
    server.send(200, "text/plain", "Reset...");
  });
}

void register_404_handler() {
  server.onNotFound([]() {
    server.sendHeader("Cache-Control", " max-age=172800");
    server.send(302, "text/html", metaRefreshStr);
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
