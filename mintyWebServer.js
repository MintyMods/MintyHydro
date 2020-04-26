const express = require('express');
const config = require('./mintyConfig');
const app = express();
process.env.NODE_ENV = 'development'; // 'tdoo REMOVE

// Development only
if (process.env.NODE_ENV === 'development') {
  const webpackMiddleware = require('webpack-dev-middleware');
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.config.js');
  app.use('/static', express.static('static'));
  app.use(webpackMiddleware(webpack(webpackConfig)));
} else {
  app.use(express.static('src')); // Set 'dist' folder as static assets folder
}

const server = app.listen(process.env.PORT || config.port, function() {
  let port = process.env.PORT || config.port;
  log('Socket server listening at: ' + port);
});

const io = require('socket.io')(server);
io.of('/arduino').on('connection', (socket) => {

  log('New connection to ArduinoServer@' + socket.id);
  
  socket.on('RF:WATER_PUMP:OFF', function() {
    socket.broadcast.emit('RF:WATER_PUMP:OFF');
  });
  socket.on('RF:WATER_PUMP:ON', function() {
    socket.broadcast.emit('RF:WATER_PUMP:ON');
  });
  socket.on('RF:WATER_HEATER:OFF', function() {
    socket.broadcast.emit('RF:WATER_HEATER:OFF');
  });
  socket.on('RF:WATER_HEATER:ON', function() {
    socket.broadcast.emit('RF:WATER_HEATER:ON');
  });
  socket.on('RF:AIR_PUMP:OFF', function() {
    socket.broadcast.emit('RF:AIR_PUMP:OFF');
  });
  socket.on('RF:AIR_PUMP:ON', function() {
    socket.broadcast.emit('RF:AIR_PUMP:ON');
  });
  socket.on('RF:DEHUMIDIFIER:OFF', function() {
    socket.broadcast.emit('RF:DEHUMIDIFIER:OFF');
  });
  socket.on('RF:DEHUMIDIFIER:ON', function() {
    socket.broadcast.emit('RF:DEHUMIDIFIER:ON');
  });
  socket.on('RF:HUMIDIFIER:LOW', function() {
    socket.broadcast.emit('RF:HUMIDIFIER:LOW');
  });
  socket.on('RF:HUMIDIFIER:HIGH', function() {
    socket.broadcast.emit('RF:HUMIDIFIER:HIGH');
  });
  socket.on('RF:HUMIDIFIER:OFF', function() {
    socket.broadcast.emit('RF:HUMIDIFIER:OFF');
  });
  socket.on('RF:HEATER:OFF', function() {
    socket.broadcast.emit('RF:HEATER:OFF');
  });
  socket.on('RF:HEATER:ON', function() {
    socket.broadcast.emit('RF:HEATER:ON');
  });
  socket.on('RF:AIR_EXTRACT_FAN:OFF', function() {
    socket.broadcast.emit('RF:AIR_EXTRACT_FAN:OFF');
  });
  socket.on('RF:AIR_EXTRACT_FAN:ON', function() {
    socket.broadcast.emit('RF:AIR_EXTRACT_FAN:ON');
  });
  socket.on('RF:AIR_INTAKE_FAN:OFF', function() {
    socket.broadcast.emit('RF:AIR_INTAKE_FAN:OFF');
  });
  socket.on('RF:AIR_INTAKE_FAN:LOW', function() {
    socket.broadcast.emit('RF:AIR_INTAKE_FAN:LOW');
  });
  socket.on('RF:AIR_INTAKE_FAN:HIGH', function() {
    socket.broadcast.emit('RF:AIR_INTAKE_FAN:HIGH');
  });
  socket.on('RF:AIR_MOVEMENT_FAN:OFF', function() {
    socket.broadcast.emit('RF:AIR_MOVEMENT_FAN:OFF');
  });
  socket.on('RF:AIR_MOVEMENT_FAN:ON', function() {
    socket.broadcast.emit('RF:AIR_MOVEMENT_FAN:ON');
  });
  socket.on('RF:LIGHT:OFF', function() {
    socket.broadcast.emit('RF:LIGHT:OFF');
  });
  socket.on('RF:LIGHT:ON', function() {
    socket.broadcast.emit('RF:LIGHT:ON');
  });
  socket.on('I2C:TEMP:GET', function() {
    socket.broadcast.emit('I2C:TEMP:GET');
  });
  socket.on('I2C:TEMP:RESULT', function(temp) {
    socket.broadcast.emit('I2C:TEMP:RESULT', temp);
  });
  socket.on('I2C:PH:GET', function() {
    socket.broadcast.emit('I2C:PH:GET');
  });
  socket.on('I2C:PH:RESULT', function(ph) {
    socket.broadcast.emit('I2C:PH:RESULT', ph);
  });
  socket.on('I2C:EC:GET', function() {
    socket.broadcast.emit('I2C:EC:GET');
  });
  socket.on('I2C:EC:RESULT', function(ec) {
    socket.broadcast.emit('I2C:EC:RESULT', ec);
  });
  socket.on('WLS:TANK:HIGH:OPEN', function() {
    socket.broadcast.emit('WLS:TANK:HIGH:OPEN', );
  });
  socket.on('WLS:TANK:HIGH:CLOSE', function() {
    socket.broadcast.emit('WLS:TANK:HIGH:CLOSE', );
  });
  socket.on('WLS:TANK:LOW:OPEN', function() {
    socket.broadcast.emit('WLS:TANK:LOW:OPEN', );
  });
  socket.on('WLS:TANK:LOW:CLOSE', function() {
    socket.broadcast.emit('WLS:TANK:LOW:CLOSE', );
  });
  socket.on('WLS:RES:HIGH:OPEN', function() {
    socket.broadcast.emit('WLS:RES:HIGH:OPEN', );
  });
  socket.on('WLS:RES:HIGH:CLOSE', function() {
    socket.broadcast.emit('WLS:RES:HIGH:CLOSE', );
  });
  socket.on('WLS:RES:LOW:OPEN', function() {
    socket.broadcast.emit('WLS:RES:LOW:OPEN', );
  });
  socket.on('WLS:RES:LOW:CLOSE', function() {
    socket.broadcast.emit('WLS:RES:LOW:CLOSE', );
  });
  socket.on('RF:TEST:12V', function(bytes) {
    socket.broadcast.emit('RF:TEST:12V', bytes);
  });
  socket.on('HTS:BME280:TEMP:CELSIUS', function(temperature) {
    socket.broadcast.emit('HTS:BME280:TEMP:CELSIUS', temperature);
  });
  socket.on('HTS:BME280:HUMIDITY:RH', function(humidity) {
    socket.broadcast.emit('HTS:BME280:HUMIDITY:RH', humidity);
  });
  socket.on('PERI:PUMP:START', function(pump) {
    socket.broadcast.emit('PERI:PUMP:START', pump);
  });
  socket.on('PERI:PUMP:DOSE', function(pump) {
    socket.broadcast.emit('PERI:PUMP:DOSE', pump);
  });
  socket.on('PERI:PUMP:STOP', function(pump) {
    socket.broadcast.emit('PERI:PUMP:STOP', pump);
  });
  socket.on('PERI:PUMP:STOP:ALL', function(pump) {
    socket.broadcast.emit('PERI:PUMP:STOP:ALL', pump);
  });

});

function warn(msg, payload) {
  console.warn("** ALERT ** [SERVER] " + msg,  payload != undefined ? payload : "");
}
function log(msg, payload) {
  console.log("[SERVER] " + msg, payload != undefined ? payload : "");
}