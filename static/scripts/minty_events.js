
function initSettingsFormEvents() {
    socket.on('DB:RESULT', function (data) {
        if (data.rows) {
            data.rows.forEach(function(row) {
                let control = settingsForm.getItem(row.name);
                if (control) control.setValue(row.value);
            });
        } else {
            let control = settingsForm.getItem(data.name);
            if (control) control.setValue(data.value);
        }
    });    
    settingsForm.events.on("Change", function (name, value) {
        socket.emit("DB:COMMAND", { name, value, 'command':'UPDATE', 'table':'SETTING' });
    });      
    socket.emit("DB:COMMAND", { 'command':'SELECT_ALL', 'table':'SETTING' });
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
    pumpsForm.events.on("Change", function (name, value) {
        if (name.indexOf(":AMOUNT") > -1) {
            // let time = calibrate.getItem('PUMP:' + name + ':TIME');
            // let speed = calibrate.getItem('PUMP:' + name + ':SPEED');   
            // let result = (time / grams);
            // let opts = { 
            //     "time": result,
            //     "speed": (speed ? speed.getValue() : null),
            //     "pump": name,
            //     "command": 'update'
            // };            
            // pumpsForm.getItem('PUMP:' +  pump + ':TIME').setValue(result); 
            // pumpsForm.getItem('PUMP:' +  pump + ':SPEED').setValue(speed); 
            // pumpsForm.getItem('PUMP:' +  pump + ':AMOUNT').setValue(1);             
        }
        socket.emit((name + ":" + value.toString()).toUpperCase());
    });    
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