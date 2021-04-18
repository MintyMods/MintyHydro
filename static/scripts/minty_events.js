
function saveSchedulerEvent(event) {
    socket.emit("DB:COMMAND", { event, 'command': 'SAVE:EVENT', 'table': 'EVENTS' });
}

function loadSchedulerEvents() {
    socket.emit("DB:COMMAND", { 'command': 'ALL', 'table': 'EVENT' });
}

function getFormValue(form, name) {
    let item = form.getItem(name);
    return item ? item.getValue() : undefined;
}

let loadedForms = [];
function formLoaded(form) {
   return (form ? loadedForms[form._uid] == true : false);
}

function initFormEvents(form, table) {
    let id = form._uid;
    socket.emit("DB:COMMAND", { id, 'command': 'ALL', table });
}

function initPumpFormEvents(pumpsForm) {
    pumpsForm.events.on("ButtonClick", function (command) {
        if (command.indexOf(':CALIBRATE') > 0) {
            calibrateDosingPumpWizard(pumpsForm, command);
        } else if (command.indexOf(':DOSE') > 0) {
            if (runningPump != null) {
                stopDosingPump(pumpsForm, command)
            } else {
                runDosingPump(pumpsForm, command);
            }
        } else {
            socket.emit(command);
        }
    });
    initFormEvents(pumpsForm, 'CONTROL');
}

function initDatabaseEvents() {
    socket.on('DB:RESULT', function (data) {
        if (data.table == 'SETTING') {
            processFormEvents(settingsForm, data);
        } else if (data.table == 'CONTROL') {
            let id = data.id;
            if (controlsForm._uid == id) processFormEvents(controlsForm, data);
            if (pumpsForm._uid == id) processFormEvents(pumpsForm, data);
            if (levelsForm._uid == id) processFormEvents(levelsForm, data);
        } else if (data.table == 'NUTRIENT') {
            processFormEvents(nutrientAdjustForm, data);
        } else if (data.table == 'EVENT') {
            processSchedulerEvents(data);
        } else if (data.table == 'READING') {
            processChartEvents(data);
        }
    });
}

function processChartEvents(data) {
    if (data.rows) {
        switch (data.sensor) {
            case "I2C:PH:RESULT" : 
            chartWaterPh.data.parse(data.rows);
            break;
            case "I2C:EC:RESULT" : 
            chartWaterEc.data.parse(data.rows);
            break;
            case "I2C:TEMP:RESULT" : 
            chartWaterTemp.data.parse(data.rows);
            break;
            case "HTS:BME280:TEMP:CELSIUS" : 
            chartAirTemp.data.parse(data.rows);
            break;
            case "HTS:BME280:HUMIDITY:RH" : 
            chartAirHumidity.data.parse(data.rows);
            break;
        }
    }
}

function processFormEvents(form, data) {
    let table = data.table;
    if (data.rows) {
        data.rows.forEach(function (row) {
            if (row.name.endsWith(':SLIDER')) {
                if (row.value) {
                    let parts = row.value.split(',');
                    form.setValue({ [row.name]: [ parts[0], parts[1] ] });
                }
            } else {
                form.setValue({ [row.name]: row.value });
            }
        });
    } else {
        form.setValue({ [data.name]: data.value });
    }
    
    // setTimeout(function(){

        form.events.on("Change", function (name, value) {
            if (formLoaded(form)) {
                let id = form._uid;
                if (name.indexOf(':STATE') > -1) {
                    let time = getFormValue(form, name.replace(':STATE', ':TIME'));
                    let speed = getFormValue(form, name.replace(':STATE', ':SPEED'));
                    let amount = getFormValue(form, name.replace(':STATE', ':AMOUNT'));
                    socket.emit(name, { 'command': name, value, time, speed, amount });
                } else {
                    socket.emit(name, { 'command': name, value });
                }
                socket.emit("DB:COMMAND", { id, name, value, 'command': 'UPDATE', table });
            }
        });    
    // },100);
    loadedForms[form._uid] = true;
}

function initSensorFormEvents(sensorsForm) {
    sensorsForm.events.on("ButtonClick", function (name) {
        if (name == 'CALIBRATE:EC') {
            calibrateECProbeWizard();
        } else if (name == 'CALIBRATE:PH') {
            calibratePHProbeWizard();
        }
    });
    socket.on('I2C:EC:RESULT', function (data) {
        sensorsForm.getItem('I2C:EC:RESULT').setValue(data);
    });
    socket.on('I2C:PH:RESULT', function (data) {
        sensorsForm.getItem('I2C:PH:RESULT').setValue(data);
    });
    socket.on('I2C:TEMP:RESULT', function (data) {
        sensorsForm.getItem('I2C:TEMP:RESULT').setValue(data);
    });
    socket.on('HTS:BME280:TEMP:CELSIUS', function (data) {
        sensorsForm.getItem('HTS:BME280:TEMP:CELSIUS').setValue(data);
    });
    socket.on('HTS:BME280:HUMIDITY:RH', function (data) {
        sensorsForm.getItem('HTS:BME280:HUMIDITY:RH').setValue(data);
    });
    socket.on('HTS:BME280:PRESSURE', function (data) {
        // sensorsForm.getItem('HTS:BME280:PRESSURE').setValue(data);
    });
}

function initHydroSlaveEvents(sensorsForm) {
    loadJSONAsync(config.slave.url, function (json) {
        sensorsForm.getItem('SLAVE:EC:RESULT').setValue(json["WATER_EC"]);
        sensorsForm.getItem('SLAVE:PH:RESULT').setValue(json["WATER_PH"]);
        sensorsForm.getItem('SLAVE:TEMP:RESULT').setValue(json["WATER_TEMP"]);
        sensorsForm.getItem('SLAVE:TEMP:CELSIUS').setValue(json["AIR_TEMP"]);
        sensorsForm.getItem('SLAVE:HUMIDITY:RH').setValue(json["AIR_HUMIDITY"]);
        setTimeout(function() { initHydroSlaveEvents(sensorsForm) }, 0);
    });
}