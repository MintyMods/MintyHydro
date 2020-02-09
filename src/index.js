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
      console.log("getTemp");
      socket.emit("I2C:TEMP:GET");
    }
    socket.on('I2C:TEMP:RESULT', function(bytes) {
      console.log("gotTemp");
      getById("atlas_temp_reading").innerHTML = String.fromCharCode.apply(String, bytes);
    });
    function atlasGetPh() {
      console.log("getPH");
      socket.emit("I2C:PH:GET");
    }
    socket.on('I2C:PH:RESULT', function(bytes) {
      console.log("gotPH");
      getById("atlas_ph_reading").innerHTML = String.fromCharCode.apply(String, bytes);
    });
    function atlasGetEc() {
      console.log("getEC");
      socket.emit("I2C:EC:GET");
    }
    socket.on('I2C:EC:RESULT', function(bytes) {
      console.log("gotEC");
      getById("atlas_ec_reading").innerHTML = String.fromCharCode.apply(String, bytes);
    });
    

    function getById(id) {
      return document.getElementById(id);
    }

    function addEvent(id, callback, evt) {
      getById(id).addEventListener(evt, callback, false);
    }

    ['click','ontouchstart'].forEach( function(evt) {
      addEvent("WATER_PUMP_ON", waterPumpOn, evt);
      addEvent("WATER_PUMP_OFF", waterPumpOff, evt);
      addEvent("WATER_HEATER_ON", waterHeaterOn, evt);
      addEvent("WATER_HEATER_OFF", waterHeaterOff, evt);
      addEvent("AIR_PUMP_ON", airPumpOn, evt);
      addEvent("AIR_PUMP_OFF", airPumpOff, evt);
      addEvent("DEHUMIDIFIER_ON", dehumifierOn, evt);
      addEvent("DEHUMIDIFIER_OFF", dehumifierOff, evt);
      addEvent("HUMIDIFIER_OFF", humidifierOff, evt);
      addEvent("HUMIDIFIER_LOW", humidifierLow, evt);
      addEvent("HUMIDIFIER_HIGH", humidifierHigh, evt);
      addEvent("HEATER_OFF", heaterOff, evt);
      addEvent("HEATER_ON", heaterOn, evt);
      addEvent("AIR_EXTRACT_FAN_OFF", airExtractFanOff, evt);
      addEvent("AIR_EXTRACT_FAN_ON", airExtractFanOn, evt);
      addEvent("AIR_INTAKE_FAN_OFF", airIntakeFanOff, evt);
      addEvent("AIR_INTAKE_FAN_LOW", airIntakeFanLow, evt);
      addEvent("AIR_INTAKE_FAN_HIGH", airIntakeFanHigh, evt);
      addEvent("AIR_MOVEMENT_FAN_SMALL_OFF", airMovementFanSmallOff, evt);
      addEvent("AIR_MOVEMENT_FAN_SMALL_ON", airMovementFanSmallOn, evt);
      addEvent("AIR_MOVEMENT_FAN_LARGE_OFF", airMovementFanLargeOff, evt);
      addEvent("AIR_MOVEMENT_FAN_LARGE_ON", airMovementFanLargeOn, evt);
      addEvent("LIGHT_OFF", lightOff, evt);
      addEvent("LIGHT_ON", lightOn, evt);
      addEvent("DRAIN_RES_ON", drainRes, evt);
      addEvent("DRAIN_RES_OFF", closeRes, evt);
      addEvent("DRAIN_POTS_ON", drainPots, evt);
      addEvent("DRAIN_POTS_OFF", closePots, evt);
      addEvent("LED_OFF", ledOff, evt);
      addEvent("LED_ON", ledOn, evt);
      addEvent("ATLAS_GET_TEMP", atlasGetTemp, evt);
      addEvent("ATLAS_GET_PH", atlasGetPh, evt);
      addEvent("ATLAS_GET_EC", atlasGetEc, evt);
    });
  }
)();
