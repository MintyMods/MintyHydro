
let isCompact = window.innerWidth < 1000;
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
let calibrateLayout = null;
let socket = null;

document.addEventListener("DOMContentLoaded", function (event) {
    initMintyHydro();
});

function initMintyHydro() {
    isCompact = window.innerWidth < 1000;
    initSocket();
    registerEventHandlers();
    initComponents();
    showUnderDevelopmentAlt();
}

function registerEventHandlers() {

}

function initSocket() {
    socket = io.connect('/arduino');
    socket.on('connect', function (data) {
        console.info("Client Connected to Socket Server");
    });
    socket.on("ARDUINO:CONFIM", function(msg) {
        showServerConfirmation(msg);
    });
    socket.on('disconnect', function(e){
        showMissingMintyHydroHubError('disconnect');
    });
}

function handleResize() {
    resetSchedulerLayoutConfig();
}

function initComponents() {

    loadJSONAsync('/json/automation.json', function (json) {
        automation = json;
    });
    loadJSONAsync('/json/layouts/main.json', function (json) {
        layout = new dhx.Layout("layout_container", json);
        initSideBar();
        initToolBar();
    });

    envLayout = new dhx.Layout(null, loadJSON('/json/layouts/environment.json'));
    settingsForm = new dhx.Form(null, loadJSON('/json/settings.json'));
    initNutrientSection();

    loadJSONAsync('/json/pumps.json', function (json) {
        pumpsForm = new dhx.Form(null, json);
        initPumpFormEvents(pumpsForm);
    });
    loadJSONAsync('/json/controls.json', function (json) {
        controlsForm = new dhx.Form(null, json);
        controlsForm.events.on("Change", function (name, value) {
            socket.emit((name + ":" + value.toString()).toUpperCase());
        });
    });
    loadJSONAsync('/json/sensors.json', function (json) {
        sensorsForm = new dhx.Form(null, json);
        initSensorFormEvents(sensorsForm);
        layout.cell("content_container").attach(sensorsForm);
    });

    schedulerHeader = loadJSON('/json/scheduler/header.json');
    schedulerHeaderCompact = loadJSON('/json/scheduler/header_compact.json');

}

function calibrateECProbeWizard() {
    let tabs = new dhx.Tabbar(null, {
        mode:"right",
        views:[ 
            { disabled:true, header:"Step One - Dry Calibration", id: "dry_calibrate", tab: "Dry Calibration", css:"panel flex"},
            { disabled:true, header:"Step Two - Low Calibration", id: "low_calibrate", tab: "Low Calibration", css:"panel flex"},
            { disabled:true, header:"Step Three - High Calibration", id: "high_calibrate", tab: "High Calibration", css:"panel flex"}
        ],
        closable:false,
        disabled: [ "low_calibrate", "high_calibrate"]
    });
    let wizard = new dhx.Window({
        modal: true,
        title:"Atlas E.C. Probe Calibration Wizard",
        resizable: true,
        movable: true,
        width:600,
        height:300
    });
    wizard.events.on("beforeHide", function() {
        socket.emit('CALIBRATE:EC:STOP');
        return true;
    }); 

    let dry = new dhx.Form(null,  loadJSON('/json/calibrate/ec/dry.json'));
    let low = new dhx.Form(null,  loadJSON('/json/calibrate/ec/low.json'));
    let high = new dhx.Form(null,  loadJSON('/json/calibrate/ec/high.json'));
   
    dry.events.on("ButtonClick", function (name) {
        tabs.enableTab("low_calibrate");
        tabs.setActive("low_calibrate");
        socket.emit('CALIBRATE:EC:DRY');
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
    socket.on("I2C:EC:RESULT", function(ec){
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
        mode:"right",
        views:[ 
            { disabled:true, header:"Step One - Mid Calibration (7.00pH)", id: "mid_calibrate", tab: "Mid Calibration", css:"panel flex"},
            { disabled:true, header:"Step Two - Low Calibration (4.00pH)", id: "low_calibrate", tab: "Low Calibration", css:"panel flex"},
            { disabled:true, header:"Step Three - High Calibration (10.00pH)", id: "high_calibrate", tab: "High Calibration", css:"panel flex"}
        ],
        closable:false,
        disabled: [ "low_calibrate", "high_calibrate"]
    });
    let wizard = new dhx.Window({
        modal: true,
        title:"Atlas P.H. Probe Calibration Wizard",
        resizable: true,
        movable: true,
        width:600,
        height:300
    });
    wizard.events.on("beforeHide", function() {
        socket.emit('CALIBRATE:PH:STOP');
        return true;
    }); 

    let mid = new dhx.Form(null,  loadJSON('/json/calibrate/ph/mid.json'));
    let low = new dhx.Form(null,  loadJSON('/json/calibrate/ph/low.json'));
    let high = new dhx.Form(null,  loadJSON('/json/calibrate/ph/high.json'));
   
    mid.events.on("ButtonClick", function (name) {
        tabs.enableTab("low_calibrate");
        tabs.setActive("low_calibrate");
        socket.emit('CALIBRATE:PH:MID');
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
    socket.on("I2C:PH:RESULT", function(ph){
        mid.getItem('CALIBRATE:PH:READING').setValue(ph);
        low.getItem('CALIBRATE:PH:READING').setValue(ph);
        high.getItem('CALIBRATE:PH:READING').setValue(ph);
    });

    tabs.getCell("mid_calibrate").attach(mid);
    tabs.getCell("low_calibrate").attach(low);
    tabs.getCell("high_calibrate").attach(high);
    wizard.attach(tabs);
    socket.emit('CALIBRATE:PH:START');
    wizard.show();
}

function calibratePump(name) {
    showMsg('warn', "Calibrate: " + name, 'Currently not implemented');
}

function initPumpFormEvents(pumpsForm) {
    pumpsForm.events.on("ButtonClick", function (name) {
        if (name.indexOf(':CALIBRATE') > 0) {
            calibratePump(name);
        } else {
            socket.emit(name);
        }
    });
    pumpsForm.events.on("Change", function (name, value) {
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

const getResCapacity = function () {
    if (settingsForm) {
        return settingsForm.getValue()['CONFIG:GROW_AREA:RES_CAPACITY'];
    }
    return 0;
};

function initNutrientSection() {
    nutrientLayout = new dhx.Layout(null, {
        rows: [
            { height: "300px", gravity: true, padding: 10, headerIcon: "fal fa-seedling", id: "dosing_amount_container", header: "Nutrient Dose : (Base Nutrients) x (Capacity " + getResCapacity() + " litres)" },
            { height: "300px", gravity: true, padding: 10, headerIcon: "fal fa-balance-scale", id: "base_nutrients_container", header: "Base Nutrients : amounts per milliliter - (double click cells to edit)" }]
    });

    const gridColumns = loadJSON('/json/headers.json');
    const baseNutrientsGrid = new dhx.Grid(null, {
        columns: gridColumns,
        autoWidth: false,
        editable: true,
        sortable: true,
        resizable: true,
        splitAt: 1
    });
    const dosingGrid = new dhx.Grid(null, {
        columns: gridColumns,
        autoWidth: false,
        editable: false,
        sortable: false,
        resizable: true,
        splitAt: 1,
        htmlEnable: true
    });

    const updateDosingGrid = function () {
        let base = baseNutrientsGrid.data.serialize();
        dosingGrid.data.removeAll();
        for (let i = 0; i < base.length; i++) {
            let keys = Object.keys(base[i]);
            for (let j = 0; j < keys.length; j++) {
                let key = keys[j];
                let cell = base[i][key];
                if (j > 0) {
                    base[i][j] = ((parseFloat(base[i][j]) * parseFloat(getResCapacity()))).toFixed(2);
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
    baseNutrientsGrid.data.load('/json/dosing.json').then(function () {
        updateDosingGrid();
    });

    nutrientLayout.cell("dosing_amount_container").attach(dosingGrid);
}

function resetSchedulerLayoutConfig() {
    scheduler.config.header = isCompact ? schedulerHeaderCompact : schedulerHeader;
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

    // function show_minical(){
    //     if (scheduler.isCalendarVisible()){
    //         scheduler.destroyCalendar();
    //     } else {
    //         scheduler.renderCalendar({
    //             position:"dhx_minical_icon",
    //             date:scheduler._date,
    //             navigation:true,
    //             handler:function(date,calendar){
    //                 scheduler.setCurrentView(date);
    //                 scheduler.destroyCalendar()
    //             }
    //         });
    //     }
    // }

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
    //     console.log("button " + id);
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
