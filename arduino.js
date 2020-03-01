
const io = require('socket.io-client');
const five = require('johnny-five');
const config = require('./config');
const Serialport = require("serialport");
const Encoder7Bit = require('encoder7bit');

const serial = new Serialport(config.serialPort);
const board = new five.Board({ 
  port: serial,
  repl: true, // disable for production
  debug: true
});

// Water Level Switches
const WATER_LEVEL_TANK_LOW_PIN = 3; 
const WATER_LEVEL_TANK_HIGH_PIN = 4; 
const WATER_LEVEL_RES_LOW_PIN = 5; 
const WATER_LEVEL_RES_HIGH_PIN = 6; 

// RF433 Support
const RC_OUT_PIN = 7; 
const RC_IN_PIN = 2; // Pin 2 conflicts with Atlas Tenticle Shield!
const RC_PULSE_LENGTH = 185;
const RC_OUTPUT_DATA = (0x5C);
const RC_OUTPUT_ATTACH = (0x01);
const RC_OUTPUT_DETACH = (0x02);
const RC_OUTPUT_PULSE_LENGTH = (0x12);
const RC_OUTPUT_CODE_LONG = (0x22);
const SYSEX_START = (0xF0);
const SYSEX_END = (0xF7);

// 240v Relays
const HW_RELAY_ONE_PIN = 8; 
const HW_RELAY_TWO_PIN = 9; 

// Atlas Tenticle Shield Support
const I2C_ATLAS_PH_SENSOR_ADDR = (0x63);
const I2C_ATLAS_EC_SENSOR_ADDR = (0x64);
const I2C_ATLAS_TEMP_SENSOR_ADDR = (0x66);
const ATLAS_READ_CHARCODE = ['r'.charCodeAt(0)];
const ATLAS_BYTES_TO_READ = 8;
const ATLAS_DELAY = 1000; 

const RF_CODE_INTAKE_LOW = "7446194"; 
const RF_CODE_INTAKE_HIGH = "7446193"; 
const RF_CODE_INTAKE_OFF = "7446196";
const RF_CODE_HUMID_LOW = "12562584"; 
const RF_CODE_HUMID_HIGH = "12562578";
const RF_CODE_HUMID_OFF_LOW = "12562580"; 
const RF_CODE_HUMID_OFF_HIGH = "12562577";

// Geekcreit® 12V 4CH Channel 433Mhz 
// Following RF codes will toggle all relay channels at once
// e.g. to open Relays 2&4 and close Realys 1&3 we send 2775141
//  RELAY_CHANNEL_1234 Where 0=CLOSED 1=OPEN
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
  Water : {
    drain:  RF_CODE_12V_0111,
    fill: RF_CODE_12V_1000,
    off: RF_CODE_12V_0000
  },
}

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
const RF_CODE_Q1_ON = "8950879"; // Water Pump
const RF_CODE_Q1_OFF = "8950878";
const RF_CODE_Q2_ON = "8950871"; // Water Heater
const RF_CODE_Q2_OFF = "8950870";
const RF_CODE_Q3_ON = "8950875"; // Air Pump
const RF_CODE_Q3_OFF = "8950874";
const RF_CODE_Q4_ON = "8950867"; // Air Fan Small
const RF_CODE_Q4_OFF = "8950866";
const RF_CODE_QALL_ON = "8950877";
const RF_CODE_QALL_OFF = "8950876";


const RF = {
  Light : {
    on:  RF_CODE_S5_ON,
    off: RF_CODE_S5_OFF
  },
  WaterPump : {
    on: RF_CODE_Q1_ON,
    off:RF_CODE_Q1_OFF
  },
  AirPump : {
    on: RF_CODE_Q3_ON,
    off:RF_CODE_Q3_OFF
  },
  WaterHeater : {
    on: RF_CODE_Q2_ON,
    off:RF_CODE_Q2_OFF
  },
  Heater : {
    on: RF_CODE_S2_ON,
    off:RF_CODE_S2_OFF
  },  
  AirMovementFanSmall : {
    on: RF_CODE_Q4_ON,
    off:RF_CODE_Q4_OFF
  },
  AirMovementFanLarge : {
    on: RF_CODE_S3_ON,
    off:RF_CODE_S3_OFF
  },  
  AirExtractFan : {
    on: RF_CODE_S4_ON,
    off:RF_CODE_S4_OFF
  },  
  AirIntakeFan : {
    low: RF_CODE_INTAKE_LOW,
    high: RF_CODE_INTAKE_HIGH,
    off:RF_CODE_INTAKE_OFF
  },
  Dehumidifier : {
    on: RF_CODE_S1_ON,
    off:RF_CODE_S1_OFF
  },
  Humidifier : {
    low: RF_CODE_HUMID_LOW,
    high: RF_CODE_HUMID_HIGH,
    off_low:RF_CODE_HUMID_OFF_LOW, 
    off_high:RF_CODE_HUMID_OFF_HIGH
  },
  Extention : {
    on:  RF_CODE_QALL_ON,
    off: RF_CODE_QALL_OFF
  }

}

const I2C_ADAFRUIT_MOTORBOARD_ONE_ADDR = (0x61);
const I2C_ADAFRUIT_MOTORBOARD_TWO_ADDR = (0x60);
const I2C_ADAFRUIT_MOTORBOARD_ALL_CALL_ADDR = (0x70);

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

board.on('ready', function() {  
  console.log("Johnny-Five Board Init - " + config.serialPort);
  board.i2cConfig();

  var waterLevelTankLow = new five.Switch({
    pin: WATER_LEVEL_TANK_LOW_PIN,
    type: "NO" 
  });
  var waterLevelTankHigh = new five.Switch({
    pin: WATER_LEVEL_TANK_HIGH_PIN,
    type: "NO" 
  });
  var waterLevelResLow = new five.Switch({
    pin: WATER_LEVEL_RES_LOW_PIN,
    type: "NO",
    invert: true
  });
  var waterLevelResHigh = new five.Switch({
    pin: WATER_LEVEL_RES_HIGH_PIN,
    type: "NO" 
  });
    
  waterLevelTankHigh.on("open",function(){
    console.log("TANK HIGH OPEN:");
    socket.emit('WLS:TANK:HIGH:OPEN');
  });
  waterLevelTankHigh.on("close",function(){
    console.log("TANK HIGH CLOSE");
    socket.emit('WLS:TANK:HIGH:CLOSE');
  });
  waterLevelTankLow.on("open",function(){
    console.log("TANK LOW OPEN:");
    socket.emit('WLS:TANK:LOW:OPEN');
  });
  waterLevelTankLow.on("close",function(){
    console.log("TANK LOW CLOSE");
    socket.emit('WLS:TANK:LOW:CLOSE');
  });
  waterLevelResHigh.on("open",function(){
    console.log("RES HIGH OPEN:");
    socket.emit('WLS:RES:HIGH:OPEN');
  });
  waterLevelResHigh.on("close",function(){
    console.log("RES HIGH CLOSE");
    socket.emit('WLS:RES:HIGH:CLOSE');
  });
  waterLevelResLow.on("open",function(){
    console.log("RES LOW OPEN:");
    socket.emit('WLS:RES:LOW:OPEN');
  });
  waterLevelResLow.on("close",function(){
    console.log("RES LOW CLOSE");
    socket.emit('WLS:RES:LOW:CLOSE');
  });

  var relay1 = new five.Relay({
    pin: HW_RELAY_ONE_PIN, type: "NC"
  });
  var relay2 = new five.Relay({
    pin: HW_RELAY_TWO_PIN, type: "NC"
  });

    // floraMicro MUST be added first!!
    var pumpA = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M1); // A
    var pumpB = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M2); // B
    var pumpC = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M3); // C
    var pumpD = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M4); // D
    var pumpE = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M5); // F
    var pumpF = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M6); // G
    var pumpG = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M7); // E
    var pumpH = new five.Motor(ADAFRUIT_MOTOR_SHIELD.M8); // H
    
  //   console.log("Testing PumpS");
  //   const DELAY = 2000;
  //   const SPEED = 125;
  //   pumpA.fwd(SPEED);
  //   this.wait(DELAY, function() {
  //     pumpA.rev(SPEED);
  //     console.log("B");
  //     pumpB.start(SPEED);
  //     this.wait(DELAY, function() {
  //       pumpA.stop();
  //       pumpB.rev(SPEED);
  //       console.log("C");
  //       pumpC.start(SPEED);
  //       this.wait(DELAY, function() {
  //         pumpB.stop();
  //         pumpC.rev(SPEED);
  //         console.log("D");
  //         pumpD.start(SPEED);
  //         this.wait(DELAY, function() {
  //           pumpC.stop();
  //           pumpD.rev(SPEED);
  //           console.log("E");
  //           pumpE.start(SPEED);
  //           this.wait(DELAY, function() {
  //             pumpE.rev(SPEED);
  //             pumpD.stop();
  //             console.log("F");
  //             pumpF.start(SPEED);
  //             this.wait(DELAY, function() {
  //               pumpE.stop();
  //               pumpF.rev(SPEED);
  //               console.log("G");
  //               pumpG.start(SPEED);
  //               this.wait(DELAY, function() {
  //                 pumpF.stop();
  //                 pumpG.rev(SPEED);
  //                 console.log("H");
  //                 pumpH.start(SPEED);
  //                 this.wait(DELAY, function() {
  //                   pumpG.stop();
  //                   pumpH.rev(SPEED);
  //                   this.wait(DELAY, function() {
  //                     pumpH.stop();
                      
  //                   }.bind(this));
  //                 }.bind(this));
  //               }.bind(this));
  //             }.bind(this));
  //           }.bind(this));
  //         }.bind(this));
  //       }.bind(this));
  //     }.bind(this));
  //   }.bind(this));


  socket.on('RF:WATER_PUMP:OFF', function() {
    sendRF(RF.WaterPump.off);
  });
  socket.on('RF:WATER_PUMP:ON', function() {
    sendRF(RF.WaterPump.on);
  });
  socket.on('RF:WATER_HEATER:OFF', function() {
    sendRF(RF.WaterHeater.off);
  });
  socket.on('RF:WATER_HEATER:ON', function() {
    sendRF(RF.WaterHeater.on);
  });
  socket.on('RF:AIR_PUMP:OFF', function() {
    sendRF(RF.AirPump.off);
  });
  socket.on('RF:AIR_PUMP:ON', function() {
    sendRF(RF.AirPump.on);
  });
  socket.on('RF:DEHUMIDIFIER:OFF', function() {
    sendRF(RF.Dehumidifier.off);
  });
  socket.on('RF:DEHUMIDIFIER:ON', function() {
    sendRF(RF.Dehumidifier.on);
  });
  socket.on('RF:HUMIDIFIER:LOW', function() {
    sendRF(RF.Humidifier.low);
    setTimeout(function(){
      sendRF(RF.Humidifier.off_high);
    },500);
  });
  socket.on('RF:HUMIDIFIER:HIGH', function() {
    sendRF(RF.Humidifier.high);
    setTimeout(function(){
       sendRF(RF.Humidifier.low);
    },500);
  });
  socket.on('RF:HUMIDIFIER:OFF', function() {
    sendRF(RF.Humidifier.off_low);
    setTimeout(function(){
      sendRF(RF.Humidifier.off_high);
    },500);
  });
  socket.on('RF:HEATER:OFF', function() {
    sendRF(RF.Heater.off);
  });
  socket.on('RF:HEATER:ON', function() {
    sendRF(RF.Heater.on);
  });
  socket.on('RF:AIR_EXTRACT_FAN:OFF', function() {
    sendRF(RF.AirExtractFan.off);
  });
  socket.on('RF:AIR_EXTRACT_FAN:ON', function() {
    sendRF(RF.AirExtractFan.on);
  });
  socket.on('RF:AIR_INTAKE_FAN:OFF', function() {
    sendRF(RF.AirIntakeFan.off);
  });
  socket.on('RF:AIR_INTAKE_FAN:LOW', function() {
    sendRF(RF.AirIntakeFan.low);
  });
  socket.on('RF:AIR_INTAKE_FAN:HIGH', function() {
    sendRF(RF.AirIntakeFan.high);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_SMALL:OFF', function() {
    sendRF(RF.AirMovementFanSmall.off);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_SMALL:ON', function() {
    sendRF(RF.AirMovementFanSmall.on);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_LARGE:OFF', function() {
    sendRF(RF.AirMovementFanLarge.off);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_LARGE:ON', function() {
    sendRF(RF.AirMovementFanLarge.on);
  });
  socket.on('RF:LIGHT:OFF', function() {
    sendRF(RF.Light.off);
  });
  socket.on('RF:LIGHT:ON', function() {
    sendRF(RF.Light.on);
  });
  socket.on('RF:DRAIN_RES:ON', function() {
    console.log("RF:DRAIN_RES");
    sendRF(RF.DrainRes.on);
  });
  socket.on('RF:DRAIN_RES:OFF', function() {
    console.log("Close RF:DRAIN_RES");
    sendRF(RF.DrainRes.off);
  });
  socket.on('RF:DRAIN_POTS:ON', function() {
    console.log("RF:DRAIN_POTS");
    sendRF(RF.DrainPots.on);
  });
  socket.on('RF:DRAIN_POTS:OFF', function() {
    console.log("Close RF:DRAIN_POTS");
    sendRF(RF.DrainPots.off);
  });
  socket.on('I2C:TEMP:GET', function(){
    sendI2C(I2C_ATLAS_TEMP_SENSOR_ADDR, ATLAS_READ_CHARCODE, function(bytes){
      socket.emit('I2C:TEMP:RESULT', bytes);
    });
  });
  socket.on('I2C:PH:GET', function(){
    sendI2C(I2C_ATLAS_PH_SENSOR_ADDR, ATLAS_READ_CHARCODE, function(bytes){
      socket.emit('I2C:PH:RESULT', bytes);
    });
  });
  socket.on('I2C:EC:GET', function(){
    sendI2C(I2C_ATLAS_EC_SENSOR_ADDR, ATLAS_READ_CHARCODE, function(bytes){
      socket.emit('I2C:EC:RESULT', bytes); 
    });
  });
  socket.on('HW:RELAY:ONE:ON', function(){
      relay1.on();
  });
  socket.on('HW:RELAY:ONE:OFF', function(){
      relay1.off();
  });
  socket.on('HW:RELAY:TWO:ON', function(){
      relay2.on();
  });
  socket.on('HW:RELAY:TWO:OFF', function(){
      relay2.off();
  });

});

// Communicate with the Atlas Tenticle Shield, Motor Shields, etc via I2C
sendI2C = function(channel, command, callback) {
  console.log('I2C[' + channel + '] Sending Command: ' + command);
  board.io.i2cWrite(channel, command);
  board.wait(ATLAS_DELAY, function() {
      board.i2cReadOnce(channel, ATLAS_BYTES_TO_READ, function(bytes) {
        console.log('I2C[' + channel + '] Result: ' + decode(bytes));
        callback(bytes);
      });
  });
};

// rework of https://github.com/git-developer/RCSwitchFirmata
sendSerial = function(command, pin, val) {
  var data = [];
  data.push(SYSEX_START);
  data.push(RC_OUTPUT_DATA);
  data.push(command);
  data.push(pin);
  if (val) {
    if (Array.isArray(val)) {
      for (var i = 0; i < val.length ; i++) {
        data.push(val[i]);   
      }        
    } else {
      data.push(val & 0x7F);
      val = val >> 7 ;
      data.push(val & 0x7F);        
      val = val >> 7 ;
      data.push(val & 0x7F);
    }
  }
  data.push(SYSEX_END);    
  serial.write(data);
};

// Remote RF 433mhz Receivers
sendRF = function(code) {
  console.log('RF[' + code + ']');
  sendSerial(RC_OUTPUT_DETACH, RC_OUT_PIN);   
  sendSerial(RC_OUTPUT_ATTACH, RC_OUT_PIN);
  if (RC_PULSE_LENGTH) {
      sendSerial(RC_OUTPUT_PULSE_LENGTH, RC_OUT_PIN, RC_PULSE_LENGTH);
  }
  let bytes = Encoder7Bit.to7BitArray([0x18, 0x00].concat(longToByteArray(code)));
  sendSerial(RC_OUTPUT_CODE_LONG, RC_OUT_PIN,  bytes);
};

// https://stackoverflow.com/questions/8482309/converting-javascript-integer-to-byte-array-and-back
longToByteArray = function(long) {
  var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
  for ( var index = 0; index < byteArray.length; index ++ ) {
      var byte = long & 0xff;
      byteArray [ index ] = byte;
      long = (long - byte) / 256 ;
  }
  return byteArray;
};

byteArrayToLong = function(byteArray) {
  var value = 0;
  for ( var i = byteArray.length - 1; i >= 0; i--) {
      value = (value * 256) + byteArray[i];
  }
  return value;
};

decode = function(bytes) {
  return String.fromCharCode.apply(String, bytes);
}