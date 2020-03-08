const io = require('socket.io-client');
const five = require('johnny-five');
const config = require('./config');
const MintyHydroBox = require('./mintyHydroBox');
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
const mintyIO = new MintyIO(board, socket, serial);
const mintyHydro = new MintyHydroBox(mintyIO);

board.on('ready', function () {
  log("Johnny-Five Board Init - " + config.serialPort);
  
  let BME280_REQUIRED_DELAY_FOR_VALID_TEMPERATURE_READ = 1000;
  board.i2cConfig(BME280_REQUIRED_DELAY_FOR_VALID_TEMPERATURE_READ);

  /* BME 280 Temperature and Humidity */
  var bme280 = new five.Multi({
      controller: "BME280",
      address: config.I2C_BME280_SENSOR_ADDR,
      freq: 1000
  });
  
  bme280.on("change", function() {
    mintyHydro.sensorReading.temp.air = this.thermometer.celsius;
    mintyHydro.sensorReading.humidity = this.hygrometer.relativeHumidity;
    socketEmit('HTS:BME280:HUMIDITY:RH', this.hygrometer.relativeHumidity);
    socketEmit('HTS:BME280:TEMP:CELSIUS', this.thermometer.celsius);
  });

  // Water Level Switches
  var waterLevelTankLow = new five.Switch({
    pin: config.WLS_TANK_LOW_PIN, type: "NO"
  });
  var waterLevelTankHigh = new five.Switch({
    pin: config.WLS_TANK_HIGH_PIN, type: "NO"
  });
  var waterLevelResLow = new five.Switch({
    pin: config.WLS_RES_LOW_PIN, type: "NO"
  });
  var waterLevelResHigh = new five.Switch({
    pin: config.WLS_RES_HIGH_PIN, type: "NO"
  });

  // 240v Relays
  var relayWaterPump = new five.Relay({
    pin: config.HWR_RELAY_ONE_PIN, type: "NC"
  });
  var relayWaterHeater = new five.Relay({
    pin: config.HWR_RELAY_TWO_PIN, type: "NC"
  });

  // Peristaltic Pump Motors
  var pumpA = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M1); // A
  var pumpB = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M2); // B
  var pumpC = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M3); // C
  var pumpD = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M4); // D
  var pumpE = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M5); // F
  var pumpF = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M6); // G
  var pumpG = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M7); // E
  var pumpH = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M8); // H

  /** floraMicro MUST be added first!! */

  socket.on('PERI:PUMP:START', function (pump) {
    log("Starting Pump "+ pump.pumpId + " @ " + pump.pumpSpeed);
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
      case 'ALL' :
        startAllPeriPumps(pump.pumpSpeed);
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
      case 'ALL' :
        stopAllPeriPumps()
        break; 
    }
  });

  socket.on('PERI:PUMP:START:ALL', function (pumpSpeed) {
    startAllPeriPumps();
  });

  socket.on('PERI:PUMP:STOP:ALL', function () {
    stopAllPeriPumps();
  });

  function startAllPeriPumps(pumpSpeed) {
    log("Starting ALL pumps @ " + pumpSpeed);
    pumpA.start(pumpSpeed);
    pumpB.start(pumpSpeed);
    pumpC.start(pumpSpeed);
    pumpD.start(pumpSpeed);
    pumpE.start(pumpSpeed);
    pumpF.start(pumpSpeed);
    pumpG.start(pumpSpeed);
    pumpH.start(pumpSpeed);  
  };

  function stopAllPeriPumps() {
    log("Stopping ALL pumps");
    pumpA.stop();
    pumpB.stop();
    pumpC.stop();
    pumpD.stop();
    pumpE.stop();
    pumpF.stop();
    pumpG.stop();
    pumpH.stop();
  };

  socket.on('RF:WATER_PUMP:OFF', function () {
    sendRF(config.RF.WaterPump.off);
  });
  socket.on('RF:WATER_PUMP:ON', function () {
    sendRF(config.RF.WaterPump.on);
  });
  socket.on('RF:WATER_HEATER:OFF', function () {
    sendRF(config.RF.WaterHeater.off);
  });
  socket.on('RF:WATER_HEATER:ON', function () {
    sendRF(config.RF.WaterHeater.on);
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
  socket.on('RF:AIR_MOVEMENT_FAN_SMALL:OFF', function () {
    sendRF(config.RF.AirMovementFanSmall.off);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_SMALL:ON', function () {
    sendRF(config.RF.AirMovementFanSmall.on);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_LARGE:OFF', function () {
    sendRF(config.RF.AirMovementFanLarge.off);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_LARGE:ON', function () {
    sendRF(config.RF.AirMovementFanLarge.on);
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
  socket.on('HW:RELAY:ONE:ON', function () {
    relayWaterPump.on();
  });
  socket.on('HW:RELAY:ONE:OFF', function () {
    relayWaterPump.off();
  });
  socket.on('HW:RELAY:TWO:ON', function () {
    relayWaterHeater.on();
  });
  socket.on('HW:RELAY:TWO:OFF', function () {
    relayWaterHeater.off();
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

  mintyHydro.poll();

});

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

function log(msg, payload) {
  if (config.debug) console.log("[ARDUINO] " + msg,  payload != undefined ? payload : "");
}
