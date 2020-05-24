const io = require('socket.io-client');
const five = require('johnny-five');
const config = require('./MintyConfig');
const MintyIO = require('./MintyIO');
const Serialport = require("serialport");
const MintyHydro = require('./MintyHydroBox');
const MintyDataSource = require('./MintyDataSource');

const serial = new Serialport(config.serialPort, {
  baudRate: 9600,
  buffersize: 1
});
let board = new five.Board({
    port: serial,
    repl: false,
    debug: config.debug
});

function shutDown() {
  if (pumpCalMag) pumpCalMag.stop();
  if (pumpFloraMicro) pumpFloraMicro.stop();
  if (pumpFloraGrow) pumpFloraGrow.stop();
  if (pumpFloraBloom) pumpFloraBloom.stop();
  if (pumpHydroGuard) pumpHydroGuard.stop();
  if (pumpSpare) pumpSpare.stop();
  if (pumpPhUp) pumpPhUp.stop();
  if (pumpPhDown) pumpPhDown.stop();
  sendRF(config.MINTY_FDD.OFF);
  MintyDataSource.shutDown();
  process.exit(1);
}

board.on('exit', function () {
  shutDown();
});
board.on("error", function(msg) {
  warn("Arduino Not Responding : ", msg);
  Serialport.list().then(ports => {
    warn("PORTS:", ports);
  });  
  // shutDown();
});

// 240v Relays
global.relayWaterPump = null;
global.relayWaterHeater = null;

log("Minty-Hydro connecting to socket server: " + config.url);
const mintyIO = new MintyIO(board, serial);
const socket = mintyIO.getSocket();
MintyDataSource.initDatabase(mintyIO);
MintyHydro.setIO(mintyIO);
MintyHydro.runAfterTimeout(MintyDataSource);

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
      MintyHydro.reading.temp.air = this.thermometer.celsius;
      MintyHydro.reading.humidity = this.hygrometer.relativeHumidity;
      MintyHydro.reading.pressure = this.barometer.pressure;
      MintyDataSource.insert({ name:'HTS:BME280:HUMIDITY:RH', value:this.hygrometer.relativeHumidity, table:'READING' });
      MintyDataSource.insert({ name:'HTS:BME280:TEMP:CELSIUS', value:this.thermometer.celsius, table:'READING' });
      MintyDataSource.insert({ name:'HTS:BME280:PRESSURE', value:this.barometer.pressure, table:'READING' });
      socketEmit('HTS:BME280:HUMIDITY:RH', this.hygrometer.relativeHumidity);
      socketEmit('HTS:BME280:TEMP:CELSIUS', this.thermometer.celsius);
      socketEmit('HTS:BME280:PRESSURE', this.barometer.pressure);
  });

  /* Water Level Switches */
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

  /* 240v Relays */
  relayWaterPump = new five.Relay({
    pin: config.HWR_RELAY_ONE_PIN, type: "NC"
  });
  relayWaterHeater = new five.Relay({
    pin: config.HWR_RELAY_TWO_PIN, type: "NC"
  });

  
  /* Peristaltic Dosing Pumps */
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

  function pumpDose(pump, opts) {
    log("Dosing Pump " + pump, opts);
    try {
      pump.minty_opts = opts;
      let time = opts.amount ? ( parseFloat(opts.time) *  parseFloat(opts.amount)) :  parseFloat(opts.time);
      let runningPump = pump;
      setTimeout(function () {
        log("After timeout - stopping pump ", runningPump);
        pumpStop(runningPump);
      }, time);
      pump.start(opts.speed);
      sendConfirmation(pump.name + ' Dosing Started', 'Pumping ' + (opts.amount ? opts.amount : 1)  + 'ml', 'fal fa-cog fa-spin');
    } catch (e) {
      pump.stop();
    }
  }

  function pumpStart(pump, opts) {
      log("Starting Pump". opts);
      try {
        pump.minty_opts = opts;
        pump.start(opts ? opts.speed : undefined);
        sendConfirmation(pump.name + ' Pump Started', 'The ' + pump.name + ' pump has been started.','fal fa-cog fa-spin');
      } catch (e) {
        warn("Error Starting pump: " + e, pump);
        pump.stop();
        sendConfirmation(pump.name + ' Pump Failed', 'The ' + pump.name + ' pump Failed to start.','fal fa-exclamation-triangle');
      }
  }

  function pumpStop(pump) {
    log("Stopping Pump", pump.minty_opts);
    try {
      pump.stop();
      socketEmit('PUMP:DOSING:STOPPED', pump.minty_opts);
      sendConfirmation(pump.name + ' Pump Stopped', 'The ' + pump.name + ' pump has been stopped.','fal fa-cog');
    } catch (e) {
      warn("Error stopping pump: " + e, pump);
      pump.stop();
    }
  }

  function sendAutoOffRfCommand(code, opts) {
    log("Sending Auto Off RF Code ", (opts ? opts : code) )
    try {
      setTimeout(function () {
        sendRF(config.MINTY_FDD.OFF);
        sendConfirmation((opts.name ? opts.name : code) + ' Pump Stopped', 'The auto running pump has been stopped.', 'fal fa-cog');
      }.bind(this), opts.time);
      sendRF(code);
      sendConfirmation((opts.name ? opts.name : code) + ' Pump Auto Running', 'Pump auto running for (' + opts.time + ' seconds)', 'fal fa-cog fa-spin');
    } catch (e) {
      sendRF(config.MINTY_FDD.OFF);
    }
  }

  function sendConfirmation(title, text, icon) {
    socketEmit('ARDUINO:CONFIM', { title, text, icon });
  }

  /* ATLAS Calibration Routines */
  socket.on('CALIBRATE:EC:START', function () {
    MintyHydro.setPollAllSensors(false);
    MintyHydro.pollEC();
  });
  socket.on('CALIBRATE:EC:STOP', function () {
    MintyHydro.setPollAllSensors(true);
    MintyHydro.poll();
  });
  socket.on('CALIBRATE:PH:START', function () {
    MintyHydro.setPollAllSensors(false);
    MintyHydro.pollPH();
  });
  socket.on('CALIBRATE:PH:STOP', function () {
    MintyHydro.setPollAllSensors(true);
    MintyHydro.poll();
  });

  socket.on('CALIBRATE:EC:DRY', function () {
    let command = "cal,dry";
    sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, command, function (temp) {
      sendConfirmation(command, 'E.C. Dry Calibration Completed.', 'fal fa-code-branch');
    });
  });
  socket.on('CALIBRATE:EC:LOW', function () {
    let command = "cal,low,12880";
    sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, command, function (temp) {
      sendConfirmation(command, 'E.C. Low Calibration Completed.', 'fal fa-code-branch');
    });
  });
  socket.on('CALIBRATE:EC:HIGH', function () {
    let command = "cal,high,800000";
    sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, command, function (temp) {
      sendConfirmation("E.C. Calibration Complete", 'The EC probe has been successfully calibrated.', 'fas fa-check-circle');
    });
  });
  socket.on('CALIBRATE:PH:MID', function () {
    let command = "cal,mid,7";
    sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, command, function (temp) {
      sendConfirmation(command, 'P.H. Mid Calibration Completed.', 'fal fa-code-branch');
    });
  });
  socket.on('CALIBRATE:PH:LOW', function () {
    let command = "cal,low,4";
    sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, command, function (temp) {
      sendConfirmation(command, 'P.H. Low Calibration Completed.', 'fal fa-code-branch');
    });
  });
  socket.on('CALIBRATE:PH:HIGH', function () {
    let command = "cal,high,10";
    sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, command, function (temp) {
      sendConfirmation("P.H. Calibration Complete", 'The pH probe has been successfully calibrated.', 'fas fa-check-circle');
    });
  });

  socket.on('PUMP:PH_UP:STATE', function (opts) {
    if (opts.value == 'ON') {
      pumpStart(pumpPhUp, opts);
    } else if (opts.value == 'OFF') {
      pumpStop(pumpPhUp);
    }
  });
  socket.on('PUMP:PH_UP:DOSE', function (opts) {
    pumpDose(pumpPhUp, opts);
  });
  socket.on('PUMP:PH_DOWN:DOSE', function (opts) {
    pumpDose(pumpPhDown, opts);
  });
  socket.on('PUMP:PH_DOWN:STATE', function (opts) {
    if (opts.value == 'ON') {
      pumpStart(pumpPhDown, opts);
    } else if (opts.value == 'OFF') {
      pumpStop(pumpPhDown);
    }
  });
  socket.on('PUMP:CALMAG:DOSE', function (opts) {
    pumpDose(pumpCalMag, opts);
  });
  socket.on('PUMP:CALMAG:STATE', function (opts) {
    if (opts.value == 'ON') {
      pumpStart(pumpCalMag, opts);
    } else if (opts.value == 'OFF') {
      pumpStop(pumpCalMag);
    }
  });
  socket.on('PUMP:HYDROGUARD:DOSE', function (opts) {
    pumpDose(pumpHydroGuard, opts);
  });
  socket.on('PUMP:HYDROGUARD:STATE', function (opts) {
    if (opts.value == 'ON') {
      pumpStart(pumpHydroGuard, opts);
    } else if (opts.value == 'OFF') {
      pumpStop(pumpHydroGuard);
    }
  });
  socket.on('PUMP:FLORA_MICRO:DOSE', function (opts) {
    pumpDose(pumpFloraMicro, opts);
  });
  socket.on('PUMP:FLORA_MICRO:STATE', function (opts) {
    if (opts.value == 'ON') {
      pumpStart(pumpFloraMicro, opts);
    } else if (opts.value == 'OFF') {
      pumpStop(pumpFloraMicro);
    }
  });
  socket.on('PUMP:FLORA_GROW:DOSE', function (opts) {
    pumpDose(pumpFloraGrow, opts);
  });
  socket.on('PUMP:FLORA_GROW:STATE', function (opts) {
    if (opts.value == 'ON') {
      pumpStart(pumpFloraGrow, opts);
    } else if (opts.value == 'OFF') {
      pumpStop(pumpFloraGrow);
    }
  });
  socket.on('PUMP:FLORA_BLOOM:DOSE', function (opts) {
    pumpDose(pumpFloraBloom, opts);
  });
  socket.on('PUMP:FLORA_BLOOM:STATE', function (opts) {
    if (opts.value == 'ON') {
      pumpStart(pumpFloraBloom, opts);
    } else if (opts.value == 'OFF') {
      pumpStop(pumpFloraBloom);
    }
  });
  socket.on('PUMP:SPARE:DOSE', function (opts) {
    pumpDose(pumpSpare, opts);
  });
  socket.on('PUMP:SPARE:STATE', function (opts) {
    if (opts.value == 'ON') {
      pumpStart(pumpSpare, opts);
    } else if (opts.value == 'OFF') {
      pumpStop(pumpSpare);
    }
  });
  socket.on('PUMP:DRAIN:DOSE', function (opts) {
    sendAutoOffRfCommand(config.MINTY_FDD.DRAIN, opts);
  });
  socket.on('PUMP:DRAIN:STATE', function (opts) {
    MintyHydro.processDrainPump(opts);
  });
  socket.on('PUMP:FILL:DOSE', function (opts) {
    sendAutoOffRfCommand(config.MINTY_FDD.FILL, opts);
  });
  socket.on('PUMP:FILL:STATE', function (opts) {
    MintyHydro.processFillPump(opts);
  });
  socket.on('PUMP:MAGMIX:DOSE', function (opts) {
    sendAutoOffRfCommand(config.MINTY_FDD.MAGMIX, opts);
  });
  socket.on('PUMP:MAGMIX:STATE', function (opts) {
    if (opts.value == 'ON') {
      sendRF(config.MINTY_FDD.MAGMIX);
      sendConfirmation('Mag Mix Fans On', 'The magnetic mixing fans have been turned on.', 'fal fa-magic fa-spin');
    } else if (opts.value == 'OFF') {
      sendRF(config.MINTY_FDD.OFF);
      sendConfirmation('Mag Mix Fans Off', 'The magnetic mixing fans have been turned off.', 'fal fa-magic');
    }
  });
  socket.on('PUMP:DRIP:DOSE', function (opts) {
    sendAutoOffRfCommand(config.MINTY_FDD.DRIP, opts);
  });
  socket.on('PUMP:DRIP:STATE', function (opts) {
    MintyHydro.processDripPump(opts);
  });

  waterLevelTankHigh.on("open", function () {
    MintyDataSource.insert({ name: 'WLS:TANK:HIGH', value: 'OPEN', table: 'READING' });
    socketEmit('WLS:TANK:HIGH:OPEN');
  });
  waterLevelTankHigh.on("close", function () {
    MintyDataSource.insert({ name: 'WLS:TANK:HIGH', value: 'CLOSE', table: 'READING' });
    socketEmit('WLS:TANK:HIGH:CLOSE');
  });
  waterLevelTankLow.on("open", function () {
    MintyDataSource.insert({ name: 'WLS:TANK:LOW', value: 'OPEN', table: 'READING' });
    socketEmit('WLS:TANK:LOW:OPEN');
  });
  waterLevelTankLow.on("close", function () {
    MintyDataSource.insert({ name: 'WLS:TANK:LOW', value: 'CLOSE', table: 'READING' });
    socketEmit('WLS:TANK:LOW:CLOSE');
  });
  waterLevelResHigh.on("open", function () {
    MintyDataSource.insert({ name: 'WLS:RES:HIGH', value: 'OPEN', table: 'READING' });
    socketEmit('WLS:RES:HIGH:OPEN');
  });
  waterLevelResHigh.on("close", function () {
    MintyDataSource.insert({ name: 'WLS:RES:HIGH', value: 'CLOSE', table: 'READING' });
    socketEmit('WLS:RES:HIGH:CLOSE');
  });
  waterLevelResLow.on("open", function () {
    MintyDataSource.insert({ name: 'WLS:RES:LOW', value: 'OPEN', table: 'READING' });
    socketEmit('WLS:RES:LOW:OPEN');
  });
  waterLevelResLow.on("close", function () {
    MintyDataSource.insert({ name: 'WLS:RES:LOW', value: 'CLOSE', table: 'READING' });
    socketEmit('WLS:RES:LOW:CLOSE');
  });
  socket.on('BASE_NUTRIENTS:UPDATE', function (row) {
    sendConfirmation('Base Nutrients Updated', 'Base nutrients data has been update. Dosing amounts recalculated.', 'fal balance-scale');
  });
  socket.on('PUMP:RECIRCULATING:STATE', function (opts) {
    MintyHydro.processWaterPump(opts);
  });
  socket.on('CONTROL:WATER_PUMP:STATE', function (opts) {
    MintyHydro.processWaterPump(opts);
  });
  socket.on('CONTROL:WATER_HEATER:STATE', function (opts) {
    MintyHydro.processWaterHeater(opts);
  });
  socket.on('CONTROL:AIR_PUMP:STATE', function (opts) {
    MintyHydro.processAirPump(opts);    
  });
  socket.on('CONTROL:DEHUMIDIFIER:STATE', function (opts) {
    MintyHydro.processDeHumidifier(opts);
  });
  socket.on('CONTROL:HUMIDIFIER:STATE', function (opts) {
    MintyHydro.processHumidifier(opts);
  });
  socket.on('CONTROL:HEATER:STATE', function (opts) {
    MintyHydro.processAirHeater(opts);
  });
  socket.on('CONTROL:AIR_EXTRACT_FAN:STATE', function (opts) {
    MintyHydro.processAirExtractState(opts);
  });
  socket.on('CONTROL:AIR_INTAKE_FAN:STATE', function (opts) {
    MintyHydro.processAirIntakeState(opts);
  });
  socket.on('CONTROL:AIR_MOVEMENT_FAN_A:STATE', function (opts) {
    MintyHydro.processAirMovementFanA(opts);

  });
  socket.on('CONTROL:AIR_MOVEMENT_FAN_B:STATE', function (opts) {
    MintyHydro.processAirMovementFanB(opts);

  });
  socket.on('CONTROL:LIGHT:STATE', function (opts) {
    MintyHydro.processLightState(opts);
  });

  socket.on('CONTROL:CAMERA:STATE', function (opts) {
    if (opts.value == 'ON') {
      sendRF(config.RF.Camera.on);
      sendConfirmation('Camera On', 'Camera has been turned on.', 'fal fa-lightbulb-on fa-spin');
    } else if (opts.value == 'OFF') {
      sendRF(config.RF.Camera.off);
      sendConfirmation('Camera Off', 'Camera has been turned off.', 'fal fa-lightbulb');
    }
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


  /* Settings Section Database Updates */
  socket.on('SETTINGS:SAVE:STATE', function (config) {
    MintyDataSource.setConfig(config);
  });

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

function warn(msg, payload) {
  console.warn("[" + (new Date()).toUTCString() + "]  ** ALERT ** [ARDUINO] " + msg, payload != undefined ? payload : "");
}

function log(msg, payload) {
  if (config.debug) console.log("[" + (new Date()).toUTCString() + "]  [ARDUINO] " + msg, payload != undefined ? payload : "");
}

module.exports = this;