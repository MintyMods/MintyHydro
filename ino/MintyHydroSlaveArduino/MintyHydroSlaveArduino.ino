#include <Ezo_i2c.h>  //include the EZO I2C library from https://github.com/Atlas-Scientific/Ezo_I2c_lib
#include <Wire.h>
#include <ArduinoJson.h>
#include <TH02_dev.h>
#include "Arduino.h"

const char NEWLINE = '\n';
Ezo_board ph = Ezo_board(99, "PH");
Ezo_board ec = Ezo_board(100, "EC");
Ezo_board temp = Ezo_board(102, "TEMP");
bool request = false;

void setup() {
  init_i2c();
  init_wifiEsp8266();
  init_envMonitor();
}

void init_wifiEsp8266() {
  Serial1.begin(115200); 
}

void init_i2c() {
  Wire.begin();
}

void init_envMonitor() {
  TH02.begin();
}

void loop() {  
  if (Serial1.available()) {
    Serial1.readString();
    send_response();
   }
}

void send_response() {
  const size_t CAPACITY = JSON_OBJECT_SIZE(6);
  StaticJsonDocument<CAPACITY> doc;
  JsonObject json = doc.to<JsonObject>();
  request_reading_with_temp_comp(ph);
  delay(256);
  request_reading_with_temp_comp(ec);
  delay(256);
  request_reading(temp);
  delay(1000);
  json["WATER_EC"] = receive_reading(ec);
  json["WATER_PH"] = receive_reading(ph);
  json["WATER_TEMP"] = receive_reading(temp);
  json["AIR_TEMP"] = TH02.ReadTemperature();
  json["AIR_HUMIDITY"] = TH02.ReadHumidity();
  json["MILLIS"] =  millis();
  serializeJson(doc, Serial1);
}

void request_reading(Ezo_board &Sensor) {
   Sensor.send_read_cmd();
}

void request_reading_with_temp_comp(Ezo_board &Sensor) {
  if (valid_temp_reading()) {
    Sensor.send_read_with_temp_comp(temp.get_last_received_reading());
  } else {
    Sensor.send_read_cmd();
  }  
}

bool valid_temp_reading() {
  return (temp.get_error() == Ezo_board::SUCCESS) && (temp.get_last_received_reading() > -1000.0);
}

float receive_reading(Ezo_board &Sensor) {
  Sensor.receive_read_cmd();
  switch (Sensor.get_error()) {
    case Ezo_board::SUCCESS:
      return Sensor.get_last_received_reading();
    case Ezo_board::FAIL:
    case Ezo_board::NOT_READY:
    case Ezo_board::NO_DATA:
      return 0;
  }
}
