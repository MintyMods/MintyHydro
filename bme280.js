const I2C_BME280_SENSOR_ADDR = (0x76);
var multi = new five.Multi({
    controller: "BME280",
    address: I2C_BME280_SENSOR_ADDR
});
multi.on("change", function () {
    console.log("Thermometer:");
    console.log("  celsius      : ", this.thermometer.celsius);
    console.log("  fahrenheit   : ", this.thermometer.fahrenheit);
    console.log("  kelvin       : ", this.thermometer.kelvin);
    console.log("  Pressure     : ", this.barometer.pressure);
    console.log("  Humidity     : ", this.hygrometer.relativeHumidity);
    console.log("Altimeter");
    console.log("  feet         : ", this.altimeter.feet);
    console.log("  meters       : ", this.altimeter.meters);
    console.log("--------------------------------------");
});