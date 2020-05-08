
let debug = true;
let navSelected = 'sensors';
let layout = null;
let sidebar = null;
let toolbar = null;
let automation = null;
let pumpsForm = null;
let controlsForm = null;
let sensorsForm = null;
let settingsForm = null;
let envLayout = null;
let schedulerHeader = null;
let schedulerHeaderCompact = null;
let nutrientLayout = null;
let nutrientAdjustForm = null;
let calibrateLayout = null;
let socket = null;

document.addEventListener("DOMContentLoaded", function (event) {
    initMintyHydro();
});

function initMintyHydro() {
    initSocket();
    registerEventHandlers();
    initComponents();
    // showUnderDevelopmentAlt();
}

function registerEventHandlers() {
    // @todo
}

function initSocket() {
    socket = io.connect('/arduino');
    socket.on('connect', function (data) {
        console.info("Client Connected to Socket Server");
        hideMissingMintyHydroHubError();
    });
    socket.on("ARDUINO:CONFIM", function(msg) {
        showServerConfirmation(msg);
    });
    socket.on('disconnect', function(e){
        showMissingMintyHydroHubError();
    });
    socket.on('PUMP:DOSING:STOPPED', function (pump) {
        pumpStopped(pump);
    });    
}

function handleResize() {
    resetSchedulerLayoutConfig();
}

function getOverRideResCapacity () {
    if (nutrientAdjustForm) {
        return nutrientAdjustForm.getItem('CONFIG:NUTRIENTS:RES_CAPACITY').getValue();
    }
    return getResCapacity();
}

function initComponents() {
    
    automation = loadJSON('/json/automation.json');
    loadJSONAsync('/json/layouts/main.json', function (json) {
        layout = new dhx.Layout("layout_container", json);
        initSideBar();
        initToolBar();
    });
    
    envLayout = new dhx.Layout(null, loadJSON('/json/layouts/environment.json'));
    
    loadJSONAsync('/json/settings.json', function (json) {
        settingsForm = new dhx.Form(null, json);
        initSettingsFormEvents(settingsForm);
       
    });
    loadJSONAsync('/json/pumps.json', function (json) {
        pumpsForm = new dhx.Form(null, json);
        initPumpFormEvents(pumpsForm);
    });
    loadJSONAsync('/json/controls.json', function (json) {
        controlsForm = new dhx.Form(null, json);
        controlsForm.events.on("Change", function (name, value) {
            socket.emit((name + ":" + value.toString()).toUpperCase());
        });
        if (navSelected == 'controls') {
            layout.cell("content_container").attach(sensorsForm);
        }
    });
    loadJSONAsync('/json/sensors.json', function (json) {
        sensorsForm = new dhx.Form(null, json);
        initSensorFormEvents(sensorsForm);
        if (navSelected == 'sensors') {
            layout.cell("content_container").attach(sensorsForm);
        }
    });

    schedulerHeader = loadJSON('/json/scheduler/header.json');
    schedulerHeaderCompact = loadJSON('/json/scheduler/header_compact.json');
}

function initSettingsFormEvents(settingsForm) {
    settingsForm.events.on("ButtonClick", function (name) {
    });
    settingsForm.events.on("Change", function (name, value) {
        // socket.emit((name + ":" + value.toString()).toUpperCase());
    });  
    if (navSelected == 'settings') {
        layout.cell("content_container").attach(settingsForm);
    }  
    initNutrientSection();    
}

function initNutrientSection() {
    nutrientLayout = new dhx.Layout(null, {
        rows: [
            { height: "300px", gravity: false, padding: 5, headerIcon: "fal fa-seedling", id: "dosing_amount_container", header: "Nutrient Dose : Base Nutrients x Total Capacity" },
            { height: "300px", gravity: false, padding: 5, headerIcon: "fal fa-balance-scale", id: "base_nutrients_container", header: "Base Nutrients @ ml amount per litre" },
            { height: "100px", gravity: false, padding: 5, id: "dosing_adjust_container" }
        ]
    });

    const gridColumns = loadJSON('/json/nutrients/headers.json');
    const baseNutrientsGrid = new dhx.Grid(null, {
        columns: gridColumns,
        autoWidth: false,
        editable: true,
        sortable: true,
        resizable: false,
        splitAt: (isCompact() ? 0 : 1),
    });
    const dosingGrid = new dhx.Grid(null, {
        columns: gridColumns,
        autoWidth: false,
        editable: false,
        sortable: false,
        resizable: false,
        splitAt:  (isCompact() ? 0 : 1)
    });

    nutrientAdjustForm = new dhx.Form(null,  loadJSON('/json/nutrients/adjust.json'));
    
    nutrientLayout.events.on("BeforeShow", function (name, value) {
        nutrientAdjustForm.getItem("CONFIG:NUTRIENTS:RES_CAPACITY").setValue(getResCapacity());
    });    

    nutrientAdjustForm.events.on("Change", function (name, value) {
        updateDosingGrid();
    });    
    nutrientLayout.cell("dosing_adjust_container").attach(nutrientAdjustForm);

    const updateDosingGrid = function () {
        let base = baseNutrientsGrid.data.serialize();
        let capacity = getOverRideResCapacity();
        dosingGrid.data.removeAll();
        for (let i = 0; i < base.length; i++) {
            let keys = Object.keys(base[i]);
            for (let j = 0; j < keys.length; j++) {
                let key = keys[j];
                let cell = base[i][key];
                if (j > 0) {
                    base[i][j] = ((parseFloat(base[i][j]) * parseFloat(capacity))).toFixed(2);
                }
            }
            dosingGrid.data.add(base[i]);
        }
    };
    nutrientLayout.cell("base_nutrients_container").attach(baseNutrientsGrid);
    baseNutrientsGrid.data.events.on("Change", function (id, status, row) {
        if (status) {
            socket.emit(('BASE_NUTRIENTS:' + status).toUpperCase(), row);
        }
        updateDosingGrid();
    });
    baseNutrientsGrid.data.load('/json/nutrients/dosing.json').then(function () {
        updateDosingGrid();
    });

    nutrientLayout.cell("dosing_amount_container").attach(dosingGrid);
    
    if (navSelected == 'dosing') {
        layout.cell("content_container").attach(nutrientLayout);
    }
}

function  stopSchedule() {
    // @todo stop auto dosing when calibrating
}
function startSchedule() {
    // @todo start auto dosing when calibrating

}

let runningPump = null;

function runDosingPump(form, command) {
    let name = command.split(":")[1];
    let time = form.getItem('PUMP:' + name + ':TIME');
    let speed = form.getItem('PUMP:' + name + ':SPEED');
    let amount = form.getItem('PUMP:' + name + ':AMOUNT');
    let opts = { 
        "time": (time ? time.getValue() : null),
        "speed": (speed ? speed.getValue() : null),
        "amount": (amount ? amount.getValue() : null),
        "pump": name,
        "command": command
    };
    let control = pumpsForm.getItem(command);
    control.config.color='success';
    control.config.loading = true;
    control.paint();
    runningPump = command;    
    log("Running Pump Dosing : " + command + ' : ' + JSON.stringify(opts));
    socket.emit(command, opts);
}

function stopDosingPump(form, command) {
    let name = command.split(":")[1];
    log("Stopping Pump Dosing : " + name);
    socket.emit("PUMP:" + name + ":OFF");
}

function pumpStopped(opts) {
    runningPump = null;
    log("Pump " + opts.pump + " Stopped");
    let control = pumpsForm.getItem(opts.command);
    if (control) {
        control.config.color='primary';
        control.config.loading = false;
        control.paint();
    }
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

function initSideBar() {
    sidebar = new dhx.Sidebar("sidebar_container", { width: 160, collapsed: true });
    sidebar.data.load('/json/sidebar.json');
    sidebar.events.on("click", function (id) {
        if (id === "schedule") {
            layout.cell("content_container").attach(scheduler);
        } else if (id === "environment") {
            layout.cell("content_container").attach(envLayout);
        } else if (id === "pumps") {
            layout.cell("content_container").attach(pumpsForm);
        } else if (id === "controls") {
            layout.cell("content_container").attach(controlsForm);
        } else if (id === "sensors") {
            layout.cell("content_container").attach(sensorsForm);
        } else if (id === "dosing") {
            layout.cell("content_container").attach(nutrientLayout);
        } else if (id === "settings") {
            layout.cell("content_container").attach(settingsForm);
        } else {
        }
    });
    layout.cell("sidebar_container").attach(sidebar);
}

function initToolBar() {
    toolbar = new dhx.Toolbar("toolbar_container", { css: "dhx_widget--border_bottom dhx_widget--bg_white" });
    toolbar.data.load('/json/toolbar.json');
    toolbar.events.on("click", function (id) {
        if (id === "toggle-sidebar") {
            sidebar.toggle();
        } else if (id === "notifications") {
            showMsg('error', "Notifications", 'Currently not implemented');
        }
    });
    layout.cell("toolbar_container").attach(toolbar);
}

function showContent(id) {
    if (id === "schedule") {
        layout.cell("content_container").attach(scheduler);
    } else if (id === "environment") {
        layout.cell("content_container").attach(envLayout);
    } else if (id === "pumps") {
        layout.cell("content_container").attach(pumpsForm);
    } else if (id === "controls") {
        layout.cell("content_container").attach(controlsForm);
    } else if (id === "sensors") {
        layout.cell("content_container").attach(sensorsForm);
    } else if (id === "dosing") {
        layout.cell("content_container").attach(nutrientLayout);
    } else if (id === "settings") {
        layout.cell("content_container").attach(settingsForm);
    } else {
        layout.cell("content_container").attachHtml(orignalHtml);
    }
}

const getSetting = function (which) {
    if (settingsForm) {
        return settingsForm.getValue()[which];
    }
    return null;
};

const getResCapacity = function () {
    if (settingsForm) {
        return settingsForm.getItem('CONFIG:GROW_AREA:RES_CAPACITY').getValue();
    }
    return 0;
};


function resetSchedulerLayoutConfig() {
    scheduler.config.header = isCompact() ? schedulerHeaderCompact : schedulerHeader;
    return true;
}

function buildScheduler() {

    scheduler.config.responsive_lightbox = true;
    scheduler.config.multi_day = true;
    scheduler.config.prevent_cache = true;
    scheduler.locale.labels.timeline_tab = "Schedule";
    scheduler.locale.labels.unit_tab = "Events";
    scheduler.locale.labels.week_agenda_tab = "Agenda";
    scheduler.config.details_on_create = true;
    scheduler.config.details_on_dblclick = true;
    scheduler.config.occurrence_timestamp_in_utc = true;
    scheduler.config.include_end_by = true;
    scheduler.config.repeat_precise = true;
    scheduler.config.include_end_by = true;

    resetSchedulerLayoutConfig();

    scheduler.createUnitsView({
        name: "unit",
        property: "label",
        list: automation
    });

    scheduler.createTimelineView({
        name: "timeline",
        x_unit: "minute",
        x_date: "%H:%i",
        x_step: 60,
        x_size: 24,
        x_start: 0,
        render: "days",
        days: 63
        // ,
        // y_unit: automation,
        // y_property: "section_id"
    });

    scheduler.config.lightbox.sections = [
        { type: "select", id: "automation", map_to: "automation", name: "Resource", options: automation },
        { name: "time", height: 72, type: "calendar_time", map_to: "auto" },
        { name: "recurring", height: 115, type: "recurring", map_to: "rec_type", button: "recurring" },
    ];

    const getEventText = function (start, end, event) {
        let type = automation[event.automation];
        if (type) {
            if (event.text == "New event") {
                return type.label;
            } else {
                return event.text;
            }
        } else {
            return "New Schedule";
        }
    };

    const getEventColor = function (id, event) {
        let type = automation[event.automation];
        if (type) {
            if (type.color) {
                event.color = type.color;
            }
            if (type.textColor) {
                event.textColor = type.textColor;
            }
        }
    };

    scheduler.templates.week_agenda_event_text = function (start_date, end_date, event, date, position) {
        switch (position) {
            case "middle":
                return "-- " + event.text;
            case "end":
                return "End: " + scheduler.templates.event_date(start_date) + " " + event.text;
            case "start":
                return "Start: " + scheduler.templates.event_date(start_date) + " " + event.text;
            default:
                return scheduler.templates.event_date(start_date) + " " + event.text;
        }
    };

    scheduler.templates.event_bar_text = getEventText;
    scheduler.templates.event_text = getEventText;
    // scheduler.attachEvent("onLightboxButton", function(id,event){
    //     log("button " + id);
    // });
    scheduler.attachEvent("onEventAdded", getEventColor);
    scheduler.attachEvent("onEventChanged", getEventColor);
    scheduler.attachEvent("onBeforeViewChange", resetSchedulerLayoutConfig);
    scheduler.attachEvent("onSchedulerResize", resetSchedulerLayoutConfig);
    scheduler.attachEvent("onSchedulerReady", function () {
        requestAnimationFrame(function () {
            scheduler.setCurrentView(new Date(), "week_agenda");
            scheduler.load('/json/events.json');
        });
    });
}

function warn(msg, payload) {
    console.warn("** ALERT ** [ARDUINO] " + msg, payload != undefined ? payload : "");
}

function log(msg, payload) {
    if (debug) console.log("[HYDRO] " + msg, payload != undefined ? payload : "");
}