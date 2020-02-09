import '../style/style.css';
import io from 'socket.io-client';
import { url } from '../config';

(function() {
    // Connect to the socket server
    const socket = io.connect(url);

    function waterPumpOn() {
      socket.emit("RF:WATER_PUMP:ON");
    }
    function waterPumpOff() {
      socket.emit("RF:WATER_PUMP:OFF");
    }
    function waterHeaterOff() {
      socket.emit("RF:WATER_HEATER:OFF");
    }; 
    function waterHeaterOn() {
      socket.emit("RF:WATER_HEATER:ON");
    }; 
    function airPumpOn() {
      socket.emit("RF:AIR_PUMP:ON");
    }
    function airPumpOff() {
      socket.emit("RF:AIR_PUMP:OFF");
    }
    function dehumifierOn() {
      socket.emit("RF:DEHUMIDIFIER:ON");
    }
    function dehumifierOff() {
      socket.emit("RF:DEHUMIDIFIER:OFF");
    }
    function humidifierOff() {
      socket.emit("RF:HUMIDIFIER:OFF");
    }
    function humidifierLow() {
      socket.emit("RF:HUMIDIFIER:LOW");
    }
    function humidifierHigh() {
      socket.emit("RF:HUMIDIFIER:HIGH");
    }
    function heaterOff() {
      socket.emit("RF:HEATER:OFF");
    }
    function heaterOn() {
      socket.emit("RF:HEATER:ON");
    }
    function airExtractFanOff() {
      socket.emit("RF:AIR_EXTRACT_FAN:OFF");
    }
    function airExtractFanOn() {
      socket.emit("RF:AIR_EXTRACT_FAN:ON");
    }
    function airIntakeFanOff() {
      socket.emit("RF:AIR_INTAKE_FAN:OFF");
    }
    function airIntakeFanLow() {
      socket.emit("RF:AIR_INTAKE_FAN:LOW");
    }
    function airIntakeFanHigh() {
      socket.emit("RF:AIR_INTAKE_FAN:HIGH");
    }
    function airMovementFanSmallOff() {
      socket.emit("RF:AIR_MOVEMENT_FAN_SMALL:OFF");
    }
    function airMovementFanSmallOn() {
      socket.emit("RF:AIR_MOVEMENT_FAN_SMALL:ON");
    }
    function airMovementFanLargeOff() {
      socket.emit("RF:AIR_MOVEMENT_FAN_LARGE:OFF");
    }
    function airMovementFanLargeOn() {
      socket.emit("RF:AIR_MOVEMENT_FAN_LARGE:ON");
    }
    function lightOn() {
      socket.emit("RF:LIGHT:ON");
    }
    function lightOff() {
      socket.emit("RF:LIGHT:OFF");
    }
    function drainRes() {
      console.log("Drain Res");
      socket.emit("RF:DRAIN_RES:ON");
    }
    function closeRes() {
      console.log("Close Res");
      socket.emit("RF:DRAIN_RES:OFF");
    }
    function drainPots() {
      console.log("Drain Pots");
      socket.emit("RF:DRAIN_POTS:ON");
    }
    function closePots() {
      console.log("Close Pots");
      socket.emit("RF:DRAIN_POTS:OFF");
    }
    function ledOff() {
      console.log("led off");
      socket.emit("HW:LED:OFF");
    }
    function ledOn() {
      console.log("led on");
      socket.emit("HW:LED:ON");
    }
    function atlasGetTemp() {
      socket.emit("I2C:TEMP:GET");
    }
    socket.on('I2C:TEMP:RESULT', function(bytes) {
      getById("atlas_temp_reading").innerHTML = String.fromCharCode.apply(String, bytes);
    });
    function atlasGetPh() {
      socket.emit("I2C:PH:GET");
    }
    socket.on('I2C:PH:RESULT', function(bytes) {
      getById("atlas_ph_reading").innerHTML = String.fromCharCode.apply(String, bytes);
    });
    function atlasGetEc() {
      socket.emit("I2C:EC:GET");
    }
    socket.on('I2C:EC:RESULT', function(bytes) {
      getById("atlas_ec_reading").innerHTML = String.fromCharCode.apply(String, bytes);
    });
    

    function getById(id) {
      return document.getElementById(id);
    }

    ['click','ontouchstart'].forEach( function(evt) {
      getById("WATER_PUMP_ON").addEventListener(evt, waterPumpOn, false);
      getById("WATER_PUMP_OFF").addEventListener(evt, waterPumpOff, false);
      getById("WATER_HEATER_ON").addEventListener(evt, waterHeaterOn, false);
      getById("WATER_HEATER_OFF").addEventListener(evt, waterHeaterOff, false);
      getById("AIR_PUMP_ON").addEventListener(evt, airPumpOn, false);
      getById("AIR_PUMP_OFF").addEventListener(evt, airPumpOff, false);
      getById("DEHUMIDIFIER_ON").addEventListener(evt, dehumifierOn, false);
      getById("DEHUMIDIFIER_OFF").addEventListener(evt, dehumifierOff, false);
      getById("HUMIDIFIER_OFF").addEventListener(evt, humidifierOff, false);
      getById("HUMIDIFIER_LOW").addEventListener(evt, humidifierLow, false);
      getById("HUMIDIFIER_HIGH").addEventListener(evt, humidifierHigh, false);
      getById("HEATER_OFF").addEventListener(evt, heaterOff, false);
      getById("HEATER_ON").addEventListener(evt, heaterOn, false);
      getById("AIR_EXTRACT_FAN_OFF").addEventListener(evt, airExtractFanOff, false);
      getById("AIR_EXTRACT_FAN_ON").addEventListener(evt, airExtractFanOn, false);
      getById("AIR_INTAKE_FAN_OFF").addEventListener(evt, airIntakeFanOff, false);
      getById("AIR_INTAKE_FAN_LOW").addEventListener(evt, airIntakeFanLow, false);
      getById("AIR_INTAKE_FAN_HIGH").addEventListener(evt, airIntakeFanHigh, false);
      getById("AIR_MOVEMENT_FAN_SMALL_OFF").addEventListener(evt, airMovementFanSmallOff, false);
      getById("AIR_MOVEMENT_FAN_SMALL_ON").addEventListener(evt, airMovementFanSmallOn, false);
      getById("AIR_MOVEMENT_FAN_LARGE_OFF").addEventListener(evt, airMovementFanLargeOff, false);
      getById("AIR_MOVEMENT_FAN_LARGE_ON").addEventListener(evt, airMovementFanLargeOn, false);
      getById("LIGHT_OFF").addEventListener(evt, lightOff, false);
      getById("LIGHT_ON").addEventListener(evt, lightOn, false);
      getById("DRAIN_RES_ON").addEventListener(evt, drainRes, false);
      getById("DRAIN_RES_OFF").addEventListener(evt, closeRes, false);
      getById("DRAIN_POTS_ON").addEventListener(evt, drainPots, false);
      getById("DRAIN_POTS_OFF").addEventListener(evt, closePots, false);
      getById("LED_OFF").addEventListener(evt, ledOff, false);
      getById("LED_ON").addEventListener(evt, ledOn, false);
      getById("ATLAS_GET_TEMP").addEventListener(evt, atlasGetTemp, false);
      getById("ATLAS_GET_PH").addEventListener(evt, atlasGetPh, false);
      getById("ATLAS_GET_EC").addEventListener(evt, atlasGetEc, false);
    });
  }
)();
