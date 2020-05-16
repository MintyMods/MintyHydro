const config = require('./MintyConfig');
const hydroTarget = require('./MintyHydroTargets');
const MintyDataSource = require('./MintyDataSource');

let pollAllSensors = true;

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

  poll: function () {
    log("----<<<< Minty Hydro Main Cycle Ping... >>>>---- ");

    if (!this.defaultsLoaded) {
      this.loadDefaults();
    }
    if (pollAllSensors) {
      this.pollAtlasSensors();
    } else {
      warn("Skipping Atlas Sensor Polling");
    }
    this.runAfterTimeout();
  },

  setPollAllSensors: function (poll) {
    pollAllSensors = poll;
  },

  pollTEMP: function() {
    // if (!pollAllSensors) {
      this.io.sendAtlasI2C(config.I2C_ATLAS_TEMP_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (temp) {
        log("*** CALIBRATE:TEMP:" + temp);

        this.io.socketEmit('I2C:TEMP:RESULT', temp);
        setTimeout(function () { this.pollTEMP() }.bind(this), config.tick.calibrationPolling);
      }.bind(this));
    // }
  },

  pollEC: function() {
    if (!pollAllSensors) {
      this.io.sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (ec) {
        this.io.socketEmit('I2C:EC:RESULT', ec);
        log("*** CALIBRATE:EC:" + ec);
        setTimeout(function () { this.pollEC() }.bind(this), config.tick.calibrationPolling);
      }.bind(this));
    }
  },

  pollPH: function() {
    if (!pollAllSensors) {
      this.io.sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (ph) {
        this.io.socketEmit('I2C:PH:RESULT', ph);
        log("*** CALIBRATE:PH:" + ph);
        setTimeout(function () { this.pollPH() }.bind(this), config.tick.calibrationPolling);
      }.bind(this));
    }
  },

  loadDefaults: function () {
    this.defaultsLoaded = true;
  },

  pollAtlasSensors: function () {
    this.io.sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (ph) {
      this.reading.ph = ph;
      MintyDataSource.insert({ name:'I2C:PH:RESULT', value:ph, table:'READING' });
      this.io.socketEmit('I2C:PH:RESULT', ph);
      this.io.sendAtlasI2C(config.I2C_ATLAS_TEMP_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (temp) {
        this.reading.temp.water = temp;
        MintyDataSource.insert({ name:'I2C:TEMP:RESULT', value:temp, table:'READING' });
        this.io.socketEmit('I2C:TEMP:RESULT', temp);
        this.io.sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (ec) {
          this.reading.ec = ec;
          MintyDataSource.insert({ name:'I2C:EC:RESULT', value:ec, table:'READING' });
          this.io.socketEmit('I2C:EC:RESULT', ec);
          // this.processSensors();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  },

  processSensors: function () {
    this.processWaterPH();
    this.processWaterEC();
    this.processWaterTemperature();
    this.processAirTemperature();
    this.processAirHumidity();
  },

  runAfterTimeout: function () {
    setTimeout(function () { this.poll() }.bind(this), config.tick.mintyhydro);
  },

  processAirHumidity: function () {
    let humidity = this.reading.humidity;
    if (isValidHumidityReading(humidity)) {
      if (humidity < hydroTarget.getMinHumidity()) {
        this.io.socketEmit('RF:HUMIDIFIER:HIGH');
        this.io.socketEmit('RF:DEHUMIDIFIER:OFF');
      } else if (humidity > hydroTarget.getMinHumidity() && humidity < hydroTarget.getRecHumidity()) {
        this.io.socketEmit('RF:HUMIDIFIER:OFF');
      } else if (humidity > hydroTarget.getRecHumidity() && humidity < hydroTarget.getMaxHumidity()) {
        this.io.socketEmit('RF:HUMIDIFIER:OFF');
        this.io.socketEmit('RF:DEHUMIDIFIER:ON');
      } else if (humidity > hydroTarget.getMaxHumidity()) {
        this.io.socketEmit('RF:HUMIDIFIER:OFF');
        this.io.socketEmit('RF:DEHUMIDIFIER:ON');
      }
    }
  },

  reCycleAir: function () {
    this.io.socketEmit('RF:AIR_EXTRACT_FAN:ON');
  },

  processAirTemperature: function () {
    let current = this.reading.temp.air;
    if (isValidTemperatureReading(current)) {
      if (current < hydroTarget.getMinAirTemp()) {
        // this.io.socketEmit('RF:HEATER:OFF'); // 'TODO ON 
      } else if (current > hydroTarget.getMinAirTemp()) {
        // this.io.socketEmit('RF:HEATER:OFF');
      }
    }
  },

  processWaterEC: function () {
    let current = this.reading.ec;
    if (isValidEcReading(current)) {
      if (current < hydroTarget.getMinEC()) {
        this.ecUp();
      } else if (current > hydroTarget.getMaxEC()) {
        this.ecDown();
      }
    }
  },

  processWaterPH: function () {
    let current = this.reading.ph;
    if (isValidPhReading(current)) {
      if (current < hydroTarget.getMinPH()) {
        this.phDoseUp();
      } else if (current > hydroTarget.getMaxPH()) {
        this.phDoseDown();
      }
    }
  },

  processWaterTemperature: function () {
    let current = this.reading.temp.water;
    if (isValidTemperatureReading(current)) {
      if (current < hydroTarget.getMinWaterTemp()) {
        // this.io.socketEmit('RF:WATER_HEATER:ON');
      } else {
        // this.io.socketEmit('RF:WATER_HEATER:OFF');
      }
    }
  },

  ecUp: function () {
    log("EC up");
    // todo

  },

  ecDown: function () {
    log("EC Down - Diluting Resovoir");
    let timeout = 10000;
    this.io.socketEmit("RF:TEST:12V", config.MINTY_FDD.FILL);
    setTimeout(function () {
      this.io.socketEmit("RF:TEST:12V", config.MINTY_FDD.OFF);
    }.bind(this), timeout);
  },

  phDoseUp: function () {
    log("PH Up - Dosing ph+");
    const pump = {
      id: 'G',
      speed: 124,
      time: 1000,
    };
    this.io.socketEmit("PERI:PUMP:DOSE", pump);
  },

  phDoseDown: function () {
    log("PH Down - Dosing ph-");
    const pump = {
      id: 'H',
      speed: 124,
      time: 1000,
    };
    this.io.socketEmit("PERI:PUMP:DOSE", pump);
  },

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

