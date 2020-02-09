const express = require('express');
const config = require('./config');
const app = express();
process.env.NODE_ENV = 'development'; // 'tdoo REMOVE

// Development only
if (process.env.NODE_ENV === 'development') {
  const webpackMiddleware = require('webpack-dev-middleware');
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.config.js');
  app.use(webpackMiddleware(webpack(webpackConfig)));
} else {
  app.use(express.static('dist')); // Set 'dist' folder as static assets folder
}

const server = app.listen(process.env.PORT || config.port, function() {
  let port = process.env.PORT || config.port;
  console.log('Socket server listening at: ' + port);
});

const io = require('socket.io')(server);
io.of('/arduino').on('connection', (socket) => {

  console.log('New connection to /arduino : ' + socket.id);

  socket.on('HW:LED:ON', function() {
    console.log("HW:LED:ON");
    socket.broadcast.emit('HW:LED:ON');
  });
  socket.on('HW:LED:OFF', function() {
    console.log("HW:LED:OFF");
    socket.broadcast.emit('HW:LED:OFF');
  });
  socket.on('RF:EXTENTION:ON', function() {
    socket.broadcast.emit('RF:EXTENTION:ON');
  });
  socket.on('RF:EXTENTION:OFF', function() {
    socket.broadcast.emit('RF:EXTENTION:OFF');
  });
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
  socket.on('RF:AIR_MOVEMENT_FAN_SMALL:OFF', function() {
    socket.broadcast.emit('RF:AIR_MOVEMENT_FAN_SMALL:OFF');
  });
  socket.on('RF:AIR_MOVEMENT_FAN_SMALL:ON', function() {
    socket.broadcast.emit('RF:AIR_MOVEMENT_FAN_SMALL:ON');
  });
  socket.on('RF:AIR_MOVEMENT_FAN_LARGE:OFF', function() {
    socket.broadcast.emit('RF:AIR_MOVEMENT_FAN_LARGE:OFF');
  });
  socket.on('RF:AIR_MOVEMENT_FAN_LARGE:ON', function() {
    socket.broadcast.emit('RF:AIR_MOVEMENT_FAN_LARGE:ON');
  });
  socket.on('RF:LIGHT:OFF', function() {
    socket.broadcast.emit('RF:LIGHT:OFF');
  });
  socket.on('RF:LIGHT:ON', function() {
    socket.broadcast.emit('RF:LIGHT:ON');
  });
  socket.on('RF:DRAIN_RES:ON', function() {
    socket.broadcast.emit('RF:DRAIN_RES:ON');
  });
  socket.on('RF:DRAIN_RES:OFF', function() {
    socket.broadcast.emit('RF:DRAIN_RES:OFF');
  });
  socket.on('RF:DRAIN_POTS:ON', function() {
    socket.broadcast.emit('RF:DRAIN_POTS:ON');
  });
  socket.on('RF:DRAIN_POTS:OFF', function() {
    socket.broadcast.emit('RF:DRAIN_POTS:OFF');
  });
  socket.on('I2C:TEMP:GET', function() {
    socket.broadcast.emit('I2C:TEMP:GET');
  });
  socket.on('I2C:TEMP:RESULT', function(bytes) {
    console.log("Temperature: " + String.fromCharCode.apply(String, bytes));
    socket.broadcast.emit('I2C:TEMP:RESULT', bytes);
  });
  socket.on('I2C:PH:GET', function() {
    socket.broadcast.emit('I2C:PH:GET');
  });
  socket.on('I2C:PH:RESULT', function(bytes) {
    console.log("PH: " + String.fromCharCode.apply(String, bytes));
    socket.broadcast.emit('I2C:PH:RESULT', bytes);
  });
  socket.on('I2C:EC:GET', function() {
    socket.broadcast.emit('I2C:EC:GET');
  });
  socket.on('I2C:EC:RESULT', function(bytes) {
    console.log("EC: " + String.fromCharCode.apply(String, bytes));
    socket.broadcast.emit('I2C:EC:RESULT', bytes);
  });

});
