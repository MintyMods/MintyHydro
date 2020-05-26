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
  socket.on('CONTROL:WATER_PUMP:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:WATER_PUMP:STATE', opts);
  });
  socket.on('CONTROL:WATER_HEATER:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:WATER_HEATER:STATE', opts);
  });
  socket.on('CONTROL:AIR_PUMP:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:AIR_PUMP:STATE', opts);
  });
  socket.on('CONTROL:DEHUMIDIFIER:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:DEHUMIDIFIER:STATE', opts);
  });
  socket.on('CONTROL:HUMIDIFIER:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:HUMIDIFIER:STATE', opts);
  });
  socket.on('CONTROL:HEATER:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:HEATER:STATE',opts);
  });
  socket.on('CONTROL:AIR_EXTRACT_FAN:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:AIR_EXTRACT_FAN:STATE', opts);
  });
  socket.on('CONTROL:AIR_INTAKE_FAN:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:AIR_INTAKE_FAN:STATE', opts);
  });
  socket.on('CONTROL:AIR_MOVEMENT_FAN_A:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:AIR_MOVEMENT_FAN_A:STATE', opts);
  });
  socket.on('CONTROL:AIR_MOVEMENT_FAN_B:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:AIR_MOVEMENT_FAN_B:STATE', opts);
  });
  socket.on('CONTROL:LIGHT:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:LIGHT:STATE', opts);
  });
  socket.on('CONTROL:CAMERA:STATE', function (opts) {
    socket.broadcast.emit('CONTROL:CAMERA:STATE', opts);
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
  socket.on('PUMP:PH_UP:STATE', function (opts) {
    socket.broadcast.emit('PUMP:PH_UP:STATE', opts);
  });
  socket.on('PUMP:PH_UP:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:PH_UP:DOSE', opts);
  });
  socket.on('PUMP:PH_DOWN:STATE', function (opts) {
    socket.broadcast.emit('PUMP:PH_DOWN:STATE', opts);
  });
  socket.on('PUMP:PH_DOWN:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:PH_DOWN:DOSE', opts);
  });
  socket.on('PUMP:CALMAG:STATE', function (opts) {
    socket.broadcast.emit('PUMP:CALMAG:STATE', opts);
  });
  socket.on('PUMP:CALMAG:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:CALMAG:DOSE', opts);
  });
  socket.on('PUMP:HYDROGUARD:STATE', function (opts) {
    socket.broadcast.emit('PUMP:HYDROGUARD:STATE', opts);
  });  
  socket.on('PUMP:HYDROGUARD:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:HYDROGUARD:DOSE', opts);
  });  
  socket.on('PUMP:FLORA_MICRO:STATE', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_MICRO:STATE', opts);
  });
  socket.on('PUMP:FLORA_MICRO:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_MICRO:DOSE', opts);
  });
  socket.on('PUMP:FLORA_GROW:STATE', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_GROW:STATE', opts);
  });  
  socket.on('PUMP:FLORA_GROW:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_GROW:DOSE', opts);
  });  
  socket.on('PUMP:FLORA_BLOOM:STATE', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_BLOOM:STATE', opts);
  });  
  socket.on('PUMP:FLORA_BLOOM:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:FLORA_BLOOM:DOSE', opts);
  });  
  socket.on('PUMP:SPARE:STATE', function (opts) {
    socket.broadcast.emit('PUMP:SPARE:STATE', opts);
  });    
  socket.on('PUMP:SPARE:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:SPARE:DOSE', opts);
  });    
  socket.on('PUMP:FILL:STATE', function (opts) {
    socket.broadcast.emit('PUMP:FILL:STATE', opts);
  });   
  socket.on('PUMP:FILL:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:FILL:DOSE', opts);
  });   
  socket.on('PUMP:DRAIN:STATE', function (opts) {
    socket.broadcast.emit('PUMP:DRAIN:STATE', opts);
  });     
  socket.on('PUMP:DRAIN:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:DRAIN:DOSE', opts);
  });     
  socket.on('PUMP:DRIP:STATE', function (opts) {
    socket.broadcast.emit('PUMP:DRIP:STATE', opts);
  });     
  socket.on('PUMP:DRIP:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:DRIP:DOSE', opts);
  });     
  socket.on('PUMP:MAGMIX:DOSE', function (opts) {
    socket.broadcast.emit('PUMP:MAGMIX:DOSE', opts);
  }); 
  socket.on('PUMP:MAGMIX:STATE', function (opts) {
    socket.broadcast.emit('PUMP:MAGMIX:STATE', opts);
  }); 
  socket.on('PUMP:RECIRCULATING:STATE', function (opts) {
    socket.broadcast.emit('PUMP:RECIRCULATING:STATE', opts);
  }); 

});

function log(msg, payload) {
  console.log("[" + (new Date()).toUTCString() + "]  [SERVER] " + msg, payload != undefined ? payload : "");
}