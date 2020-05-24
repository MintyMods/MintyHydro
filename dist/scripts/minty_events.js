
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

function initFormEvents(form, table) {
    form.events.on("Change", function (name, value) {
        if (name.indexOf(':STATE') > -1) {
            let time = getFormValue(form, name.replace(':STATE', ':TIME'));
            let speed = getFormValue(form, name.replace(':STATE', ':SPEED'));
            let amount = getFormValue(form, name.replace(':STATE', ':AMOUNT'));
            socket.emit(name, { 'command': name, value, time, speed, amount });
        } else {
            socket.emit(name, { 'command': name, value });
        }
        socket.emit("DB:COMMAND", { name, value, 'command': 'UPDATE', table });
    });
    socket.emit("DB:COMMAND", { 'command': 'ALL', table });
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
            processFormEvents(controlsForm, data);
            processFormEvents(pumpsForm, data);
            processFormEvents(levelsForm, data);
        } else if (data.table == 'NUTRIENT') {
            processFormEvents(nutrientAdjustForm, data);
        } else if (data.table == 'EVENT') {
            processSchedulerEvents(data);
        }
    });
}

function processFormEvents(form, data) {
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
}

function initSensorFormEvents(sensorsForm) {
    sensorsForm.events.on("ButtonClick", function (name) {
        if (name == 'CALIBRATE:EC') {
            calibrateECProbeWizard();
        } else if (name == 'CALIBRATE:PH') {
            calibratePHProbeWizard();
        }
    });
    socket.on('WLS:TANK:HIGH:OPEN', function (data) {
        sensorsForm.getItem('WLS:TANK:HIGH').config.color = 'danger';
        sensorsForm.getItem('WLS:TANK:HIGH').paint();
    });
    socket.on('WLS:TANK:HIGH:CLOSE', function (data) {
        sensorsForm.getItem('WLS:TANK:HIGH').config.color = 'success';
        sensorsForm.getItem('WLS:TANK:HIGH').paint();
    });
    socket.on('WLS:TANK:LOW:OPEN', function (data) {
        sensorsForm.getItem('WLS:TANK:LOW').config.color = 'danger';
        sensorsForm.getItem('WLS:TANK:LOW').paint();
    });
    socket.on('WLS:TANK:LOW:CLOSE', function (data) {
        sensorsForm.getItem('WLS:TANK:LOW').config.color = 'success';
        sensorsForm.getItem('WLS:TANK:LOW').paint();
    });
    socket.on('WLS:RES:HIGH:OPEN', function (data) {
        sensorsForm.getItem('WLS:RES:HIGH').config.color = 'danger';
        sensorsForm.getItem('WLS:RES:HIGH').paint();
    });
    socket.on('WLS:RES:HIGH:CLOSE', function (data) {
        sensorsForm.getItem('WLS:RES:HIGH').config.color = 'success';
        sensorsForm.getItem('WLS:RES:HIGH').paint();
    });
    socket.on('WLS:RES:LOW:OPEN', function (data) {
        sensorsForm.getItem('WLS:RES:LOW').config.color = 'danger';
        sensorsForm.getItem('WLS:RES:LOW').paint();
    });
    socket.on('WLS:RES:LOW:CLOSE', function (data) {
        sensorsForm.getItem('WLS:RES:LOW').config.color = 'success';
        sensorsForm.getItem('WLS:RES:LOW').paint();
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
        sensorsForm.getItem('HTS:BME280:PRESSURE').setValue(data);
    });
}