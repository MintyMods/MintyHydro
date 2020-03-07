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
    function relayOneOn() {
      socket.emit("HW:RELAY:ONE:ON");
    }
    function relayOneOff() {
      socket.emit("HW:RELAY:ONE:OFF");
    }
    function relayTwoOn() {
      socket.emit("HW:RELAY:TWO:ON");
    }
    function relayTwoOff() {
      socket.emit("HW:RELAY:TWO:OFF");
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

    socket.on('WLS:TANK:HIGH:OPEN', function() {
      getById("WLS_TANK_HIGH").classList.add('open');
      getById("WLS_TANK_HIGH").classList.remove('close');
    });
    socket.on('WLS:TANK:HIGH:CLOSE', function() {
      getById("WLS_TANK_HIGH").classList.remove('open');
      getById("WLS_TANK_HIGH").classList.add('close');      
    });
    socket.on('WLS:TANK:LOW:OPEN', function() {
      getById("WLS_TANK_LOW").classList.add('open');
      getById("WLS_TANK_LOW").classList.remove('close');
    });
    socket.on('WLS:TANK:LOW:CLOSE', function() {
      getById("WLS_TANK_LOW").classList.remove('open');
      getById("WLS_TANK_LOW").classList.add('close');      
    });
    socket.on('WLS:RES:HIGH:OPEN', function() {
      getById("WLS_RES_HIGH").classList.add('open');
      getById("WLS_RES_HIGH").classList.remove('close');      
    });
    socket.on('WLS:RES:HIGH:CLOSE', function() {
      getById("WLS_RES_HIGH").classList.remove('open');
      getById("WLS_RES_HIGH").classList.add('close');         
    });
    socket.on('WLS:RES:LOW:OPEN', function() {
      getById("WLS_RES_LOW").classList.add('open');
      getById("WLS_RES_LOW").classList.remove('close');      
    });
    socket.on('WLS:RES:LOW:CLOSE', function() {
      getById("WLS_RES_LOW").classList.remove('open');
      getById("WLS_RES_LOW").classList.add('close');         
    });
    socket.on('HTS:BME280:HUMIDITY:RH', function(bytes) {
      getById("HTS_BME280_HUMIDITY").innerHTML = bytes + " RH%";
    });
    socket.on('HTS:BME280:TEMP:CELSIUS', function(bytes) {
      getById("HTS_BME280_TEMP_CELSIUS").innerHTML = bytes + " °C";
    });
    
    var pumpId = null;

    function pumpSelect() {
      socket.emit("PERI:PUMP:STOP:ALL");
      pumpId = getById("PUMP_SELECT").value;
    }
    function pumpStart() {
      var pumpSpeed = getById("PUMP_SPEED").value;
      if (pumpId) socket.emit("PERI:PUMP:START", {pumpId, pumpSpeed});
    }
    function pumpStop() {
      if (pumpId) socket.emit("PERI:PUMP:STOP", pumpId);
    }
    function pumpStartAll() {
      socket.emit("PERI:PUMP:START:ALL", getById("PUMP_SPEED").value);
    }
    function pumpStopAll() {
      socket.emit("PERI:PUMP:STOP:ALL");
    }

    function testRF() {
      var control = getById("TEST_RF_12V");
      socket.emit("RF:TEST:12V", control.value);
    }

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
      addEvent("ATLAS_GET_TEMP", atlasGetTemp, evt);
      addEvent("ATLAS_GET_PH", atlasGetPh, evt);
      addEvent("ATLAS_GET_EC", atlasGetEc, evt);
      addEvent("RELAY_ONE_ON", relayOneOn, evt);
      addEvent("RELAY_ONE_OFF", relayOneOff, evt);
      addEvent("RELAY_TWO_ON", relayTwoOn, evt);
      addEvent("RELAY_TWO_OFF", relayTwoOff, evt);
      addEvent("PUMP_START", pumpStart, evt);
      addEvent("PUMP_STOP", pumpStop, evt);
      addEvent("PUMP_START_ALL", pumpStartAll, evt);
      addEvent("PUMP_STOP_ALL", pumpStopAll, evt);
    });
    addEvent("TEST_RF_12V", testRF, "change");
    addEvent("PUMP_SELECT", pumpSelect, "change");
    // addEvent("TEST_RF_12V", testRF, "click");
  }
)();
