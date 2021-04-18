/*
 * MintyHydro.ino 
 * Custom Firmata sketch including support for
 * RF433Mhz Sending
 */

DigitalInputFirmata digitalInput;
DigitalOutputFirmata digitalOutput;
ServoFirmata servo;
I2CFirmata i2c;
SerialFirmata serial;
RCOutputFirmata rcOutput;
AnalogOutputFirmata analogOutput;
FirmataExt firmataExt;
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
