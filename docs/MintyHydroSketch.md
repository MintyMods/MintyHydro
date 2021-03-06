/*
 * MintyHydro.ino 
 * Custom Firmata sketch including support for
 * RF433Mhz Sending
 */

#include <ConfigurableFirmata.h>
#include <DigitalInputFirmata.h>
DigitalInputFirmata digitalInput;
#include <DigitalOutputFirmata.h>
DigitalOutputFirmata digitalOutput;
#include <Servo.h>
#include <ServoFirmata.h>
ServoFirmata servo;
#include <Wire.h>
#include <I2CFirmata.h>
I2CFirmata i2c;
#include <SerialFirmata.h>
SerialFirmata serial;
#include <RCOutputFirmata.h>
RCOutputFirmata rcOutput;
#include <TH02_dev.h>
#include <AnalogOutputFirmata.h>
AnalogOutputFirmata analogOutput;
#include <FirmataExt.h>
FirmataExt firmataExt;
#include <AnalogWrite.h>
#include <FirmataReporting.h>
FirmataReporting reporting;

void systemResetCallback(){
  for (byte i = 0; i < TOTAL_PINS; i++) {
    if (IS_PIN_ANALOG(i)) {
    } else if (IS_PIN_DIGITAL(i)) {
      Firmata.setPinMode(i, OUTPUT);
    }
  }
  firmataExt.reset();
}

void initTransport(){
  // Uncomment to save a couple of seconds by disabling the startup blink sequence.
  Firmata.disableBlinkVersion();
  Firmata.begin(57600);
}

void initFirmata(){
  Firmata.setFirmwareVersion(FIRMATA_FIRMWARE_MAJOR_VERSION, FIRMATA_FIRMWARE_MINOR_VERSION);
  firmataExt.addFeature(digitalInput);
  firmataExt.addFeature(digitalOutput);
  firmataExt.addFeature(servo);
  firmataExt.addFeature(i2c);
  firmataExt.addFeature(serial);
  firmataExt.addFeature(rcOutput);
  firmataExt.addFeature(analogOutput);
  firmataExt.addFeature(reporting);
  Firmata.attach(SYSTEM_RESET, systemResetCallback);
}

void setup(){
  initFirmata();
  initTransport();
  Firmata.parse(SYSTEM_RESET);
}

void loop(){
  digitalInput.report();

  while(Firmata.available()) {
    Firmata.processInput();
  }

  if (reporting.elapsed()) {
    i2c.report();
  }

  serial.update();
}