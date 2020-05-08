
const config = {
    calibration : {
        time : 1000,
        speed : 255
    },
    debug : true
}

let socket = null;
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
let calibrateLayout = null;
let schedulerHeader = null;
let schedulerHeaderCompact = null;
let runningPump = null;

function resetSchedulerLayoutConfig() {
    scheduler.config.header = isCompact() ? schedulerHeaderCompact : schedulerHeader;
    return true;
}

document.addEventListener("DOMContentLoaded", function (event) {
    initMintyHydro();
});

function initMintyHydro() {
    initSocket();
    registerEventHandlers();
    initComponents();
    resetSchedulerLayoutConfig();
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
    socket.on('PUMP:DOSING:STOPPED', function (opts) {
        showPumpStoppedFeedBack(opts);
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

function  stopSchedule() {
    // @todo stop auto dosing when calibrating
}
function startSchedule() {
    // @todo start auto dosing when calibrating
}

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
    showPumpStartedFeedBack(opts);
    log("Running Pump Dosing : " + command + ' : ' + JSON.stringify(opts));
    runningPump = command;    
    socket.emit(command, opts);
}

function stopDosingPump(form, command) {
    let name = command.split(":")[1];
    log("Stopping Pump Dosing : " + name);
    socket.emit("PUMP:" + name + ":OFF");
}

let feedback_opts = null;
function showPumpStartedFeedBack(opts) {
    feedback_opts = opts;
    setTimeout(function(){
        showPumpStoppedFeedBack(opts)
    }, opts.time);
    let control = pumpsForm.getItem(opts.command);
    control.config.color='success';
    control.config.loading = true;
    control.paint();    
}

function showPumpStoppedFeedBack(opts) {
    opts ? opts : feedback_opts;
    runningPump = null;
    log("Pump " + opts.pump + " Stopped");
    let control = pumpsForm.getItem(opts.command);
    if (control) {
        control.config.color='primary';
        control.config.loading = false;
        control.paint();
    }
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