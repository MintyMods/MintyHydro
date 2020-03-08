
const config = require('./config');

const MintyHydroBox = function(io) {
    this.io = io;
    this.toggle = true;
    this.defaultsLoaded = false;
    this.shutdown = false;
    this.sensorReading = {
      ph: null,
      ec: null,
      temp: {
        air: null,
        water: null
      },
      humidity: null
    };
  
    this.poll = function(data){
      log("----<<<< Minty Hydro Main Cycle Ping... >>>>---- ");
  
      if (!this.defaultsLoaded) {
        this.loadDefaults();
      }
  
      
      this.pollAtlasSensors();
      
      this.toggle = !this.toggle;
      log("** SENSOR READ **", this.sensorReading);
  

      if (!this.shutdown) {
          setTimeout(this.poll, 5000);
      }

    }.bind(this);
  
    this.loadDefaults = function() {
      this.defaultsLoaded = true;
    }.bind(this);
  
    this.pollAtlasSensors = function() {
        io.sendAtlasI2C(config.I2C_ATLAS_PH_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (ph) {
            this.sensorReading.ph = ph;
            io.sendAtlasI2C(config.I2C_ATLAS_TEMP_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (temp) {
                this.sensorReading.temp.water = temp;
                io.sendAtlasI2C(config.I2C_ATLAS_EC_SENSOR_ADDR, config.ATLAS_READ_CHARCODE, function (ec) {
                    this.sensorReading.ec = ec;
                    this.processSensors();
            }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this);

    this.processSensors = function(){
        log("Processing Atlas Readings", this.sensorReading);

        if (this.toggle) {
            io.socketEmit('HW:RELAY:ONE:ON');
          } else {
            io.socketEmit('HW:RELAY:ONE:OFF');
          }
          

    }.bind(this);

  }
  
  function log(msg, payload) {
    if (config.debug) console.log("[HYDRO] " + msg,  payload != undefined ? payload : "");
  }
  module.exports = MintyHydroBox;
  
  