function calibrateDosingPumpWizard(pumpsForm, pumpName) {
    let pump = pumpName.split(':')[1].toUpperCase();
    let calibratedTimePerMil = null;

    log("Pump:" + pump + " Name:" + name);
    let tabs = new dhx.Tabbar(null, {
        mode: (isCompact() ? 'top' : 'right'),
        tabWidth: (isCompact() ? 200 : 200),
        views: [
            { disabled: false, header: "Step One - Prime Pump", id: "prime_pump", tab: "Prime Pump", css: "panel flex" },
            { disabled: true, header: "Step Two - Calibrate Dosing", id: "calibrate_dosing", tab: "Calibrate Dosing", css: "panel flex" }
        ],
        closable: false,
        disabled: ["calibrate_dosing", "test_dosing"]
    });
    let wizard = new dhx.Window({
        modal: true,
        title: "'" + toCamelCase(pump.replace("_", " ")) + "' Calibration Wizard",
        resizable: true,
        movable: true,
        width: (isCompact() ? 400 : 640),
        height: (isCompact() ? 500 : 400)
    });

    wizard.events.on("beforeShow", function () {
        stopSchedule();
        let finish = calibrate.getItem('CALIBRATE:DOSE:FINISH');
        let amount = calibrate.getItem('CALIBRATE:DOSE:AMOUNT');
        if (finish) finish.disable();
        if (amount) amount.config.validation = function (value) {
            return (!isNaN(parseFloat(value).toFixed(2)));
        };
        return true;
    });

    wizard.events.on("beforeHide", function () {
        startSchedule();
        return true;
    });

    let prime = new dhx.Form(null, loadJSON('/json/calibrate/dosing/prime.json'));
    let calibrate = new dhx.Form(null, loadJSON('/json/calibrate/dosing/calibrate.json'));

    tabs.events.on("Change", function (activeId, prevId) {
        calibrate.getItem('CALIBRATE:DOSE:TIME').setValue(config.calibration.time);
        calibrate.getItem('CALIBRATE:DOSE:SPEED').setValue(config.calibration.speed);
    });

    let pumpStarted = false;
    prime.events.on("ButtonClick", function (name) {
        if (pumpStarted) {
            socket.emit('PUMP:' + pump + ':STATE', { value: 'OFF' });
        }
        tabs.enableTab("calibrate_dosing");
        tabs.setActive("calibrate_dosing");
        getById("tab-content-calibrate_dosing").scrollIntoView();
    });
    prime.events.on("Change", function (name, value) {
        if (value == 'ON') {
            socket.emit('PUMP:' + pump + ':STATE', { value: 'ON' });
            pumpStarted = true;
        } else {
            socket.emit('PUMP:' + pump + ':STATE', { value: 'OFF' });
            pumpStarted = false;
        }
    });
    calibrate.events.on("ButtonClick", function (name) {
        if (name === 'CALIBRATE:DOSE:RUN') {
            let time = calibrate.getItem('CALIBRATE:DOSE:TIME');
            let speed = calibrate.getItem('CALIBRATE:DOSE:SPEED');
            let opts = {
                "time": (time ? time.getValue() : null),
                "speed": (speed ? speed.getValue() : null),
                "pump": pump,
                "command": 'calibrate'
            };
            calibrate.getItem('CALIBRATE:DOSE:AMOUNT').clear();
            socket.emit('PUMP:' + pump + ':DOSE', opts);
            getById('CALIBRATE:DOSE:AMOUNT').focus();
        } else if (name === 'CALIBRATE:DOSE:FINISH') {
            let speed = calibrate.getItem('CALIBRATE:DOSE:SPEED').getValue();
            let opts = {
                "time": calibratedTimePerMil,
                "speed": speed,
                "pump": pump,
                "command": 'update'
            };
            socket.emit('CALIBRATE:' + pump + ':UPDATE', opts);
            pumpsForm.getItem('PUMP:' + pump + ':TIME').setValue(opts.time);
            pumpsForm.getItem('PUMP:' + pump + ':SPEED').setValue(opts.speed);
            pumpsForm.getItem('PUMP:' + pump + ':AMOUNT').setValue(1);
            wizard.hide();
        }
    });

    calibrate.events.on("Change", function (name, grams) {
        if (name === 'CALIBRATE:DOSE:AMOUNT') {
            if (!isNaN(grams)) {
                let amount = calibrate.getItem('CALIBRATE:DOSE:AMOUNT');
                let finish = calibrate.getItem('CALIBRATE:DOSE:FINISH');
                let time = calibrate.getItem('CALIBRATE:DOSE:TIME');
                calibratedTimePerMil = (time.getValue() / grams).toFixed(2);
                amount.config.successMessage = "Time per .ml : " + calibratedTimePerMil;
                finish.enable();
            }
        }
    });

    tabs.getCell("prime_pump").attach(prime);
    tabs.getCell("calibrate_dosing").attach(calibrate);
    wizard.attach(tabs);
    wizard.show();
}

function calibrateECProbeWizard() {
    let tabs = new dhx.Tabbar(null, {
        mode: (isCompact() ? 'top' : 'right'),
        tabWidth: (isCompact() ? 180 : 200),
        views: [
            { disabled: true, header: "Step One - Dry Calibration", id: "dry_calibrate", tab: "Dry Calibration", css: "panel flex" },
            { disabled: true, header: "Step Two - Low Calibration", id: "low_calibrate", tab: "Low Calibration", css: "panel flex" },
            { disabled: true, header: "Step Three - High Calibration", id: "high_calibrate", tab: "High Calibration", css: "panel flex" }
        ],
        closable: false,
        disabled: ["low_calibrate", "high_calibrate"]
    });
    let wizard = new dhx.Window({
        modal: true,
        title: "EC Probe Calibration Wizard",
        resizable: true,
        movable: true,
        width: (isCompact() ? 400 : 640),
        height: (isCompact() ? 370 : 300)
    });
    wizard.events.on("beforeHide", function () {
        socket.emit('CALIBRATE:EC:STOP');
        return true;
    });
    wizard.events.on("beforeShow", function () {
        socket.emit('CALIBRATE:EC:START');
        return true;
    });

    let dry = new dhx.Form(null, loadJSON('/json/calibrate/ec/dry.json'));
    let low = new dhx.Form(null, loadJSON('/json/calibrate/ec/low.json'));
    let high = new dhx.Form(null, loadJSON('/json/calibrate/ec/high.json'));

    dry.events.on("ButtonClick", function (name) {
        tabs.enableTab("low_calibrate");
        tabs.setActive("low_calibrate");
        socket.emit('CALIBRATE:EC:DRY');
        getById("tab-content-high_calibrate").scrollIntoView();
    });
    low.events.on("ButtonClick", function (name) {
        tabs.enableTab("high_calibrate");
        tabs.setActive("high_calibrate");
        socket.emit('CALIBRATE:EC:LOW');
    });
    high.events.on("ButtonClick", function (name) {
        socket.emit('CALIBRATE:EC:HIGH');
        wizard.hide();
    });
    socket.on("I2C:EC:RESULT", function (ec) {
        dry.getItem('CALIBRATE:EC:READING').setValue(ec);
        low.getItem('CALIBRATE:EC:READING').setValue(ec);
        high.getItem('CALIBRATE:EC:READING').setValue(ec);
    });

    tabs.getCell("dry_calibrate").attach(dry);
    tabs.getCell("low_calibrate").attach(low);
    tabs.getCell("high_calibrate").attach(high);
    wizard.attach(tabs);
    wizard.show();
}

function calibratePHProbeWizard() {
    let tabs = new dhx.Tabbar(null, {
        mode: (isCompact() ? 'top' : 'right'),
        tabWidth: (isCompact() ? 180 : 200),
        views: [
            { disabled: true, header: "Step One - Mid Calibration (7.00pH)", id: "mid_calibrate", tab: "Mid Calibration", css: "panel flex" },
            { disabled: true, header: "Step Two - Low Calibration (4.00pH)", id: "low_calibrate", tab: "Low Calibration", css: "panel flex" },
            { disabled: true, header: "Step Three - High Calibration (10.00pH)", id: "high_calibrate", tab: "High Calibration", css: "panel flex" }
        ],
        closable: false,
        disabled: ["low_calibrate", "high_calibrate"]
    });
    let wizard = new dhx.Window({
        modal: true,
        title: "EC Probe Calibration Wizard",
        resizable: true,
        movable: true,
        width: (isCompact() ? 400 : 640),
        height: (isCompact() ? 350 : 300)
    });
    wizard.events.on("beforeHide", function () {
        socket.emit('CALIBRATE:PH:STOP');
        return true;
    });
    wizard.events.on("beforeShow", function () {
        socket.emit('CALIBRATE:PH:START');
        return true;
    });

    let mid = new dhx.Form(null, loadJSON('/json/calibrate/ph/mid.json'));
    let low = new dhx.Form(null, loadJSON('/json/calibrate/ph/low.json'));
    let high = new dhx.Form(null, loadJSON('/json/calibrate/ph/high.json'));

    mid.events.on("ButtonClick", function (name) {
        tabs.enableTab("low_calibrate");
        tabs.setActive("low_calibrate");
        socket.emit('CALIBRATE:PH:MID');
        getById("tab-content-high_calibrate").scrollIntoView();
    });
    low.events.on("ButtonClick", function (name) {
        tabs.enableTab("high_calibrate");
        tabs.setActive("high_calibrate");
        socket.emit('CALIBRATE:PH:LOW');
    });
    high.events.on("ButtonClick", function (name) {
        socket.emit('CALIBRATE:PH:HIGH');
        wizard.hide();
    });
    socket.on("I2C:PH:RESULT", function (ph) {
        mid.getItem('CALIBRATE:PH:READING').setValue(ph);
        low.getItem('CALIBRATE:PH:READING').setValue(ph);
        high.getItem('CALIBRATE:PH:READING').setValue(ph);
    });

    tabs.getCell("mid_calibrate").attach(mid);
    tabs.getCell("low_calibrate").attach(low);
    tabs.getCell("high_calibrate").attach(high);
    wizard.attach(tabs);
    wizard.show();
}

