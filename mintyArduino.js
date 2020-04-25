const io = require('socket.io-client');
const five = require('johnny-five');
const config = require('./mintyConfig');
const mintyHydro = require('./mintyHydroBox');
const MintyIO = require('./mintyIO');
const Serialport = require("serialport");

const serial = new Serialport(config.serialPort, {
  baudRate: 9600,
  buffersize: 1
});

const board = new five.Board({
  port: serial,
  repl: config.debug, 
  debug: config.debug
});

log("Minty-Hydro connecting to socket server: " + config.url);
const socket = io.connect(config.url);
const mintyIO = new MintyIO(board, serial);
mintyHydro.setIO(mintyIO);
mintyHydro.runAfterTimeout();

// 240v Relays
var relayWaterPump;
var relayWaterHeater;

// Peristaltic Pump Motors
var pumpA;
var pumpB;
var pumpC;
var pumpD;
var pumpE;
var pumpF;
var pumpG;
var pumpH;

// Water Level Switches
var waterLevelTankLow;
var waterLevelTankHigh;
var waterLevelResLow;
var waterLevelResHigh;

/* BME 280 Temperature and Humidity */
var bme280;

board.on('exit', function () {
  log("*** EXIT ***");
  sendRF(config.MINTY_FDD.OFF); // @todo
  stopAllPumps();
  relayWaterHeater.off();
  sendRF(config.RF.Heater.off);
});

board.on('ready', function () {
  log("Johnny-Five Board Init - " + config.serialPort);
  
  /* BME 280 Temperature and Humidity */
  let BME280_REQUIRED_DELAY_FOR_VALID_TEMPERATURE_READ = 1000;
  board.i2cConfig(BME280_REQUIRED_DELAY_FOR_VALID_TEMPERATURE_READ);
  
  bme280 = new five.Multi({
    controller: "BME280",
    address: config.I2C_BME280_SENSOR_ADDR,
    freq: config.tick.bme280
  });

  bme280.on("change", function() {
    try {
      mintyHydro.reading.temp.air = this.thermometer.celsius;
      mintyHydro.reading.humidity = this.hygrometer.relativeHumidity;
      socketEmit('HTS:BME280:HUMIDITY:RH', this.hygrometer.relativeHumidity);
      socketEmit('HTS:BME280:TEMP:CELSIUS', this.thermometer.celsius);
    } catch (e) {
      warn("Failed BME280:ON:CHANGE:" + this, e);
    }    
  });

  // Water Level Switches
  waterLevelTankLow = new five.Switch({
    pin: config.WLS_TANK_LOW_PIN, type: "NO"
  });
  waterLevelTankHigh = new five.Switch({
    pin: config.WLS_TANK_HIGH_PIN, type: "NO"
  });
  waterLevelResLow = new five.Switch({
    pin: config.WLS_RES_LOW_PIN, type: "NO"
  });
  waterLevelResHigh = new five.Switch({
    pin: config.WLS_RES_HIGH_PIN, type: "NO"
  });

  relayWaterPump = new five.Relay({
    pin: config.HWR_RELAY_ONE_PIN, type: "NC"
  });
  relayWaterHeater = new five.Relay({
    pin: config.HWR_RELAY_TWO_PIN, type: "NC"
  });
    
  // Peristaltic Pump Motors
  pumpA = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M1); // A
  pumpB = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M2); // B
  pumpC = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M3); // C
  pumpD = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M4); // D
  pumpE = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M5); // F
  pumpF = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M6); // G
  pumpG = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M7); // E
  pumpH = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M8); // H

  socket.on('MFDD:DRAIN:FILL', function () {
    log("Drain and Fill");
   
    setTimeout(function(){
      log("Fill");
    }, pump.time);
    
  });
  
    /** floraMicro MUST be added first!! */
  socket.on('PERI:PUMP:DOSE', function (pump) {
    try {
      log("Dosing Pump ", pump);
      var motor = getPump(pump.id);
      //motor.start(pump.speed); @ todo reinstate!!! <---------------------------- todo
      setTimeout(function(){
        motor.stop();
      }, pump.time);
    } catch (e) {
      warn("Failed PERI:PUMP:DOSE " + pump, e);
    }
  });
  socket.on('PERI:PUMP:START', function (pump) {
    try {
      if (pump) {
        log("Starting Pump", pump);
        var motor = getPump(pump.id);
        motor.start(pump.speed);
      } else {
        warn("PERI:PUMP:START Called with invalid pump", pump);
      }
    } catch (e) {
      warn("Failed PERI:PUMP:START " + pump, e);
    }
  });
  socket.on('PERI:PUMP:STOP', function (id) {
    stopAllPumps();
   });
  socket.on('RF:WATER_PUMP:OFF', function () {
    relayWaterPump.off();
  });
  socket.on('RF:WATER_PUMP:ON', function () {
    relayWaterPump.on();
  });
  socket.on('RF:WATER_HEATER:OFF', function () {
    relayWaterHeater.off();
  });
  socket.on('RF:WATER_HEATER:ON', function () {
    relayWaterHeater.on();
  });
  socket.on('RF:AIR_PUMP:OFF', function () {
    sendRF(config.RF.AirPump.off);
  });
  socket.on('RF:AIR_PUMP:ON', function () {
    sendRF(config.RF.AirPump.on);
  });
  socket.on('RF:DEHUMIDIFIER:OFF', function () {
    sendRF(config.RF.Dehumidifier.off);
  });
  socket.on('RF:DEHUMIDIFIER:ON', function () {
    sendRF(config.RF.Dehumidifier.on);
  });
  socket.on('RF:HUMIDIFIER:LOW', function () {
    sendRF(config.RF.Humidifier.low);
    setTimeout(function () {
      sendRF(config.RF.Humidifier.off_high);
    }, 500);
  });
  socket.on('RF:HUMIDIFIER:HIGH', function () {
    sendRF(config.RF.Humidifier.high);
    setTimeout(function () {
      sendRF(config.RF.Humidifier.low);
    }, 500);
  });
  socket.on('RF:HUMIDIFIER:OFF', function () {
    sendRF(config.RF.Humidifier.off_low);
    setTimeout(function () {
      sendRF(config.RF.Humidifier.off_high);
    }, 500);
  });
  socket.on('RF:HEATER:OFF', function () {
    sendRF(config.RF.Heater.off);
  });
  socket.on('RF:HEATER:ON', function () {
    sendRF(config.RF.Heater.on);
  });
  socket.on('RF:AIR_EXTRACT_FAN:OFF', function () {
    sendRF(config.RF.AirExtractFan.off);
  });
  socket.on('RF:AIR_EXTRACT_FAN:ON', function () {
    sendRF(config.RF.AirExtractFan.on);
  });
  socket.on('RF:AIR_INTAKE_FAN:OFF', function () {
    sendRF(config.RF.AirIntakeFan.off);
  });
  socket.on('RF:AIR_INTAKE_FAN:LOW', function () {
    sendRF(config.RF.AirIntakeFan.low);
  });
  socket.on('RF:AIR_INTAKE_FAN:HIGH', function () {
    sendRF(config.RF.AirIntakeFan.high);
  });
  socket.on('RF:AIR_MOVEMENT_FAN:OFF', function () {
    sendRF(config.RF.AirMovementFan.off);
  });
  socket.on('RF:AIR_MOVEMENT_FAN:ON', function () {
    sendRF(config.RF.AirMovementFan.on);
  });
  socket.on('RF:LIGHT:OFF', function () {
    sendRF(config.RF.Light.off);
  });
  socket.on('RF:LIGHT:ON', function () {
    sendRF(config.RF.Light.on);
  });
  socket.on('RF:DRAIN_RES:ON', function () {
    sendRF(config.RF.DrainRes.on);
  });
  socket.on('RF:DRAIN_RES:OFF', function () {
    sendRF(config.RF.DrainRes.off);
  });
  socket.on('RF:DRAIN_POTS:ON', function () {
    sendRF(config.RF.DrainPots.on);
  });
  socket.on('RF:DRAIN_POTS:OFF', function () {
    sendRF(config.RF.DrainPots.off);
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
    sendAtlasI2C(config.I2C_ATLAS_TEMP_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (temp) {
      socketEmit('I2C:TEMP:RESULT', temp);
    });
  });
  socket.on('I2C:PH:GET', function () {
    sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (ph) {
      socketEmit('I2C:PH:RESULT', ph);
    });
  });
  socket.on('I2C:EC:GET', function () {
    sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (ec) {
      socketEmit('I2C:EC:RESULT', ec);
    });
  });
  
});

function stopAllPumps() {
  try {
    log("Stopping Pump(s)");
    pumpA.stop();
    pumpB.stop();
    pumpC.stop();
    pumpD.stop();
    pumpE.stop();
    pumpF.stop();
    pumpG.stop();
    pumpH.stop();
  } catch (e) {
    warn("Failed PERI:PUMP:STOP")
  }  
}
  
function getPump(id) {
  switch (id) {
    case 'A' :
      return pumpA;
    case 'B' :
      return pumpB;
    case 'C' :
      return pumpC;
    case 'D' :
      return pumpD;
    case 'E' :
      return pumpE;
    case 'F' :
      return pumpF;
    case 'G' :
      return pumpG;
    case 'H' :
      return pumpH;
  }  
}

function sendRF(code) {
  mintyIO.sendRF(code);
}

function socketEmit(namespace, payload) {
  mintyIO.socketEmit(namespace, payload);
}

function sendSerial(command, pin, val) {
  mintyIO.sendSerial(command, pin, val);
}

function sendAtlasI2C(channel, command, callback) {
  mintyIO.sendAtlasI2C(channel, command, callback);
}

function warn(msg, payload) {
  console.warn("** ALERT ** [ARDUINO] " + msg,  payload != undefined ? payload : "");
}

function log(msg, payload) {
  if (config.debug) console.log("[ARDUINO] " + msg,  payload != undefined ? payload : "");
}

