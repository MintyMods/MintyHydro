const express = require('express');
const config = require('./MintyConfig');
const app = express();
const server = app.listen(process.env.PORT || config.port, function () {
  let port = process.env.PORT || config.port;
  log('Socket server listening @: ' + port);
});
const io = require('socket.io')(server, {
  pingTimeout: 60000,
});

process.env.NODE_ENV = 'development'; // 'tdoo REMOVE

// Development only
// if (process.env.NODE_ENV === 'development') {
const webpackMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
app.use('/static', express.static('static'));
app.use(webpackMiddleware(webpack(webpackConfig)));
// } else {
//   app.use(express.static('src')); // Set 'dist' folder as static assets folder
// }

io.of('/arduino').on('connection', (socket) => {
  log('New connection to ArduinoServer@' + socket.id);

  /* Database events */ 
  socket.on('DB:COMMAND', function (data) {
    socket.broadcast.emit('DB:COMMAND', data);
  });
  socket.on('DB:RESULT', function (result) {
    socket.broadcast.emit('DB:RESULT', result);
  });
  socket.on('DB:JSON', function (result) {
    socket.broadcast.emit('DB:JSON', result);
  });

  /* Events emitted from the Arduino */
  socket.on('ARDUINO:CONFIM', function (msg) {
    socket.broadcast.emit('ARDUINO:CONFIM', msg);
  });

  socket.on('PUMP:DOSING:STOPPED', function (opts) {
    socket.broadcast.emit('PUMP:DOSING:STOPPED', opts);
  });

  /* ATLAS CALIBRATION MESSAGES */
  socket.on('CALIBRATE:EC:START', function () {
    socket.broadcast.emit('CALIBRATE:EC:START');
  });
  socket.on('CALIBRATE:EC:STOP', function () {
    socket.broadcast.emit('CALIBRATE:EC:STOP');
  });
  socket.on('CALIBRATE:EC:DRY', function () {
    socket.broadcast.emit('CALIBRATE:EC:DRY');
  });
  socket.on('CALIBRATE:EC:LOW', function () {
    socket.broadcast.emit('CALIBRATE:EC:LOW');
  });
  socket.on('CALIBRATE:EC:HIGH', function () {
    socket.broadcast.emit('CALIBRATE:EC:HIGH');
  });
  socket.on('CALIBRATE:PH:START', function () {
    socket.broadcast.emit('CALIBRATE:PH:START');
  });
  socket.on('CALIBRATE:PH:STOP', function () {
    socket.broadcast.emit('CALIBRATE:PH:STOP');
  });
  socket.on('CALIBRATE:PH:MID', function () {
    socket.broadcast.emit('CALIBRATE:PH:MID');
  });
  socket.on('CALIBRATE:PH:LOW', function () {
    socket.broadcast.emit('CALIBRATE:PH:LOW');
  });
  socket.on('CALIBRATE:PH:HIGH', function () {
    socket.broadcast.emit('CALIBRATE:PH:HIGH');
  });

  /* Nutient Table Changes */
  socket.on('BASE_NUTRIENTS:UPDATE', function (row) {
    socket.broadcast.emit('BASE_NUTRIENTS:UPDATE', row);
  });

  /* RF Remote Control Devices */ 
  socket.on('RF:WATER_PUMP:OFF', function () {
    socket.broadcast.emit('RF:WATER_PUMP:OFF');
  });
  socket.on('RF:WATER_PUMP:ON', function () {
    socket.broadcast.emit('RF:WATER_PUMP:ON');
  });
  socket.on('RF:WATER_PUMP:AUTO', function () {
    socket.broadcast.emit('RF:WATER_PUMP:AUTO');
  });
  socket.on('RF:WATER_HEATER:OFF', function () {
    socket.broadcast.emit('RF:WATER_HEATER:OFF');
  });
  socket.on('RF:WATER_HEATER:ON', function () {
    socket.broadcast.emit('RF:WATER_HEATER:ON');
  });
  socket.on('RF:WATER_HEATER:AUTO', function () {
    socket.broadcast.emit('RF:WATER_HEATER:AUTO');
  });
  socket.on('RF:AIR_PUMP:OFF', function () {
    socket.broadcast.emit('RF:AIR_PUMP:OFF');
  });
  socket.on('RF:AIR_PUMP:ON', function () {
    socket.broadcast.emit('RF:AIR_PUMP:ON');
  });
  socket.on('RF:AIR_PUMP:AUTO', function () {
    socket.broadcast.emit('RF:AIR_PUMP:AUTO');
  });
  socket.on('RF:DEHUMIDIFIER:OFF', function () {
    socket.broadcast.emit('RF:DEHUMIDIFIER:OFF');
  });
  socket.on('RF:DEHUMIDIFIER:ON', function () {
    socket.broadcast.emit('RF:DEHUMIDIFIER:ON');
  });
  socket.on('RF:DEHUMIDIFIER:AUTO', function () {
    socket.broadcast.emit('RF:DEHUMIDIFIER:AUTO');
  });
  socket.on('RF:HUMIDIFIER:LOW', function () {
    socket.broadcast.emit('RF:HUMIDIFIER:LOW');
  });
  socket.on('RF:HUMIDIFIER:HIGH', function () {
    socket.broadcast.emit('RF:HUMIDIFIER:HIGH');
  });
  socket.on('RF:HUMIDIFIER:OFF', function () {
    socket.broadcast.emit('RF:HUMIDIFIER:OFF');
  });
  socket.on('RF:HUMIDIFIER:AUTO', function () {
    socket.broadcast.emit('RF:HUMIDIFIER:AUTO');
  });
  socket.on('RF:HEATER:OFF', function () {
    socket.broadcast.emit('RF:HEATER:OFF');
  });
  socket.on('RF:HEATER:ON', function () {
    socket.broadcast.emit('RF:HEATER:ON');
  });
  socket.on('RF:HEATER:AUTO', function () {
    socket.broadcast.emit('RF:HEATER:AUTO');
  });
  socket.on('RF:AIR_EXTRACT_FAN:OFF', function () {
    socket.broadcast.emit('RF:AIR_EXTRACT_FAN:OFF');
  });
  socket.on('RF:AIR_EXTRACT_FAN:ON', function () {
    socket.broadcast.emit('RF:AIR_EXTRACT_FAN:ON');
  });
  socket.on('RF:AIR_EXTRACT_FAN:AUTO', function () {
    socket.broadcast.emit('RF:AIR_EXTRACT_FAN:AUTO');
  });
  socket.on('RF:AIR_INTAKE_FAN:OFF', function () {
    socket.broadcast.emit('RF:AIR_INTAKE_FAN:OFF');
  });
  socket.on('RF:AIR_INTAKE_FAN:LOW', function () {
    socket.broadcast.emit('RF:AIR_INTAKE_FAN:LOW');
  });
  socket.on('RF:AIR_INTAKE_FAN:HIGH', function () {
    socket.broadcast.emit('RF:AIR_INTAKE_FAN:HIGH');
  });
  socket.on('RF:AIR_INTAKE_FAN:AUTO', function () {
    socket.broadcast.emit('RF:AIR_INTAKE_FAN:AUTO');
  });
  socket.on('RF:AIR_MOVEMENT_FAN:OFF', function () {
    socket.broadcast.emit('RF:AIR_MOVEMENT_FAN:OFF');
  });
  socket.on('RF:AIR_MOVEMENT_FAN:ON', function () {
    socket.broadcast.emit('RF:AIR_MOVEMENT_FAN:ON');
  });
  socket.on('RF:AIR_MOVEMENT_FAN:AUTO', function () {
    socket.broadcast.emit('RF:AIR_MOVEMENT_FAN:AUTO');
  });
  socket.on('RF:LIGHT:OFF', function () {
    socket.broadcast.emit('RF:LIGHT:OFF');
  });
  socket.on('RF:LIGHT:ON', function () {
    socket.broadcast.emit('RF:LIGHT:ON');
  });
  socket.on('RF:LIGHT:AUTO', function () {
    socket.broadcast.emit('RF:LIGHT:AUTO');
  });

  /* SENSOR OUTPUT */ 
  socket.on('I2C:TEMP:RESULT', function (temp) {
    socket.broadcast.emit('I2C:TEMP:RESULT', temp);
  });
  socket.on('I2C:PH:RESULT', function (ph) {
    socket.broadcast.emit('I2C:PH:RESULT', ph);
  });
  socket.on('I2C:EC:RESULT', function (ec) {
    socket.broadcast.emit('I2C:EC:RESULT', ec);
  });
  socket.on('WLS:TANK:HIGH:OPEN', function () {
    socket.broadcast.emit('WLS:TANK:HIGH:OPEN');
  });
  socket.on('WLS:TANK:HIGH:CLOSE', function () {
    socket.broadcast.emit('WLS:TANK:HIGH:CLOSE');
  });
  socket.on('WLS:TANK:LOW:OPEN', function () {
    socket.broadcast.emit('WLS:TANK:LOW:OPEN');
  });
  socket.on('WLS:TANK:LOW:CLOSE', function () {
    socket.broadcast.emit('WLS:TANK:LOW:CLOSE');
  });
  socket.on('WLS:RES:HIGH:OPEN', function () {
    socket.broadcast.emit('WLS:RES:HIGH:OPEN');
  });
  socket.on('WLS:RES:HIGH:CLOSE', function () {
    socket.broadcast.emit('WLS:RES:HIGH:CLOSE');
  });
  socket.on('WLS:RES:LOW:OPEN', function () {
    socket.broadcast.emit('WLS:RES:LOW:OPEN');
  });
  socket.on('WLS:RES:LOW:CLOSE', function () {
    socket.broadcast.emit('WLS:RES:LOW:CLOSE');
  });
  socket.on('HTS:BME280:TEMP:CELSIUS', function (temperature) {
    socket.broadcast.emit('HTS:BME280:TEMP:CELSIUS', temperature);
  });
  socket.on('HTS:BME280:HUMIDITY:RH', function (humidity) {
    socket.broadcast.emit('HTS:BME280:HUMIDITY:RH', humidity);
  });
  socket.on('HTS:BME280:PRESSURE', function (pressure) {
    socket.broadcast.emit('HTS:BME280:PRESSURE', pressure);
  });

  /* PUMP Controls  */
  socket.on('PUMP:PH_UP:ON', function (opts) {
    socket.broadcast.emit('PUMP:PH_UP:ON', opts);
  });
  socket.on('PUMP:PH_UP:OFF', function () {
    socket.broadcast.emit('PUMP:PH_UP:OFF');
  });
  socket.on('PUMP:PH_UP:AUTO', function () {
    socket.broadcast.emit('PUMP:PH_UP:AUTO');
  });
  socket.on('PUMP:PH_UP:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:PH_UP:DOSE', opts);
  });
  socket.on('PUMP:PH_DOWN:ON', function (opts) {
    socket.broadcast.emit('PUMP:PH_DOWN:ON', opts);
  });
  socket.on('PUMP:PH_DOWN:OFF', function () {
    socket.broadcast.emit('PUMP:PH_DOWN:OFF');
  });
  socket.on('PUMP:PH_DOWN:AUTO', function () {
    socket.broadcast.emit('PUMP:PH_DOWN:AUTO');
  });
  socket.on('PUMP:PH_DOWN:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:PH_DOWN:DOSE', opts);
  });
  socket.on('PUMP:CALMAG:ON', function (opts) {
    socket.broadcast.emit('PUMP:CALMAG:ON', opts);
  });
  socket.on('PUMP:CALMAG:OFF', function () {
    socket.broadcast.emit('PUMP:CALMAG:OFF');
  });
  socket.on('PUMP:CALMAG:AUTO', function () {
    socket.broadcast.emit('PUMP:CALMAG:AUTO');
  });
  socket.on('PUMP:CALMAG:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:CALMAG:DOSE', opts);
  });
  socket.on('PUMP:HYDROGUARD:ON', function (opts) {
    socket.broadcast.emit('PUMP:HYDROGUARD:ON', opts);
  });
  socket.on('PUMP:HYDROGUARD:OFF', function () {
    socket.broadcast.emit('PUMP:HYDROGUARD:OFF');
  });
  socket.on('PUMP:HYDROGUARD:AUTO', function () {
    socket.broadcast.emit('PUMP:HYDROGUARD:AUTO');
  });
  socket.on('PUMP:HYDROGUARD:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:HYDROGUARD:DOSE', opts);
  });  
  socket.on('PUMP:FLORA_MICRO:ON', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_MICRO:ON', opts);
  });
  socket.on('PUMP:FLORA_MICRO:OFF', function () {
    socket.broadcast.emit('PUMP:FLORA_MICRO:OFF');
  });
  socket.on('PUMP:FLORA_MICRO:AUTO', function () {
    socket.broadcast.emit('PUMP:FLORA_MICRO:AUTO');
  });
  socket.on('PUMP:FLORA_MICRO:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_MICRO:DOSE', opts);
  });
  socket.on('PUMP:FLORA_GROW:ON', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_GROW:ON', opts);
  });
  socket.on('PUMP:FLORA_GROW:OFF', function () {
    socket.broadcast.emit('PUMP:FLORA_GROW:OFF');
  });
  socket.on('PUMP:FLORA_GROW:AUTO', function () {
    socket.broadcast.emit('PUMP:FLORA_GROW:AUTO');
  });
  socket.on('PUMP:FLORA_GROW:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_GROW:DOSE', opts);
  });  
  socket.on('PUMP:FLORA_BLOOM:ON', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_BLOOM:ON', opts);
  });
  socket.on('PUMP:FLORA_BLOOM:OFF', function () {
    socket.broadcast.emit('PUMP:FLORA_BLOOM:OFF');
  });
  socket.on('PUMP:FLORA_BLOOM:AUTO', function () {
    socket.broadcast.emit('PUMP:FLORA_BLOOM:AUTO');
  });
  socket.on('PUMP:FLORA_BLOOM:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_BLOOM:DOSE', opts);
  });  
  socket.on('PUMP:SPARE:ON', function (opts) {
    socket.broadcast.emit('PUMP:SPARE:ON', opts);
  });
  socket.on('PUMP:SPARE:OFF', function () {
    socket.broadcast.emit('PUMP:SPARE:OFF');
  });
  socket.on('PUMP:SPARE:AUTO', function () {
    socket.broadcast.emit('PUMP:SPARE:AUTO');
  });
  socket.on('PUMP:SPARE:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:SPARE:DOSE', opts);
  });    
  socket.on('PUMP:FILL:ON', function (opts) {
    socket.broadcast.emit('PUMP:FILL:ON', opts);
  });
  socket.on('PUMP:FILL:OFF', function () {
    socket.broadcast.emit('PUMP:FILL:OFF');
  });
  socket.on('PUMP:FILL:AUTO', function () {
    socket.broadcast.emit('PUMP:FILL:AUTO');
  });
  socket.on('PUMP:FILL:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:FILL:DOSE', opts);
  });   
  socket.on('PUMP:DRAIN:ON', function (opts) {
    socket.broadcast.emit('PUMP:DRAIN:ON', opts);
  });
  socket.on('PUMP:DRAIN:OFF', function () {
    socket.broadcast.emit('PUMP:DRAIN:OFF');
  });
  socket.on('PUMP:DRAIN:AUTO', function () {
    socket.broadcast.emit('PUMP:DRAIN:AUTO');
  });
  socket.on('PUMP:DRAIN:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:DRAIN:DOSE', opts);
  });     
  socket.on('PUMP:DRIP:ON', function (opts) {
    socket.broadcast.emit('PUMP:DRIP:ON', opts);
  });
  socket.on('PUMP:DRIP:OFF', function () {
    socket.broadcast.emit('PUMP:DRIP:OFF');
  });
  socket.on('PUMP:DRIP:AUTO', function () {
    socket.broadcast.emit('PUMP:DRIP:AUTO');
  });
  socket.on('PUMP:DRIP:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:DRIP:DOSE', opts);
  });     
  socket.on('PUMP:MAGMIX:ON', function (opts) {
    socket.broadcast.emit('PUMP:MAGMIX:ON', opts);
  });
  socket.on('PUMP:MAGMIX:OFF', function () {
    socket.broadcast.emit('PUMP:MAGMIX:OFF');
  });
  socket.on('PUMP:MAGMIX:AUTO', function () {
    socket.broadcast.emit('PUMP:MAGMIX:AUTO');
  });
  socket.on('PUMP:MAGMIX:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:MAGMIX:DOSE', opts);
  }); 
});

function log(msg, payload) {
  console.log("[" + (new Date()).toUTCString() + "]  [SERVER] " + msg, payload != undefined ? payload : "");
}