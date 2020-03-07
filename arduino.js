const io = require('socket.io-client');
const five = require('johnny-five');
const config = require('./config');
const Serialport = require("serialport");
const Encoder7Bit = require('encoder7bit');

const serial = new Serialport(config.serialPort, {
  baudRate: 9600,
  buffersize: 1
});

const board = new five.Board({
  port: serial,
  repl: config.debug, 
  debug: config.debug
});

/* Arduino Digital Pin Assignment */
const RESERVED_PIN = 2;
const SPARE_PIN = 3; 

/* HWR = Hardware Relays 240v */
const HWR_RELAY_ONE_PIN = 4; 
const HWR_RELAY_TWO_PIN = 5;

/* RF433 Transmitter Support */
const RCT_IN_PIN = 6;
const RCT_OUT_PIN = 7;

/* WLS = Water Level Switches */
const WLS_RES_LOW_PIN = 9;
const WLS_RES_HIGH_PIN = 10;
const WLS_TANK_LOW_PIN = 11;
const WLS_TANK_HIGH_PIN = 12;

/* Arduino I2C Address Assignment */
const I2C_GROVE_TEMP_HUMIDITY_ADDR = (0x40);
const I2C_ADAFRUIT_MOTORBOARD_TWO_ADDR = (0x60);
const I2C_ADAFRUIT_MOTORBOARD_ONE_ADDR = (0x61);
const I2C_ATLAS_PH_SENSOR_ADDR = (0x63);
const I2C_ATLAS_EC_SENSOR_ADDR = (0x64);
const I2C_ATLAS_TEMP_SENSOR_ADDR = (0x66);
const I2C_ADAFRUIT_MOTORBOARD_ALL_CALL_ADDR = (0x70);
const I2C_BME280_SENSOR_ADDR = (0x76);


const ATLAS_READ_CHARCODE = ['r'.charCodeAt(0)];
const ATLAS_BYTES_TO_READ = 30;
const ATLAS_DELAY = 1400;

const RCT_PULSE_LENGTH = 185;
const RCT_OUTPUT_DATA = (0x5C);
const RCT_OUTPUT_ATTACH = (0x01);
const RCT_OUTPUT_DETACH = (0x02);
const RCT_OUTPUT_PULSE_LENGTH = (0x12);
const RCT_OUTPUT_CODE_LONG = (0x22);
const SYSEX_START = (0xF0);
const SYSEX_END = (0xF7);

/* Air Intake Fan */ 
const RF_CODE_INTAKE_LOW = "7446194";
const RF_CODE_INTAKE_HIGH = "7446193";
const RF_CODE_INTAKE_OFF = "7446196";

/* Minty HumiBox - Humidifier */
const RF_CODE_HUMID_LOW = "12562584";
const RF_CODE_HUMID_HIGH = "12562578";
const RF_CODE_HUMID_OFF_LOW = "12562580";
const RF_CODE_HUMID_OFF_HIGH = "12562577";

/**
 * Geekcreit® 12V 4CH Channel 433Mhz 
 * Following RF codes will toggle all relay channels at once
 * e.g. to open Relays 2&4 and close Realys 1&3 we send 2775141
 * RELAY_CHANNEL_1234 Where 0=CLOSED 1=OPEN
 */
const RF_CODE_12V_0000 = "2775136";
const RF_CODE_12V_0001 = "2775137";
const RF_CODE_12V_0010 = "2775138";
const RF_CODE_12V_0011 = "2775139";
const RF_CODE_12V_0100 = "2775140";
const RF_CODE_12V_0101 = "2775141";
const RF_CODE_12V_0110 = "2775142";
const RF_CODE_12V_0111 = "2775143";
const RF_CODE_12V_1000 = "2775144";
const RF_CODE_12V_1001 = "2775145";
const RF_CODE_12V_1010 = "2775146";
const RF_CODE_12V_1011 = "2775147";
const RF_CODE_12V_1100 = "2775148";
const RF_CODE_12V_1101 = "2775149";
const RF_CODE_12V_1110 = "2775150";
const RF_CODE_12V_1111 = "2775151";
const RF_12V_RELAY = {
  Water: {
    drain: RF_CODE_12V_0111,
    fill: RF_CODE_12V_1000,
    off: RF_CODE_12V_0000
  },
}

/* Etekcity Wireless Remote Control Sockets */
const RF_CODE_S1_ON = "5264691"; // Dehumidifier
const RF_CODE_S1_OFF = "5264700";
const RF_CODE_S2_ON = "5264835"; // Air Heater
const RF_CODE_S2_OFF = "5264844";
const RF_CODE_S3_ON = "5265155"; // Air Fan Large
const RF_CODE_S3_OFF = "5265164";
const RF_CODE_S4_ON = "5266691"; // Air Extract
const RF_CODE_S4_OFF = "5266700";
const RF_CODE_S5_ON = "5272835"; // Light
const RF_CODE_S5_OFF = "5272844";

/* Energenie Trailing Gang with Four Radio Controlled Surge Protected Sockets */
const RF_CODE_Q1_ON = "8950879"; // SPARE
const RF_CODE_Q1_OFF = "8950878";
const RF_CODE_Q2_ON = "8950871"; // SPARE
const RF_CODE_Q2_OFF = "8950870";
const RF_CODE_Q3_ON = "8950875"; // Air Pump
const RF_CODE_Q3_OFF = "8950874";
const RF_CODE_Q4_ON = "8950867"; // Air Fan Small
const RF_CODE_Q4_OFF = "8950866";
const RF_CODE_QALL_ON = "8950877"; // Extention Block Over-ride
const RF_CODE_QALL_OFF = "8950876";


const RF = {
  Light: {
    on: RF_CODE_S5_ON,
    off: RF_CODE_S5_OFF
  },
  WaterPump: {
    on: RF_CODE_Q1_ON,
    off: RF_CODE_Q1_OFF
  },
  AirPump: {
    on: RF_CODE_Q3_ON,
    off: RF_CODE_Q3_OFF
  },
  WaterHeater: {
    on: RF_CODE_Q2_ON,
    off: RF_CODE_Q2_OFF
  },
  Heater: {
    on: RF_CODE_S2_ON,
    off: RF_CODE_S2_OFF
  },
  AirMovementFanSmall: {
    on: RF_CODE_Q4_ON,
    off: RF_CODE_Q4_OFF
  },
  AirMovementFanLarge: {
    on: RF_CODE_S3_ON,
    off: RF_CODE_S3_OFF
  },
  AirExtractFan: {
    on: RF_CODE_S4_ON,
    off: RF_CODE_S4_OFF
  },
  AirIntakeFan: {
    low: RF_CODE_INTAKE_LOW,
    high: RF_CODE_INTAKE_HIGH,
    off: RF_CODE_INTAKE_OFF
  },
  Dehumidifier: {
    on: RF_CODE_S1_ON,
    off: RF_CODE_S1_OFF
  },
  Humidifier: {
    low: RF_CODE_HUMID_LOW,
    high: RF_CODE_HUMID_HIGH,
    off_low: RF_CODE_HUMID_OFF_LOW,
    off_high: RF_CODE_HUMID_OFF_HIGH
  },
  Extention: {
    on: RF_CODE_QALL_ON,
    off: RF_CODE_QALL_OFF
  }

}

const ADAFRUIT_MOTOR_SHIELD = {
  M1: { // Pump A : Flora Micra
    pins: {
      pwm: 8,
      dir: 9,
      cdir: 10
    },
    address: I2C_ADAFRUIT_MOTORBOARD_ONE_ADDR,
    controller: "PCA9685"
  },
  M2: { // Pump B
    pins: {
      pwm: 13,
      dir: 12,
      cdir: 11
    },
    address: I2C_ADAFRUIT_MOTORBOARD_ONE_ADDR,
    controller: "PCA9685"
  },
  M3: { // Pump C
    pins: {
      pwm: 7,
      dir: 6,
      cdir: 5
    },
    address: I2C_ADAFRUIT_MOTORBOARD_ONE_ADDR,
    controller: "PCA9685"
  },
  M4: { // Pump D
    pins: {
      pwm: 2,
      dir: 3,
      cdir: 4
    },
    address: I2C_ADAFRUIT_MOTORBOARD_ONE_ADDR,
    controller: "PCA9685"
  },
  M5: { // Pump E
    pins: {
      pwm: 2,
      dir: 3,
      cdir: 4
    },
    address: I2C_ADAFRUIT_MOTORBOARD_TWO_ADDR,
    controller: "PCA9685"
  },
  M6: { // Pump F
    pins: {
      pwm: 8,
      dir: 9,
      cdir: 10
    },
    address: I2C_ADAFRUIT_MOTORBOARD_TWO_ADDR,
    controller: "PCA9685"
  },
  M7: { // Pump G : PH Up
    pins: {
      pwm: 13,
      dir: 12,
      cdir: 11
    },
    address: I2C_ADAFRUIT_MOTORBOARD_TWO_ADDR,
    controller: "PCA9685"
  },
  M8: { // Pump H : PH Down
    pins: {
      pwm: 7,
      dir: 6,
      cdir: 5
    },
    address: I2C_ADAFRUIT_MOTORBOARD_TWO_ADDR,
    controller: "PCA9685"
  },
};

// Connect to the socket server
const socket = io.connect(config.url);
console.log("Minty-Hydro Arduino Controller starting - config URL: " + config.url);



board.on('ready', function () {
  console.log("Johnny-Five Board Init - " + config.serialPort);
    board.on("message", function(event) {
      console.log("%s sent a 'fail' message: %s", event.class, event.message);
    });
    board.on("exit", function() {
      console.log("################  Board Exit");
    });
  
    // This will limit sampling of all Analog Input
    // and I2C sensors to once per second (1000 milliseconds)
    board.samplingInterval(1000);
    
    board.i2cConfig(1000);
  
  /* BME 280 Temperature and Humidity */
  var bme280 = new five.Multi({
      controller: "BME280",
      address: I2C_BME280_SENSOR_ADDR
  });
  
  bme280.on("change", function() {
    socketEmit('HTS:BME280:HUMIDITY:RH', this.hygrometer.relativeHumidity);
    socketEmit('HTS:BME280:TEMP:CELSIUS', this.thermometer.celsius);
  });

  /* TH02+ Temperature and Humidity */
  // var th02 = new five.Multi({
  //   controller: "TH02",
  //   address: I2C_GROVE_TEMP_HUMIDITY_ADDR    
  // });

  // th02.on("change", function() {
  //   socketEmit('HTS:TH02:HUMIDITY:RH', this.hygrometer.relativeHumidity);
  //   socketEmit('HTS:TH02:TEMP:CELSIUS', this.thermometer.celsius);
  // });
  
  // Water Level Switches
  var waterLevelTankLow = new five.Switch({
    pin: WLS_TANK_LOW_PIN, type: "NO"
  });
  var waterLevelTankHigh = new five.Switch({
    pin: WLS_TANK_HIGH_PIN, type: "NO"
  });
  var waterLevelResLow = new five.Switch({
    pin: WLS_RES_LOW_PIN, type: "NO"
  });
  var waterLevelResHigh = new five.Switch({
    pin: WLS_RES_HIGH_PIN, type: "NO"
  });

  // 240v Relays
  var relay1 = new five.Relay({
    pin: HWR_RELAY_ONE_PIN, type: "NC"
  });
  var relay2 = new five.Relay({
    pin: HWR_RELAY_TWO_PIN, type: "NC"
  });

  // Peristaltic Pump Motors
  var pumpA = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M1); // A
  var pumpB = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M2); // B
  var pumpC = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M3); // C
  var pumpD = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M4); // D
  var pumpE = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M5); // F
  var pumpF = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M6); // G
  var pumpG = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M7); // E
  var pumpH = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M8); // H
  /** floraMicro MUST be added first!! */

  socket.on('PERI:PUMP:START', function (pump) {
    console.log("Starting Pump "+ pump.pumpId + " @ " + pump.pumpSpeed);
    switch (pump.pumpId) {
      case 'A' :
        pumpA.start(pump.pumpSpeed);
        break;
      case 'B' :
        pumpB.start(pump.pumpSpeed);
        break;
      case 'C' :
        pumpC.start(pump.pumpSpeed);
        break;
      case 'D' :
        pumpD.start(pump.pumpSpeed);
        break;
      case 'E' :
        pumpE.start(pump.pumpSpeed);
        break;
      case 'F' :
        pumpF.start(pump.pumpSpeed);
        break;
      case 'G' :
        pumpG.start(pump.pumpSpeed);
        break;
      case 'H' :
        pumpH.start(pump.pumpSpeed);
        break;
    }
  });
  socket.on('PERI:PUMP:STOP', function (pump) {
    switch (pump) {
      case 'A' :
        pumpA.stop();
        break;
      case 'B' :
        pumpB.stop();
        break;
      case 'C' :
        pumpC.stop();
        break;
      case 'D' :
        pumpD.stop();
        break;
      case 'E' :
        pumpE.stop();
        break;
      case 'F' :
        pumpF.stop();
        break;
      case 'G' :
        pumpG.stop();
        break;
      case 'H' :
        pumpH.stop();
        break;
    }
  });
  socket.on('PERI:PUMP:START:ALL', function (pumpSpeed) {
    console.log("Starting ALL pumps @ " + pumpSpeed);
    pumpA.start(pumpSpeed);
    pumpB.start(pumpSpeed);
    pumpC.start(pumpSpeed);
    pumpD.start(pumpSpeed);
    pumpE.start(pumpSpeed);
    pumpF.start(pumpSpeed);
    pumpG.start(pumpSpeed);
    pumpH.start(pumpSpeed);
  });

  socket.on('PERI:PUMP:STOP:ALL', function () {
    console.log("Stopping ALL pumps");
    pumpA.stop();
    pumpB.stop();
    pumpC.stop();
    pumpD.stop();
    pumpE.stop();
    pumpF.stop();
    pumpG.stop();
    pumpH.stop();
  });



  socket.on('RF:WATER_PUMP:OFF', function () {
    sendRF(RF.WaterPump.off);
  });
  socket.on('RF:WATER_PUMP:ON', function () {
    sendRF(RF.WaterPump.on);
  });
  socket.on('RF:WATER_HEATER:OFF', function () {
    sendRF(RF.WaterHeater.off);
  });
  socket.on('RF:WATER_HEATER:ON', function () {
    sendRF(RF.WaterHeater.on);
  });
  socket.on('RF:AIR_PUMP:OFF', function () {
    sendRF(RF.AirPump.off);
  });
  socket.on('RF:AIR_PUMP:ON', function () {
    sendRF(RF.AirPump.on);
  });
  socket.on('RF:DEHUMIDIFIER:OFF', function () {
    sendRF(RF.Dehumidifier.off);
  });
  socket.on('RF:DEHUMIDIFIER:ON', function () {
    sendRF(RF.Dehumidifier.on);
  });
  socket.on('RF:HUMIDIFIER:LOW', function () {
    sendRF(RF.Humidifier.low);
    setTimeout(function () {
      sendRF(RF.Humidifier.off_high);
    }, 500);
  });
  socket.on('RF:HUMIDIFIER:HIGH', function () {
    sendRF(RF.Humidifier.high);
    setTimeout(function () {
      sendRF(RF.Humidifier.low);
    }, 500);
  });
  socket.on('RF:HUMIDIFIER:OFF', function () {
    sendRF(RF.Humidifier.off_low);
    setTimeout(function () {
      sendRF(RF.Humidifier.off_high);
    }, 500);
  });
  socket.on('RF:HEATER:OFF', function () {
    sendRF(RF.Heater.off);
  });
  socket.on('RF:HEATER:ON', function () {
    sendRF(RF.Heater.on);
  });
  socket.on('RF:AIR_EXTRACT_FAN:OFF', function () {
    sendRF(RF.AirExtractFan.off);
  });
  socket.on('RF:AIR_EXTRACT_FAN:ON', function () {
    sendRF(RF.AirExtractFan.on);
  });
  socket.on('RF:AIR_INTAKE_FAN:OFF', function () {
    sendRF(RF.AirIntakeFan.off);
  });
  socket.on('RF:AIR_INTAKE_FAN:LOW', function () {
    sendRF(RF.AirIntakeFan.low);
  });
  socket.on('RF:AIR_INTAKE_FAN:HIGH', function () {
    sendRF(RF.AirIntakeFan.high);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_SMALL:OFF', function () {
    sendRF(RF.AirMovementFanSmall.off);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_SMALL:ON', function () {
    sendRF(RF.AirMovementFanSmall.on);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_LARGE:OFF', function () {
    sendRF(RF.AirMovementFanLarge.off);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_LARGE:ON', function () {
    sendRF(RF.AirMovementFanLarge.on);
  });
  socket.on('RF:LIGHT:OFF', function () {
    sendRF(RF.Light.off);
  });
  socket.on('RF:LIGHT:ON', function () {
    sendRF(RF.Light.on);
  });
  socket.on('RF:DRAIN_RES:ON', function () {
    sendRF(RF.DrainRes.on);
  });
  socket.on('RF:DRAIN_RES:OFF', function () {
    sendRF(RF.DrainRes.off);
  });
  socket.on('RF:DRAIN_POTS:ON', function () {
    sendRF(RF.DrainPots.on);
  });
  socket.on('RF:DRAIN_POTS:OFF', function () {
    sendRF(RF.DrainPots.off);
  });

  socket.on('HW:RELAY:ONE:ON', function () {
    relay1.on();
  });
  socket.on('HW:RELAY:ONE:OFF', function () {
    relay1.off();
  });
  socket.on('HW:RELAY:TWO:ON', function () {
    relay2.on();
  });
  socket.on('HW:RELAY:TWO:OFF', function () {
    relay2.off();
  });
  waterLevelTankHigh.on("open", function () {
    socketEmit('WLS:TANK:HIGH:OPEN');
  });
  waterLevelTankHigh.on("close", function () {
    socketEmit('WLS:TANK:HIGH:CLOSE');
  });
  waterLevelTankLow.on("open", function () {
    socketEmit('WLS:TANK:LOW:OPEN');
  });
  waterLevelTankLow.on("close", function () {
    socketEmit('WLS:TANK:LOW:CLOSE');
  });
  waterLevelResHigh.on("open", function () {
    socketEmit('WLS:RES:HIGH:OPEN');
  });
  waterLevelResHigh.on("close", function () {
    socketEmit('WLS:RES:HIGH:CLOSE');
  });
  waterLevelResLow.on("open", function () {
    socketEmit('WLS:RES:LOW:OPEN');
  });
  waterLevelResLow.on("close", function () {
    socketEmit('WLS:RES:LOW:CLOSE');
  });
  socket.on("RF:TEST:12V", function(value){
    sendRF(value);
  });

  socket.on('I2C:TEMP:GET', function () {
    sendI2C(I2C_ATLAS_TEMP_SENSOR_ADDR, ATLAS_READ_CHARCODE, function (bytes) {
      socketEmit('I2C:TEMP:RESULT', bytes);
    });
  });
  socket.on('I2C:PH:GET', function () {
    sendI2C(I2C_ATLAS_PH_SENSOR_ADDR, ATLAS_READ_CHARCODE, function (bytes) {
      socketEmit('I2C:PH:RESULT', bytes);
    });
  });
  socket.on('I2C:EC:GET', function () {
    sendI2C(I2C_ATLAS_EC_SENSOR_ADDR, ATLAS_READ_CHARCODE, function (bytes) {
      socketEmit('I2C:EC:RESULT', bytes);
    });
  });



});

/* Communicate with the Atlas Tenticle Shield, Motor Shields, etc via I2C */
sendI2C = function (channel, command, callback) {
  console.log('I2C[' + channel + '] Sending Command: ' + command);
  board.io.i2cWrite(channel, command);
  board.wait(ATLAS_DELAY, function () {
    board.i2cReadOnce(channel, ATLAS_BYTES_TO_READ, function (bytes) {
      console.log('I2C[' + channel + '] Result: ' + decode(bytes));
      callback(bytes);
    });
  });
};

/* rework of https://github.com/git-developer/RCSwitchFirmata */
sendSerial = function (command, pin, val) {
  var data = [];
  data.push(SYSEX_START);
  data.push(RCT_OUTPUT_DATA);
  data.push(command);
  data.push(pin);
  if (val) {
    if (Array.isArray(val)) {
      for (var i = 0; i < val.length; i++) {
        data.push(val[i]);
      }
    } else {
      data.push(val & 0x7F);
      val = val >> 7;
      data.push(val & 0x7F);
      val = val >> 7;
      data.push(val & 0x7F);
    }
  }
  data.push(SYSEX_END);
  serial.write(data);
};

socketEmit = function (namespace, payload) {
  socket.emit(namespace, payload);
  console.log("EMIT@" + namespace, payload != undefined ? payload : "");
};

// Remote RF 433mhz Receivers
sendRF = function (code) {
  console.log('RF[' + code + ']');
  sendSerial(RCT_OUTPUT_DETACH, RCT_OUT_PIN);
  sendSerial(RCT_OUTPUT_ATTACH, RCT_OUT_PIN);
  if (RCT_PULSE_LENGTH) {
    sendSerial(RCT_OUTPUT_PULSE_LENGTH, RCT_OUT_PIN, RCT_PULSE_LENGTH);
  }
  let bytes = Encoder7Bit.to7BitArray([0x18, 0x00].concat(longToByteArray(code)));
  sendSerial(RCT_OUTPUT_CODE_LONG, RCT_OUT_PIN, bytes);
};

// https://stackoverflow.com/questions/8482309/converting-javascript-integer-to-byte-array-and-back
longToByteArray = function (long) {
  var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
  for (var index = 0; index < byteArray.length; index++) {
    var byte = long & 0xff;
    byteArray[index] = byte;
    long = (long - byte) / 256;
  }
  return byteArray;
};

byteArrayToLong = function (byteArray) {
  var value = 0;
  for (var i = byteArray.length - 1; i >= 0; i--) {
    value = (value * 256) + byteArray[i];
  }
  return value;
};

decode = function (bytes) {
  return String.fromCharCode.apply(String, bytes);
}