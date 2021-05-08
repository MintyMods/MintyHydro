const config = require('./MintyConfig');
const hydroTarget = require('./MintyHydroTargets');
const MintyDataSource = require('./MintyDataSource');
const MintyArduino = require('./MintyArduino');

let pollingTimer = null;
let pollAllSensors = false;

const MintyHydroBox = {
  io: null,
  defaultsLoaded: false,
  shutdown: false,
  reading: {
    ph: null,
    ec: null,
    temp: {
      air: null,
      water: null
    },
    humidity: null,
    pressure: null
  },

  setIO: function (mintyIO) {
    this.io = mintyIO;
  },

  sendAtlasStatusCode: function () {
    code = ['O,?'.charCodeAt(0),'O,?'.charCodeAt(1),'O,?'.charCodeAt(2)];
    this.io.sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, code, function (value) {
      log("Atlas Stats : ", value);
      this.sendConfirmation('ATLAS', JSON.stringify(value), 'fal fa-cog fa-eye');
    }.bind(this));
  },

  poll: function () {
    log("----<<<< Minty Hydro Main Cycle Ping >>>>---- ");
    // this.processControlDefaults();
    if (this.io.board.io.isReady) {
      this.pollAtlasSensors();
    } else {
      warn("Skipping Sensor Polling");
    }
    this.processAutomation();
    this.runAfterTimeout();
  },

  processAutomation: function () {
    log('Getting Rows ');
    MintyDataSource.getActiveSchedules(function (rows) {
      for (var key in rows) {
        let row = rows[key];
        if (row.condition) {
          this.processConditionalState(row, config);
        } else {
          this.processResourceState(row);
        }
      }
      log('Rows ', rows);
    }.bind(this));
  },

  processControlDefaults: function() {
    MintyDataSource.getActiveControlStates(function (rows) {
      for (var key in rows) {
        let row = rows[key];
        if (row.value == 'ON' || row.value == 'OFF') {
          row.suppress = true;
          this.processResourceState(row);
        }
      }
    }.bind(this));
  },

  processAutomationOriginal: function () {
    MintyDataSource.getActiveControlStates(function (rows) {
      let config = {};
      for (var key in rows) {
        let row = rows[key];
        if (row.value == 'ON' || row.value == 'OFF') {
          this.processResourceState(row);
        } else {
          config[row.name] = row;
        }
      }
      MintyDataSource.getActiveSchedules(function (rows) {
        for (var key in rows) {
          let row = rows[key];
          if (row.condition) {
            this.processConditionalState(row, config);
          } else {
            this.processResourceState(row);
          }
          delete config[row.resource + 'STATE'];
        }
        for (var key in config) {
          let row = config[key];
          row.value = 'OFF';
          this.processResourceState(row);
        }
      }.bind(this));
    }.bind(this));
  },

  runAfterTimeout: function () {
    if (pollingTimer) {
      clearTimeout(pollingTimer);
    }
    pollingTimer = setTimeout(function () { this.poll() }.bind(this), config.tick.mintyhydro);
  },

  processResourceState: function (opts) {
    if (opts.value == 'AUTO') {
      opts.value = opts.trigger.toUpperCase();
    }
    if (!opts.name) {
      if (opts.resource.endsWith('STATE')) {
        opts.name = opts.resource;
      } else {
        opts.name = opts.resource + 'STATE';
      }
    }

    switch (opts.name) {
      case "CONTROL:WATER_HEATER:STATE":
        this.processWaterHeater(opts);
        break;
      case "CONTROL:WATER_PUMP:STATE":
        this.processWaterPump(opts);
        break;
      case "CONTROL:LIGHT:STATE":
        this.processLightState(opts);
        break;
      case "CONTROL:CAMERA:STATE":
        this.processCameraState(opts);
        break;
      case "CONTROL:AIR_EXTRACT_FAN:STATE":
        this.processAirExtractState(opts);
        break;
      case "CONTROL:AIR_INTAKE_FAN:STATE":
        this.processAirIntakeState(opts);
        break;
      case "CONTROL:AIR_MOVEMENT_FAN_A:STATE":
        this.processAirMovementFanA(opts);
        break;
      case "CONTROL:AIR_MOVEMENT_FAN_B:STATE":
        this.processAirMovementFanB(opts);
        break;
      case "CONTROL:HEATER:STATE":
        this.processAirHeater(opts);
        break;
      case "CONTROL:HUMIDIFIER:STATE":
        this.processHumidifier(opts);
        break;
      case "CONTROL:DEHUMIDIFIER:STATE":
        this.processDeHumidifier(opts);
        break;
      case "CONTROL:AIR_PUMP:STATE":
        this.processAirPump(opts);
        break;
      case "PUMP:FILL:STATE":
        this.processFillPump(opts);
        break;
      case "PUMP:DRAIN:STATE":
        this.processDrainPump(opts);
        break;
      case "PUMP:DRIP:STATE":
        this.processDripPump(opts);
        break;
      case "PUMP:MAGMIX:STATE":
        this.processMagMixPump(opts);
        break;
    }
    this.sendBackGroundConfirmation('Background Process', 'Processed:' + opts.name, 'fal fa-cog fa-spin', opts);
  },

  processWaterPump: function (opts) {
    if (opts.value == 'ON') {
      relayWaterPump.on();
      this.sendConfirmation('Water Pump On', 'Recirculating water pump has been started.', 'fal fad-server', opts);
    } else if (opts.value == 'OFF') {
      relayWaterPump.off();
      this.sendConfirmation('Water Pump Off', 'Recirculating water pump has been stopped.', 'fal fa-cog', opts);
    }
  },

  processWaterHeater: function (opts) {
    if (opts.value == 'ON') {
      relayWaterHeater.on();
      this.sendConfirmation('Water Heater On', 'Water heater has been turned on.', 'fal fa-water fa-beat', opts);
    } else if (opts.value == 'OFF') {
      relayWaterHeater.off();
      this.sendConfirmation('Water Heater Off', 'Water heater has been turned off.', 'fal fa-water', opts);
    }
  },

  processDripPump: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.MINTY_FDD.DRIP);
      this.sendConfirmation('Drip Pumps On', 'The drip pumps have been turned on.', 'fal fa-cog fa-spin', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.MINTY_FDD.OFF);
      this.sendConfirmation('Drip Pumps On', 'The drip pumps have been turned off.', 'fal fa-cog ', opts);
    }
  },

  processDrainPump: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.MINTY_FDD.DRAIN);
      this.sendConfirmation('Drain Pumps On', 'The drain pumps have been turned on.', 'fal fa-cog fa-spin', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.MINTY_FDD.OFF);
      this.sendConfirmation('Drain Pumps Off', 'The drain pumps have been turned off.', 'fal fa-cog', opts);
    }
  },

  processFillPump: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.MINTY_FDD.FILL);
      this.sendConfirmation('Fill Pump On', 'The fill pump has been turned on.', 'fal fa-cog fa-spin', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.MINTY_FDD.OFF);
      this.sendConfirmation('Fill Pump Off', 'The fill pump has been turned off.', 'fal fa-cog ', opts);
    }
  },

  processMagMixPump: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.MINTY_FDD.MAGMIX);
      this.sendConfirmation('MagMix On', 'The mag mixers been turned on.', 'fal fa-cog fa-beat', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.MINTY_FDD.OFF);
      this.sendConfirmation('MagMix Off', 'The mag mixers have been turned off.', 'fal fa-cog ', opts);
    }
  },

  processAirPump: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.RF.AirPump.on);
      this.sendConfirmation('Air Pump On', 'Air pump has been turned on.', 'fal fa-wind fa-beat', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.RF.AirPump.off);
      this.sendConfirmation('Air Pump Off', 'Air pump has been turned off.', 'fal fa-wind', opts);
    }
  },

  processDeHumidifier: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.RF.Dehumidifier.on);
      this.sendConfirmation('De-Humidifier On', 'De-Humidifier has been turned on.', 'fal fa-tint-slash fa-beat', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.RF.Dehumidifier.off);
      this.sendConfirmation('De-Humidifier Off', 'De-Humidifier has been turned off.', 'fal fa-tint-slash', opts);
    }
  },

  processHumidifier: function (opts) {
    if (opts.value == 'LOW') {
      this.sendRF(config.RF.Humidifier.low);
      setTimeout(function () {
        this.sendRF(config.RF.Humidifier.off_high);
      }.bind(this), 500);
      this.sendConfirmation('Humidifier Low', 'Humidifier has been turned on low.', 'fal fa-tint fa-spin', opts);
    } else if (opts.value == 'HIGH') {
      this.sendRF(config.RF.Humidifier.high);
      setTimeout(function () {
        this.sendRF(config.RF.Humidifier.low);
      }.bind(this), 500);
      this.sendConfirmation('Humidifier High', 'Humidifier has been turned on high.', 'fal fa-tint fa-pulse', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.RF.Humidifier.off_low);
      setTimeout(function () {
        this.sendRF(config.RF.Humidifier.off_high);
      }.bind(this), 500);
      this.sendConfirmation('Humidifier Off', 'Humidifier has been turned off.', 'fal fa-tint', opts);
    }
  },

  processAirHeater: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.RF.Heater.on);
      this.sendConfirmation('Air Heater Off', 'Air heater has been turned off.', 'fal fa-heat fa-beat', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.RF.Heater.off);
      this.sendConfirmation('Air Heater On', 'Air heater has been turned on.', 'fal fa-heat', opts);
    }
  },

  processAirMovementFanB: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.RF.AirMovementFanB.on);
      this.sendConfirmation('Air Movement B On', 'Air oscillating fan B has been turned on.', 'fal fa-fan-table fa-beat', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.RF.AirMovementFanB.off);
      this.sendConfirmation('Air Movement B Off', 'Air oscillating fan B has been turned off.', 'fal fa-fan-table', opts);
    }
  },

  processAirMovementFanA: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.RF.AirMovementFanA.on);
      this.sendConfirmation('Air Movement A On', 'Air oscillating fan A has been turned on.', 'fal fa-fan-table fa-beat', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.RF.AirMovementFanA.off);
      this.sendConfirmation('Air Movement A Off', 'Air oscillating fan A has been turned off.', 'fal fa-fan-table', opts);
    }
  },

  processAirIntakeState: function (opts) {
    if (opts.value == 'LOW') {
      this.sendRF(config.RF.AirIntakeFan.low);
      this.sendConfirmation('Air Intake Low', 'Air intake fans has been turned low.', 'fal fa-hurricane fa-spin', opts);
    } else if (opts.value == 'HIGH') {
      this.sendRF(config.RF.AirIntakeFan.high);
      this.sendConfirmation('Air Intake High', 'Air intake fans has been turned high.', 'fal fa-hurricane fa-pulse', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.RF.AirIntakeFan.off);
      this.sendConfirmation('Air Intake Off', 'Air intake fans has been turned off.', 'fal fa-hurricane', opts);
    }
  },

  processAirExtractState: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.RF.AirExtractFan.on);
      this.sendConfirmation('Air Extract On', 'Air extract fans have been turned on.', 'fal fa-fan fa-spin', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.RF.AirExtractFan.off);
      this.sendConfirmation('Air Extract Off', 'Air extract fans have been turned off.', 'fal fa-fan', opts);
    }
  },

  processLightState: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.RF.Light.on);
      this.sendConfirmation('Lights On', 'Lights have been turned on.', 'fal fa-lightbulb-on fa-beat', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.RF.Light.off);
      this.sendConfirmation('Lights Off', 'Lights have been turned off.', 'fal fa-lightbulb', opts);
    }
  },

  processCameraState: function (opts) {
    if (opts.value == 'ON') {
      this.sendRF(config.RF.Camera.on);
      this.sendConfirmation('Camera On', 'Camera has been turned on.', 'fal fa-camera-home fa-beat', opts);
    } else if (opts.value == 'OFF') {
      this.sendRF(config.RF.Camera.off);
      this.sendConfirmation('Camera Off', 'Camera has been turned off.', 'fal fa-camera-home', opts);
    }
  },

  processConditionalState: function (row, config) {
    let opts = {
      config, row,
      suppress:true,
      "condition": row.condition,
      "resource": row.resource + 'STATE',
      "trigger": row.trigger,
      "value": row.trigger.replace('trigger:', '').toUpperCase(),
    }
    switch (row.condition) {
      case "TEMP:AIR:HIGH":
      case "TEMP:AIR:LOW":
        this.processAirTemp(opts);
        break;
      case "TEMP:WATER:HIGH":
      case "TEMP:WATER:LOW":
        this.processWaterTemp(opts);
        break;
      case "HUMIDITY:AIR:HIGH":
      case "HUMIDITY:AIR:LOW":
        this.processHumidity(opts);
        break;
      case "PH:WATER:HIGH":
      case "PH:WATER:LOW":
        this.processWaterPH(opts);
        break;
      case "EC:WATER:HIGH":
      case "EC:WATER:LOW":
        this.processWaterEC(opts);
        break;
      case "LEVEL:TANK:HIGH":
        this.processWaterLevelHighTank(opts);
        break;
      case "LEVEL:TANK:MEDIUM":
        this.processWaterLevelMediumTank(opts);
        break;
      case "LEVEL:TANK:LOW":
        this.processWaterLevelLowTank(opts);
        break;
      case "LEVEL:RES:HIGH":
        this.processWaterLevelHighRes(opts);
        break;
      case "LEVEL:RES:HIGH:MEDIUM":
        this.processWaterLevelMediumRes(opts);
        break;
      case "LEVEL:RES:LOW":
        this.processWaterLevelLowRes(opts);
        break;
      default:
        warn("UNKNOWN - Condition " + row.condition, row);
    }
  },

  processAirTemp: function (opts) {
    getSliderValue('CONTROL:AIR:TEMPERATURE:SLIDER', function(reading){
      log('Processing Airtemp', reading);
      let low = reading[0];
      let high = reading[1];
      getLastReading('HTS:BME280:TEMP:CELSIUS', function(current){
        log("Current Air Temp: ",current);
        log("Reading Air Temp: ", reading);
        if (opts.condition == 'TEMP:AIR:HIGH') {
          this.processResourceState((parseFloat(current) >= parseFloat(high)) ? opts : toggleOptsValue(opts));
        } else if (opts.condition == 'TEMP:AIR:LOW') {
          this.processResourceState((parseFloat(current) <= parseFloat(low)) ? opts : toggleOptsValue(opts));
        }
      }.bind(this));
    }.bind(this));
  },
  processWaterTemp: function (opts) {
    getSliderValue('CONTROL:WATER:TEMPERATURE:SLIDER', function(reading){
      log('Processing Water Temp', reading);
      let low = reading[0];
      let high = reading[1];
      getLastReading('I2C:TEMP:RESULT', function(current){
        log("Current Water Temp: " + current, this);
        log("Reading Water Temp: " + reading);
        if (opts.condition == 'TEMP:WATER:HIGH') {
          this.processResourceState((parseFloat(current) >= parseFloat(high)) ? opts : toggleOptsValue(opts));
        } else if (opts.condition == 'TEMP:WATER:LOW') {
          this.processResourceState((parseFloat(current) <= parseFloat(low)) ? opts : toggleOptsValue(opts));
        }
      }.bind(this));
    }.bind(this));
  },
  processHumidity: function (opts) {
    getSliderValue('CONTROL:AIR:HUMIDITY:SLIDER', function(reading){
      log('Processing Humidity', reading);
      let low = reading[0];
      let high = reading[1];
      getLastReading('HTS:BME280:HUMIDITY:RH', function(current){
        log("Current Humidity: " + current, this);
        log("Reading Humidity: " + reading);
        if (opts.condition == 'HUMIDITY:AIR:HIGH') {
          this.processResourceState((parseFloat(current) >= parseFloat(high)) ? opts : toggleOptsValue(opts));
        } else if (opts.condition == 'HUMIDITY:AIR:LOW') {
          this.processResourceState((parseFloat(current) <= parseFloat(low)) ? opts : toggleOptsValue(opts));
        }
      }.bind(this));
    }.bind(this));
  },
  processWaterPH: function (opts) {
    getSliderValue('CONTROL:WATER:PH:SLIDER', function(reading){
      log('Processing PH', reading);
      let low = reading[0];
      let high = reading[1];
      getLastReading('I2C:PH:RESULT', function(current){
        log("Current PH: " + current, this);
        log("Reading PH: " + reading);
        if (opts.condition == 'PH:WATER:HIGH') {
          this.processResourceState((parseFloat(current) >= parseFloat(high)) ? opts : toggleOptsValue(opts));
        } else if (opts.condition == 'PH:WATER:LOW') {
          this.processResourceState((parseFloat(current) <= parseFloat(low)) ? opts : toggleOptsValue(opts));
        }
      }.bind(this));
    }.bind(this));
  },
  processWaterEC: function (opts) {
    getSliderValue('CONTROL:WATER:EC:SLIDER', function(reading){
      log('Processing EC', reading);
      let low = reading[0];
      let high = reading[1];
      getLastReading('I2C:EC:RESULT', function(current){
        log("Current EC: " + current, this);
        log("Reading EC: " + reading);
        if (opts.condition == 'EC:WATER:HIGH') {
          this.processResourceState((parseFloat(current) >= parseFloat(high)) ? opts : toggleOptsValue(opts));
        } else if (opts.condition == 'EC:WATER:LOW') {
          this.processResourceState((parseFloat(current) <= parseFloat(low)) ? opts : toggleOptsValue(opts));
        }
      }.bind(this));
    }.bind(this));
  },

  processWaterLevelHighTank: function (opts) {
    log("@todo implement... ", opts);
    // this.processResourceState(opts);
  },

  processWaterLevelMediumTank: function (opts) {
    log("@todo implement... ", opts);
    // this.processResourceState(opts);
  },

  processWaterLevelLowTank: function (opts) {
    log("@todo implement... ", opts);
    // this.processResourceState(opts);
  },

  processWaterLevelHighRes: function (opts) {
    log("@todo implement... ", opts);
    // this.processResourceState(opts);
  },

  processWaterLevelMediumRes: function (opts) {
    log("@todo implement... ", opts);
    // this.processResourceState(opts);
  },

  processWaterLevelLowRes: function (opts) {
    log("@todo implement... ", opts);
    // this.processResourceState(opts);
  },

  setPollAllSensors: function (poll) {
    pollAllSensors = poll;
  },
 
  pollAtlasSensors: function () {
    this.io.sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (value) {
      this.reading.ph = value;
      this.io.socketEmit('I2C:PH:RESULT', value);
      MintyDataSource.insert({ name: 'I2C:PH:RESULT', value, table: 'READING' });
      this.io.sendAtlasI2C(config.I2C_ATLAS_TEMP_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (value) {
        this.reading.temp.water = value;
        this.io.socketEmit('I2C:TEMP:RESULT', value);
        MintyDataSource.insert({ name: 'I2C:TEMP:RESULT', value, table: 'READING' });
        this.io.sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (value) {
          this.reading.ec = value;
          this.io.socketEmit('I2C:EC:RESULT', value);
          MintyDataSource.insert({ name: 'I2C:EC:RESULT', value, table: 'READING' });
          //this.processSensors();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },

  processSensors: function () {
    // this.processWaterPH();
    // this.processWaterEC();
    // this.processWaterTemperature();
    // this.processAirTemperature();
    // this.processAirHumidity();
  },

  // processAirHumidity: function () {
  //   let humidity = this.reading.humidity;
  //   if (isValidHumidityReading(humidity)) {
  //     if (humidity < hydroTarget.getMinHumidity()) {
  //       // this.io.socketEmit('RF:HUMIDIFIER:HIGH');
  //       // this.io.socketEmit('RF:DEHUMIDIFIER:OFF');
  //     } else if (humidity > hydroTarget.getMinHumidity() && humidity < hydroTarget.getRecHumidity()) {
  //       // this.io.socketEmit('RF:HUMIDIFIER:OFF');
  //     } else if (humidity > hydroTarget.getRecHumidity() && humidity < hydroTarget.getMaxHumidity()) {
  //       // this.io.socketEmit('RF:HUMIDIFIER:OFF');
  //       // this.io.socketEmit('RF:DEHUMIDIFIER:ON');
  //     } else if (humidity > hydroTarget.getMaxHumidity()) {
  //       // this.io.socketEmit('RF:HUMIDIFIER:OFF');
  //       // this.io.socketEmit('RF:DEHUMIDIFIER:ON');
  //     }
  //   }
  // },

  // reCycleAir: function () {
  //   this.io.socketEmit('RF:AIR_EXTRACT_FAN:ON');
  // },

  // processAirTemperature: function () {
  //   let current = this.reading.temp.air;
  //   if (isValidTemperatureReading(current)) {
  //     if (current < hydroTarget.getMinAirTemp()) {
  //       // this.io.socketEmit('RF:HEATER:OFF'); // 'TODO ON 
  //     } else if (current > hydroTarget.getMinAirTemp()) {
  //       // this.io.socketEmit('RF:HEATER:OFF');
  //     }
  //   }
  // },

  // processWaterEC: function () {
  //   let current = this.reading.ec;
  //   if (isValidEcReading(current)) {
  //     if (current < hydroTarget.getMinEC()) {

  //     } else if (current > hydroTarget.getMaxEC()) {

  //     }
  //   }
  // },

  // processWaterPH: function () {
  //   let current = this.reading.ph;
  //   if (isValidPhReading(current)) {
  //     if (current < hydroTarget.getMinPH()) {
  //       this.phDoseUp();
  //     } else if (current > hydroTarget.getMaxPH()) {
  //       this.phDoseDown();
  //     }
  //   }
  // },

  // processWaterTemperature: function () {
  //   let current = this.reading.temp.water;
  //   if (isValidTemperatureReading(current)) {
  //     if (current < hydroTarget.getMinWaterTemp()) {
  //       // this.io.socketEmit('RF:WATER_HEATER:ON');
  //     } else {
  //       // this.io.socketEmit('RF:WATER_HEATER:OFF');
  //     }
  //   }
  // },

  // phDoseUp: function () {
  //   log("PH Up - Dosing ph+");
  //   const pump = {
  //     id: 'G',
  //     speed: 124,
  //     time: 1000,
  //   };
  //   this.io.socketEmit("PERI:PUMP:DOSE", pump);
  // },

  // phDoseDown: function () {
  //   log("PH Down - Dosing ph-");
  //   const pump = {
  //     id: 'H',
  //     speed: 124,
  //     time: 1000,
  //   };
  //   this.io.socketEmit("PERI:PUMP:DOSE", pump);
  // },

  /* CALIBRATION POLLING */
  pollTEMP: function () {
    this.io.sendAtlasI2C(config.I2C_ATLAS_TEMP_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (temp) {
      log("*** CALIBRATE:TEMP:" + temp);
      this.io.socketEmit('I2C:TEMP:RESULT', temp);
      setTimeout(function () { this.pollTEMP() }.bind(this), config.tick.calibrationPolling);
    }.bind(this));
  },

  pollEC: function () {
    this.io.sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (ec) {
      this.io.socketEmit('I2C:EC:RESULT', ec);
      log("*** CALIBRATE:EC:" + ec);
      setTimeout(function () { this.pollEC() }.bind(this), config.tick.calibrationPolling);
    }.bind(this));
  },

  pollPH: function () {
    this.io.sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (ph) {
      this.io.socketEmit('I2C:PH:RESULT', ph);
      log("*** CALIBRATE:PH:" + ph);
      setTimeout(function () { this.pollPH() }.bind(this), config.tick.calibrationPolling);
    }.bind(this));
  },

  sendConfirmation: function (title, text, icon, opts) {
    if (opts.suppress) {
      this.io.socketEmit('ARDUINO:CONFIM', { title, text, icon, type:'background' });
    } else {
      this.io.socketEmit('ARDUINO:CONFIM', { title, text, icon, type:'standard' });
    }
  },

  sendBackGroundConfirmation: function (title, text, icon, opts) {
    this.io.socketEmit('ARDUINO:CONFIM', { title, text, icon, type:'background' });
  },

  socketEmit: function (namespace, payload) {
    this.io.socketEmit(namespace, payload);
  },

  sendRF: function (code) {
    this.io.sendRF(code);
  },

  debug: function(message, payload) {
    if (config.debug)  {
      if (payload) {
        this.sendConfirmation('Debug', message + JSON.stringify(payload), 'fal fa-cog fa-eye');
      } else {
        this.sendConfirmation('Debug', message, 'fal fa-cog fa-eye');
      }
    }
  }
}

function getLastReading(sensor, callback) {
  MintyDataSource.getLastReading(sensor, function (row) {
      log("Reading ROW:",row);
      if (callback) callback(row);
  });
}
function getSliderValue(slider, callback) {
  MintyDataSource.getSliderValue(slider, function (row) {
      log("Slider ROW:",row);
      if (callback) callback(row);
  });
}

function toggleOptsValue(opts) {
  let current = opts.value;
  if (current.toUpperCase() == 'ON') {
    opts.value = 'OFF';
  } else if (current.toUpperCase() == 'OFF') {
    if (opts.condition.endsWith('LOW')) {
      opts.value = 'LOW';
    } else if (opts.condition.endsWith('HIGH')) {
      opts.value = 'HIGH';
    } else {
      opts.value = 'ON';
    }
  } else if (current.toUpperCase() == 'LOW') {
    opts.value = 'OFF';
  } else if (current.toUpperCase() == 'HIGH') {
    opts.value = 'OFF';
  } else {
    throw "Unknown Opts type " + opts.value;
  }
  log('TOGGLE was = ' + current + ', now = ' + opts.value);
  return opts;
}

function isValidHumidityReading(humidity) {
  let valid = (humidity > 30 && humidity < 100);
  if (!valid) {
    warn("Failed to parse Humidity (" + humidity + ")");
  }
  return valid;
}

function isValidPhReading(ph) {
  let valid = (ph > 0);
  if (!valid) {
    warn("Failed to parse PH (" + ph + ")");
  }
  return valid;
}

function isValidEcReading(ec) {
  let valid = (ec > 0);
  if (!valid) {
    warn("Failed to parse EC (" + ec + ")");
  }
  return valid;
}

function isValidTemperatureReading(temp) {
  let valid = (temp > 0 && temp < 40);
  if (!valid) {
    warn("Failed to parse Temperature (" + temp + ")");
  }
  return valid;
}

function warn(msg, payload) {
  console.warn("[" + (new Date()).toUTCString() + "]  ** ALERT ** [HYDRO] " + msg, payload != undefined ? payload : "");
}
function log(msg, payload) {
  if (config.debug) console.log("[" + (new Date()).toUTCString() + "]  [HYDRO] " + msg, payload != undefined ? payload : "");
}
module.exports = MintyHydroBox;