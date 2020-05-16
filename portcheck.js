
/**
 * Shows Open Ports on the Host 
 * i.e. Determine which port the Ardunio is connected to...
 */
const SerialPort = require('serialport');
SerialPort.list().then(ports => {
  ports.forEach(function(port) {
    console.log("PORT:", port);
  });
});