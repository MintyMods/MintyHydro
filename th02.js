const five = require('johnny-five');
var board = new five.Board();
const I2C_GROVE_TEMP_HUMIDITY_ADDR = (0x40); 

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "TH02"
  });

  multi.on("change", function() {
    console.log("Thermometer");
    console.log("  celsius           : ", this.thermometer.celsius);
    console.log("  fahrenheit        : ", this.thermometer.fahrenheit);
    console.log("  kelvin            : ", this.thermometer.kelvin);
    console.log("--------------------------------------");

    console.log("Hygrometer");
    console.log("  relative humidity : ", this.hygrometer.relativeHumidity);
    console.log("--------------------------------------");
  });
});

  // var humidity = new five.Multi({
  //   controller: "TH02",
  //   address: I2C_GROVE_TEMP_HUMIDITY_ADDR
  //   // freq: 20
  // });

  // humidity.on("change", function() {
  //   console.log("TH02 Thermometer");
  //   console.log("  celsius           : ", this.thermometer.celsius);
  //   console.log("  fahrenheit        : ", this.thermometer.fahrenheit);
  //   console.log("  kelvin            : ", this.thermometer.kelvin);
  //   console.log("--------------------------------------");
  //   console.log("Hygrometer");
  //   console.log("  relative humidity : ", this.hygrometer.relativeHumidity);
  //   console.log("--------------------------------------");
  // });


//   The heater can be activated by setting HEAT (D1) in CONFIG (register 0x03). Turning on the heater will reduce the
// tendency of the humidity sensor to accumulate an offset due to “memory” of sustained high humidity conditions.
// When the heater is enabled, the reading of the on-chip temperature sensor will be affected (increased).