import '../style/style.css';
import io from 'socket.io-client';
import { url } from '../mintyConfig';



(function() {
    // Connect to the socket server
    const socket = io.connect(url);
});

//     // function atlasGetTemp() {
//     //   getById("atlas_temp_reading").innerHTML = "???.???°C";
//     //   socket.emit("I2C:TEMP:GET");
//     // }
//     // socket.on('I2C:TEMP:RESULT', function(temp) {
//     //   getById("atlas_temp_reading").innerHTML = temp  + "°C";
//     // });
//     // function atlasGetPh() {
//     //   getById("atlas_ph_reading").innerHTML = "?.??? ph";
//     //   socket.emit("I2C:PH:GET");
//     // }
//     // socket.on('I2C:PH:RESULT', function(ph) {
//     //   getById("atlas_ph_reading").innerHTML = ph + " ph";
//     // });
//     // function atlasGetEc() {
//     //   getById("atlas_ec_reading").innerHTML = "?.?? ppm";
//     //   socket.emit("I2C:EC:GET");
//     // }
//     // socket.on('I2C:EC:RESULT', function(ec) {
//     //   getById("atlas_ec_reading").innerHTML = ec + " ppm";
//     // });

//     // socket.on('WLS:TANK:HIGH:OPEN', function() {
//     //   getById("WLS_TANK_HIGH").classList.add('open');
//     //   getById("WLS_TANK_HIGH").classList.remove('close');
//     // });
//     // socket.on('WLS:TANK:HIGH:CLOSE', function() {
//     //   getById("WLS_TANK_HIGH").classList.remove('open');
//     //   getById("WLS_TANK_HIGH").classList.add('close');      
//     // });
//     // socket.on('WLS:TANK:LOW:OPEN', function() {
//     //   getById("WLS_TANK_LOW").classList.add('open');
//     //   getById("WLS_TANK_LOW").classList.remove('close');
//     // });
//     // socket.on('WLS:TANK:LOW:CLOSE', function() {
//     //   getById("WLS_TANK_LOW").classList.remove('open');
//     //   getById("WLS_TANK_LOW").classList.add('close');      
//     // });
//     // socket.on('WLS:RES:HIGH:OPEN', function() {
//     //   getById("WLS_RES_HIGH").classList.add('open');
//     //   getById("WLS_RES_HIGH").classList.remove('close');      
//     // });
//     // socket.on('WLS:RES:HIGH:CLOSE', function() {
//     //   getById("WLS_RES_HIGH").classList.remove('open');
//     //   getById("WLS_RES_HIGH").classList.add('close');         
//     // });
//     // socket.on('WLS:RES:LOW:OPEN', function() {
//     //   getById("WLS_RES_LOW").classList.add('open');
//     //   getById("WLS_RES_LOW").classList.remove('close');      
//     // });
//     // socket.on('WLS:RES:LOW:CLOSE', function() {
//     //   getById("WLS_RES_LOW").classList.remove('open');
//     //   getById("WLS_RES_LOW").classList.add('close');         
//     // });
//     // socket.on('HTS:BME280:HUMIDITY:RH', function(bytes) {
//     //   getById("HTS_BME280_HUMIDITY").innerHTML = bytes + "% RH";
//     // });
//     // socket.on('HTS:BME280:TEMP:CELSIUS', function(bytes) {
//     //   getById("HTS_BME280_TEMP_CELSIUS").innerHTML = bytes + " °C";
//     // });
    
//     var id = "";

//     function pumpSelect() {
//       id = getById("PUMP_SELECT").value;
//       pumpStopAll();
//     }

//     function pumpStart() {
//       var speed = getById("PUMP_SPEED").value;
//       if (speed) {
//         id = getById("PUMP_SELECT").value;
//         socket.emit("PERI:PUMP:START", {id, speed});
//       }
//     }
    
//     function pumpStop() {
//       socket.emit("PERI:PUMP:STOP", getById("PUMP_SELECT").value);
//     }
    
//     function pumpStopAll() {
//       socket.emit("PERI:PUMP:STOP:ALL");
//     }

//     function testRF() {
//       var control = getById("TEST_RF_12V");
//       socket.emit("RF:TEST:12V", control.value);
//     }

//     function getById(id) {
//       return document.getElementById(id);
//     }

//     function addEvent(id, callback, evt) {
//       getById(id).addEventListener(evt, callback, false);
//     }

//   }
// )();
// function warn(msg, payload) {
//   console.warn("** ALERT ** [INDEX] " + msg,  payload != undefined ? payload : "");
// }
// function log(msg, payload) {
//   console.log("[INDEX] " + msg, payload != undefined ? payload : "");
// }