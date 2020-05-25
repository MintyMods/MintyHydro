let socket = null;
let layout = null;
let sidebar = null;
let toolbar = null;

let pumpsForm = null;
let controlsForm = null;
let sensorsForm = null;
let settingsForm = null;
let levelsForm = null;
let notificationsForm = null;
let nutrientAdjustForm = null;
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
    setTimeout(initCharts, 360);
    // resetSchedulerLayoutConfig();
    // showUnderDevelopmentAlt();
}

function initCharts() {

    envLayout.paint();
}

function registerEventHandlers() {
    // @todo
}

function initSocket() {
    socket = io.connect('/arduino', {
        pingTimeout: 60000,
    });
    socket.on('connect', function (data) {
        console.info("Client Connected to Socket Server");
        hideMissingMintyHydroHubError();
    });
    let count = 0;
    socket.on("ARDUINO:CONFIM", function (msg) {
        notificationsForm.data.add(msg, 1);
        let messages = toolbar.data.getItem("notifications");
        messages['count']=count++;
        toolbar.paint();
        //showServerConfirmation(msg);
    });
    socket.on('disconnect', function (e) {
        showMissingMintyHydroHubError();
    });
    socket.on('PUMP:DOSING:STOPPED', function (opts) {
        showPumpStoppedFeedBack(opts);
    });
}

function handleResize() {
    resetSchedulerLayoutConfig();
}

const getResCapacity = function () {
    if (settingsForm) {
        return settingsForm.getItem('CONTROL:GROW_AREA:RES_CAPACITY').getValue();
    }
    return config.defaults.res.capacity;
}

function getChart() {

    var data = [
        { text: '02', 'value': 6.1 },
        { text: '03', 'value': 6.03 },
        { text: '04', 'value': 5.94 },
        { text: '05', 'value': 5.97 },
        { text: '06', 'value': 6.0 },
        { text: '07', 'value': 6.1 },
        { text: '08', 'value': 6.2 },
        { text: '09', 'value': 6.2 },
        { text: '10', 'value': 6.1 },
        { text: '11', 'value': 6.0 },
        // more data items
    ];
    var config = {
        type: "area",
        scales: {
            "bottom": {
                text: "text",
                showText: false
            },
            "left": {
                maxTicks: 5,
                max: 7.0,
                min: 5.0
            }
        },
        series: [
            {
                value: "value",
                color: "#5E83BA",
                strokeWidth: 2
            }
        ],
        legend: {
            
            valign: "top",
            halign: "right"
        }    
    };

    let chart = new dhx.Chart(null, config);
    chart.data.parse(data);    

    return chart;
}

function initComponents() {

    loadJSONAsync('/json/layouts/main.json', function (json) {
        layout = new dhx.Layout("layout_container", json);
        initSideBar();
        initToolBar();

    });

    loadJSONAsync('/json/layouts/environment.json', function (json) {
        envLayout = new dhx.Layout(null, json);
        envLayout.getCell("water_ph_container").attach(getChart());
        envLayout.getCell("water_ec_container").attach(getChart());
        envLayout.getCell("water_temp_container").attach(getChart());
        envLayout.getCell("air_temp_container").attach(getChart());
        envLayout.getCell("air_humidity_container").attach(getChart());
        envLayout.getCell("wattage_container").attach(getChart());
        // envLayout.getCell("control_container").attach(getChart());
        initMainContent('environment');
    })

    loadJSONAsync('/json/settings.json', function (json) {
        settingsForm = new dhx.Form(null, json);
        initFormEvents(settingsForm, 'SETTING');
    });
    loadJSONAsync('/json/levels.json', function (json) {
        levelsForm = new dhx.Form(null, json);
        initFormEvents(levelsForm, 'CONTROL');
    });
    loadJSONAsync('/json/pumps.json', function (json) {
        pumpsForm = new dhx.Form(null, json);
        initPumpFormEvents(pumpsForm);
    });
    loadJSONAsync('/json/controls.json', function (json) {
        controlsForm = new dhx.Form(null, json);
        initFormEvents(controlsForm, 'CONTROL');
    });
    loadJSONAsync('/json/sensors.json', function (json) {
        sensorsForm = new dhx.Form(null, json);
        initSensorFormEvents(sensorsForm);
    });
    notificationsForm = new dhx.List(null,{
        itemHeight: 50,
        template: function(msg) {
            return '<div class="card-row ' + msg.css + '">' +
            '<div class="card-column card-icon"><i class="fa-2x ' + msg.icon + '"></i></div>' + 
            '<div class="card-column card-title">' + msg.title + '</div>' +
            '<div class="card-column card-text"><span>' + msg.text + '</span></div></div>';
        }
    });

    schedulerHeader = loadJSON('/json/scheduler/header.json');
    schedulerHeaderCompact = loadJSON('/json/scheduler/header_compact.json');

    initScheduler();
    initNutrientSection();
    initDatabaseEvents();

}

function stopSchedule() {
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

function initMainContent(id) {
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
    } else if (id === "levels") {
        layout.cell("content_container").attach(levelsForm);
    } else {
        layout.cell("content_container").attachHtml(orignalHtml);        
    }
}

function initSideBar() {
    sidebar = new dhx.Sidebar("sidebar_container", { width: 160, collapsed: true });
    sidebar.data.load('/json/sidebar.json');
    sidebar.events.on("click", function (id) {
        initMainContent(id);
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
            layout.cell("content_container").attach(notificationsForm);
        }
    });
    layout.cell("toolbar_container").attach(toolbar);
}
