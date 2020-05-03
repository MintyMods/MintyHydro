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
let relayWaterPump;
let relayWaterHeater;

// Peristaltic Pump Motors
let pumpCalMag = null;
let pumpFloraMicro = null;
let pumpFloraGrow = null;
let pumpFloraBloom = null;
let pumpHydroGuard = null;
let pumpSpare = null;
let pumpPhUp = null;
let pumpPhDown = null;

// Water Level Switches
let waterLevelTankLow;
let waterLevelTankHigh;
let waterLevelResLow;
let waterLevelResHigh;

/* BME 280 Temperature and Humidity */
let bme280;

board.on('exit', function () {
  log("*** EXIT ***");
  sendRF(config.MINTY_FDD.OFF);
});

board.on('ready', function () {
  log("Johnny-Five Board Init - " + config.serialPort);

  /* BME 280 Temperature and Humidity */
  const BME280_REQUIRED_DELAY_FOR_VALID_TEMPERATURE_READ = 1000;
  board.i2cConfig(BME280_REQUIRED_DELAY_FOR_VALID_TEMPERATURE_READ);

  bme280 = new five.Multi({
    controller: "BME280",
    address: config.I2C_BME280_SENSOR_ADDR,
    freq: config.tick.bme280
  });

  bme280.on("change", function () {
    try {
      mintyHydro.reading.temp.air = this.thermometer.celsius;
      mintyHydro.reading.humidity = this.hygrometer.relativeHumidity;
      mintyHydro.reading.pressure = this.barometer.pressure;
      socketEmit('HTS:BME280:HUMIDITY:RH', this.hygrometer.relativeHumidity);
      socketEmit('HTS:BME280:TEMP:CELSIUS', this.thermometer.celsius);
      socketEmit('HTS:BME280:PRESSURE', this.barometer.pressure);
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

  pumpCalMag = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M1);
  pumpFloraMicro = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M2);
  pumpFloraGrow = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M3);
  pumpFloraBloom = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M4);
  pumpHydroGuard = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M5);
  pumpSpare = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M6);
  pumpPhUp = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M7); 
  pumpPhDown = new five.Motor(config.ADAFRUIT_MOTOR_SHIELD.M8);
  pumpCalMag.name = "CalMag";
  pumpFloraMicro.name = "Flora Micro";
  pumpFloraGrow.name = "Flora Grow";
  pumpFloraBloom.name = "Flora Bloom";
  pumpHydroGuard.name = "Hydro Guard";
  pumpSpare.name = "Spare";
  pumpPhUp.name = "pH Up";
  pumpPhDown.name = "pH Down";

  /** floraMicro MUST be added first!! */
  function pumpDose(pump) {
      log("Dosing Pump ");
      let config = getPumpConfig(pump.id);
      pump.start(config.speed);
      sendConfirmation(pump.name + ' Dosing Started', 'The ' + pump.name + ' pump has started dosing.', 'fal fa-cog fa-spin');
      setTimeout(function () {
        pump.stop();
        sendConfirmation(pump.name + ' Dosing Stopped', 'The ' + pump.name + ' pump has stopped dosing.', 'fal fa-cog');
      }, config.time);
  }

  function pumpStart(pump) {
      log("Starting Pump");
      var config = getPumpConfig(pump.id);
      pump.start(config.speed);
      sendConfirmation(pump.name + ' Pump Started', 'The ' + pump.name + ' pump has been started.','fal fa-cog fa-spin');
  }

  function pumpStop(pump) {
      pump.stop();
      sendConfirmation(pump.name + ' Pump Stopped', 'The ' + pump.name + ' pump has been stopped.','fal fa-cog');
  }
  function sendConfirmation(title, text, icon) {
    socketEmit('ARDUINO:CONFIM', { 'title':title, 'text':text, icon:icon });
  }

  /* ATLAS Calibration Routines */ 
  socket.on('CALIBRATE:EC:DRY', function () {
    let command = "cal,dry";
    // sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, command, function (temp) {
      sendConfirmation('Calibration Command', 'Atlas "' + command + '" initiated...','fal fa-code-branch');
    // });    
  });
  socket.on('CALIBRATE:EC:LOW', function () {
    let command = "cal,low,12880";
    // sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, command, function (temp) {
      sendConfirmation('Calibration Command', 'Atlas "' + command + '" initiated...','fal fa-code-branch');
    // });    
  });
  socket.on('CALIBRATE:EC:HIGH', function () {
    // Cal,high,800000
    let command = "cal,low,12880";
    // sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, command, function (temp) {
      sendConfirmation('Calibration Command', 'Atlas "' + command + '" initiated...','fal fa-code-branch');
    // });       
  });
  socket.on('CALIBRATE:PH:MID', function () {
    let command = "cal,mid,7";
    // sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, command, function (temp) {
      sendConfirmation('Calibration Command', 'Atlas "' + command + '" initiated...','fal fa-code-branch');
    // });       
  });
  socket.on('CALIBRATE:PH:LOW', function () {
    let command = "cal,low,4";
    // sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, command, function (temp) {
      sendConfirmation('Calibration Command', 'Atlas "' + command + '" initiated...','fal fa-code-branch');
    // });       
  });
  socket.on('CALIBRATE:PH:HIGH', function () {
    let command = "cal,high,10";
    // sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, command, function (temp) {
      sendConfirmation('Calibration Command', 'Atlas "' + command + '" initiated...','fal fa-code-branch');
    // });       
  });



  socket.on('PUMP:PH_UP:OFF', function (id) {
    pumpStop(pumpPhUp);
  });
  socket.on('PUMP:PH_UP:ON', function () {
    pumpStart(pumpPhUp);
  });
  socket.on('PUMP:PH_UP:DOSE', function () {
    pumpDose(pumpPhUp);
  });
  socket.on('PUMP:PH_DOWN:ON', function () {
    pumpStart(pumpPhDown);
  });
  socket.on('PUMP:PH_DOWN:OFF', function () {
    pumpStop(pumpPhDown);
  });
  socket.on('PUMP:PH_DOWN:DOSE', function () {
    pumpDose(pumpPhDown);
  });
  socket.on('PUMP:CALMAG:ON', function () {
    pumpStart(pumpCalMag);
  });
  socket.on('PUMP:CALMAG:OFF', function () {
    pumpStop(pumpCalMag);
  });
  socket.on('PUMP:CALMAG:DOSE', function () {
    pumpDose(pumpCalMag);
  });
  socket.on('PUMP:HYDROGUARD:ON', function () {
    pumpStart(pumpHydroGuard);
  });
  socket.on('PUMP:HYDROGUARD:OFF', function () {
    pumpStop(pumpHydroGuard);
  });
  socket.on('PUMP:HYDROGUARD:DOSE', function () {
    pumpDose(pumpHydroGuard);
  });
  socket.on('PUMP:FLORA_MICRO:ON', function () {
    pumpStart(pumpFloraMicro);
  });
  socket.on('PUMP:FLORA_MICRO:OFF', function () {
    pumpStop(pumpFloraMicro);
  });
  socket.on('PUMP:FLORA_MICRO:DOSE', function () {
    pumpDose(pumpFloraMicro);
  });
  socket.on('PUMP:FLORA_GROW:ON', function () {
    pumpStart(pumpFloraGrow);
  });
  socket.on('PUMP:FLORA_GROW:OFF', function () {
    pumpStop(pumpFloraGrow);
  });
  socket.on('PUMP:FLORA_GROW:DOSE', function () {
    pumpDose(pumpFloraGrow);
  });
  socket.on('PUMP:FLORA_BLOOM:ON', function () {
    pumpStart(pumpFloraBloom);
  });
  socket.on('PUMP:FLORA_BLOOM:OFF', function () {
    pumpStop(pumpFloraBloom);
  });
  socket.on('PUMP:FLORA_BLOOM:DOSE', function () {
    pumpDose(pumpFloraBloom);
  });
  socket.on('PUMP:SPARE:ON', function () {
    pumpStart(pumpSpare);
  });
  socket.on('PUMP:SPARE:OFF', function () {
    pumpStop(pumpSpare);
  });
  socket.on('PUMP:SPARE:DOSE', function () {
    pumpDose(pumpSpare);
  });
  socket.on('PUMP:DRAIN:ON', function () {
    sendRF(config.MINTY_FDD.DRAIN);
    sendConfirmation('Drain Pumps On', 'The drain pumps have been turned on.','fal fa-cog fa-spin');
  });
  socket.on('PUMP:DRAIN:OFF', function () {
    sendRF(config.MINTY_FDD.OFF);
    sendConfirmation('Drain Pumps Off', 'The drain pumps have been turned off.','fal fa-cog');
  });
  socket.on('PUMP:FILL:ON', function () {
    sendRF(config.MINTY_FDD.FILL);
    sendConfirmation('Fill Pump On', 'The fill pump has been turned on.','fal fa-cog fa-spin');
  });
  socket.on('PUMP:FILL:OFF', function () {
    sendRF(config.MINTY_FDD.OFF);
    sendConfirmation('Fill Pump Off', 'The fill pump has been turned off.','fal fa-cog ');
  });
  socket.on('PUMP:MAGMIX:ON', function () {
    sendRF(config.MINTY_FDD.MAGMIX);
    sendConfirmation('Mag Mix Fans On', 'The magnetic mixing fans have been turned on.','fal fa-magic fa-spin');
  });
  socket.on('PUMP:MAGMIX:OFF', function () {
    sendRF(config.MINTY_FDD.OFF);
    sendConfirmation('Mag Mix Fans Off', 'The magnetic mixing fans have been turned off.','fal fa-magic');
  });
  socket.on('PUMP:DRIP:ON', function () {
    sendRF(config.MINTY_FDD.DRIP);
    sendConfirmation('Drip Pumps On', 'The drip pumps have been turned on.','fal fa-cog fa-spin');
  });
  socket.on('PUMP:DRIP:OFF', function () {
    sendRF(config.MINTY_FDD.OFF);
    sendConfirmation('Drip Pumps Off', 'The drip pumps have been turned off.','fal fa-cog ');
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

  socket.on('BASE_NUTRIENTS:UPDATE', function (row) {

    sendConfirmation('Base Nutrients Updated', 'Base nutrients data has been update. Dosing amounts recalculated.','fal balance-scale');
  });

  socket.on('RF:WATER_PUMP:OFF', function () {
    relayWaterPump.off();
    sendConfirmation('Water Pump Off', 'Recirculating water pump been has been stopped.','fal fa-cog');
  });
  socket.on('RF:WATER_PUMP:ON', function () {
    relayWaterPump.on();
    sendConfirmation('Water Pump On', 'Recirculating water pump been has been started.','fal fa-cog fa-spin');
  });
  socket.on('RF:WATER_HEATER:OFF', function () {
    relayWaterHeater.off();
    sendConfirmation('Water Heater Off', 'Water heater been has been turned off.','fal fa-water');
  });
  socket.on('RF:WATER_HEATER:ON', function () {
    relayWaterHeater.on();
    sendConfirmation('Water Heater On', 'Water heater been has been turned on.','fal fa-water fa-spin');
  });
  socket.on('RF:AIR_PUMP:OFF', function () {
    sendRF(config.RF.AirPump.off);
    sendConfirmation('Air Pump Off', 'Air pump been has been turned off.','fal fa-wind');
  });
  socket.on('RF:AIR_PUMP:ON', function () {
    sendRF(config.RF.AirPump.on);
    sendConfirmation('Air Pump On', 'Air pump been has been turned on.','fal fa-wind fa-spin');
  });
  socket.on('RF:DEHUMIDIFIER:OFF', function () {
    sendRF(config.RF.Dehumidifier.off);
    sendConfirmation('De-Humidifier Off', 'De-Humidifier been has been turned off.', 'fal fa-tint-slash');
  });
  socket.on('RF:DEHUMIDIFIER:ON', function () {
    sendRF(config.RF.Dehumidifier.on);
    sendConfirmation('De-Humidifier On', 'De-Humidifier been has been turned on.', 'fal fa-tint-slash fa-spin');
  });
  socket.on('RF:HUMIDIFIER:LOW', function () {
    sendRF(config.RF.Humidifier.low);
    setTimeout(function () {
      sendRF(config.RF.Humidifier.off_high);
    }, 500);
    sendConfirmation('Humidifier Low', 'Humidifier been has been turned on low.', 'fal fa-tint fa-spin');
  });
  socket.on('RF:HUMIDIFIER:HIGH', function () {
    sendRF(config.RF.Humidifier.high);
    setTimeout(function () {
      sendRF(config.RF.Humidifier.low);
    }, 500);
    sendConfirmation('Humidifier High', 'Humidifier been has been turned on high.', 'fal fa-tint fa-pulse');
  });
  socket.on('RF:HUMIDIFIER:OFF', function () {
    sendRF(config.RF.Humidifier.off_low);
    setTimeout(function () {
      sendRF(config.RF.Humidifier.off_high);
    }, 500);
    sendConfirmation('Humidifier Off', 'Humidifier been has been turned off.', 'fal fa-tint');
  });
  socket.on('RF:HEATER:OFF', function () {
    sendRF(config.RF.Heater.off);
    sendConfirmation('Air Heater On', 'Air heater has been has been turned on.', 'fal fa-heat');
  });
  socket.on('RF:HEATER:ON', function () {
    sendRF(config.RF.Heater.on);
    sendConfirmation('Air Heater Off', 'Air heater has been has been turned off.', 'fal fa-heat fa-spin');
  });
  socket.on('RF:AIR_EXTRACT_FAN:OFF', function () {
    sendRF(config.RF.AirExtractFan.off);
    sendConfirmation('Air Extract Off', 'Air extract fans have been has been turned off.', 'fal fa-fan');
  });
  socket.on('RF:AIR_EXTRACT_FAN:ON', function () {
    sendRF(config.RF.AirExtractFan.on);
    sendConfirmation('Air Extract On', 'Air extract fans have been has been turned on.', 'fal fa-fan fa-spin');
  });
  socket.on('RF:AIR_INTAKE_FAN:OFF', function () {
    sendRF(config.RF.AirIntakeFan.off);
    sendConfirmation('Air Intake Off', 'Air intake fans have been has been turned off.','fal fa-hurricane');
  });
  socket.on('RF:AIR_INTAKE_FAN:LOW', function () {
    sendRF(config.RF.AirIntakeFan.low);
    sendConfirmation('Air Intake Low', 'Air intake fans have been has been turned low.','fal fa-hurricane fa-spin');
  });
  socket.on('RF:AIR_INTAKE_FAN:HIGH', function () {
    sendRF(config.RF.AirIntakeFan.high);
    sendConfirmation('Air Intake High', 'Air intake fans have been has been turned high.','fal fa-hurricane fa-pulse');
  });
  socket.on('RF:AIR_MOVEMENT_FAN:OFF', function () {
    sendRF(config.RF.AirMovementFan.off);
    sendConfirmation('Air Movement Off', 'Air oscillating fans have been has been turned off.','fal fa-fan-table');
  });
  socket.on('RF:AIR_MOVEMENT_FAN:ON', function () {
    sendRF(config.RF.AirMovementFan.on);
    sendConfirmation('Air Movement On', 'Air oscillating fans have been has been turned on.','fal fa-fan-table fa-spin');
  });
  socket.on('RF:LIGHT:OFF', function () {
    sendRF(config.RF.Light.off);
    sendConfirmation('Lights Off', 'Lights have been has been turned off.','fal fa-lightbulb');
  });
  socket.on('RF:LIGHT:ON', function () {
    sendRF(config.RF.Light.on);
    sendConfirmation('Lights On', 'Lights have been has been turned on.','fal fa-lightbulb-on fa-spin');
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


function getPumpConfig(id) {
  return { "time":1, "speed":125}; // @todo determine from database
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
  console.warn("** ALERT ** [ARDUINO] " + msg, payload != undefined ? payload : "");
}

function log(msg, payload) {
  if (config.debug) console.log("[ARDUINO] " + msg, payload != undefined ? payload : "");
}

