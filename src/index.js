import '../style/style.css';
import io from 'socket.io-client';
import { url } from '../config';

(function() {
    // Connect to the socket server
    const socket = io.connect(url);

    document.getElementById("LED_OFF").addEventListener("click", function() {
      console.log("led off");
      socket.emit("HW:LED:OFF");
    });
    document.getElementById("LED_ON").addEventListener("click", function() {
      console.log("led on");
      socket.emit("HW:LED:ON");
    });
    document.getElementById("EXTENTION_OFF").addEventListener("click", function() {
      socket.emit("RF:EXTENTION:OFF");
    });
    document.getElementById("EXTENTION_ON").addEventListener("click", function() {
      socket.emit("RF:EXTENTION:ON");
    });
    document.getElementById("WATER_PUMP_OFF").addEventListener("click", function() {
      socket.emit("RF:WATER_PUMP:OFF");
    });
    document.getElementById("WATER_PUMP_ON").addEventListener("click", function() {
      socket.emit("RF:WATER_PUMP:ON");
    });
    document.getElementById("WATER_HEATER_OFF").addEventListener("click", function() {
      socket.emit("RF:WATER_HEATER:OFF");
    });
    document.getElementById("WATER_HEATER_ON").addEventListener("click", function() {
      socket.emit("RF:WATER_HEATER:ON");
    });
    document.getElementById("AIR_PUMP_OFF").addEventListener("click", function() {
      socket.emit("RF:AIR_PUMP:OFF");
    });
    document.getElementById("AIR_PUMP_ON").addEventListener("click", function() {
      socket.emit("RF:AIR_PUMP:ON");
    });
    document.getElementById("DEHUMIDIFIER_OFF").addEventListener("click", function() {
      socket.emit("RF:DEHUMIDIFIER:OFF");
    });
    document.getElementById("DEHUMIDIFIER_ON").addEventListener("click", function() {
      socket.emit("RF:DEHUMIDIFIER:ON");
    });
    document.getElementById("HUMIDIFIER_OFF").addEventListener("click", function() {
      socket.emit("RF:HUMIDIFIER:OFF");
    });
    document.getElementById("HUMIDIFIER_LOW").addEventListener("click", function() {
      socket.emit("RF:HUMIDIFIER:LOW");
    });
    document.getElementById("HUMIDIFIER_HIGH").addEventListener("click", function() {
      socket.emit("RF:HUMIDIFIER:HIGH");
    });
    document.getElementById("HEATER_OFF").addEventListener("click", function() {
      socket.emit("RF:HEATER:OFF");
    });
    document.getElementById("HEATER_ON").addEventListener("click", function() {
      socket.emit("RF:HEATER:ON");
    });
    document.getElementById("AIR_EXTRACT_FAN_OFF").addEventListener("click", function() {
      socket.emit("RF:AIR_EXTRACT_FAN:OFF");
    });
    document.getElementById("AIR_EXTRACT_FAN_ON").addEventListener("click", function() {
      socket.emit("RF:AIR_EXTRACT_FAN:ON");
    });
    document.getElementById("AIR_INTAKE_FAN_OFF").addEventListener("click", function() {
      socket.emit("RF:AIR_INTAKE_FAN:OFF");
    });
    document.getElementById("AIR_INTAKE_FAN_LOW").addEventListener("click", function() {
      socket.emit("RF:AIR_INTAKE_FAN:LOW");
    });
    document.getElementById("AIR_INTAKE_FAN_HIGH").addEventListener("click", function() {
      socket.emit("RF:AIR_INTAKE_FAN:HIGH");
    });
    document.getElementById("AIR_MOVEMENT_FAN_SMALL_OFF").addEventListener("click", function() {
      socket.emit("RF:AIR_MOVEMENT_FAN_SMALL:OFF");
    });
    document.getElementById("AIR_MOVEMENT_FAN_SMALL_ON").addEventListener("click", function() {
      socket.emit("RF:AIR_MOVEMENT_FAN_SMALL:ON");
    });
    document.getElementById("AIR_MOVEMENT_FAN_LARGE_OFF").addEventListener("click", function() {
      socket.emit("RF:AIR_MOVEMENT_FAN_LARGE:OFF");
    });
    document.getElementById("AIR_MOVEMENT_FAN_LARGE_ON").addEventListener("click", function() {
      socket.emit("RF:AIR_MOVEMENT_FAN_LARGE:ON");
    });
    document.getElementById("LIGHT_OFF").addEventListener("click", function() {
      socket.emit("RF:LIGHT:OFF");
    });
    document.getElementById("LIGHT_ON").addEventListener("click", function() {
      socket.emit("RF:LIGHT:ON");
    });
    document.getElementById("DRAIN_RES_ON").addEventListener("click", function() {
      console.log("Drain Res");
      socket.emit("RF:DRAIN_RES:ON");
    });
    document.getElementById("DRAIN_RES_OFF").addEventListener("click", function() {
      console.log("Close Res");
      socket.emit("RF:DRAIN_RES:OFF");
    });
    document.getElementById("DRAIN_POTS_ON").addEventListener("click", function() {
      console.log("Drain Pots");
      socket.emit("RF:DRAIN_POTS:ON");
    });
    document.getElementById("DRAIN_POTS_OFF").addEventListener("click", function() {
      console.log("Close Pots");
      socket.emit("RF:DRAIN_POTS:OFF");
    });
    document.getElementById("ALL_OFF").addEventListener("click", function() {
      socket.emit("RF:ALL:OFF");
    });
    document.getElementById("ALL_ON").addEventListener("click", function() {
      socket.emit("RF:ALL:ON");
    });

  }
)();
