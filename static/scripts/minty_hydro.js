let isCompact = window.innerWidth < 1000;
let navSelected = 'controls';
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

document.addEventListener("DOMContentLoaded", function (event) {
    initMintyHydro();
});

function initMintyHydro() {
    isCompact = window.innerWidth < 1000;
    PNotify.defaults.styling = 'material';
    PNotify.defaults.width = "400px";
    PNotify.defaults.icons = 'fontawesome5'; // Font Awesome 5
    registerEventHandlers();
    initComponents();
    showUnderDevelopmentAlt();
    // showMsg("info", "text", "title");
}


function initSocketListeners() {

    controlsForm.events.on("Change",function(name, value){
        if (name == 'airpump') {
            if (value == 'on') {

            } else if (value == 'off') {
 
            } else if (value == 'auto') {

            }
        }
    });


    // airPumpOn()
    airpump
    var value = controlsForm.getItem("radioGroup_id").getValue();
}

function registerEventHandlers() {

}

function handleResize() {
    resetSchedulerLayoutConfig();
}


function initComponents() {
    // automation = loadJSON('/json/automation.json');

    loadJSONAsync('/json/automation.json', function (json) {
        automation = json;
    });

    layout = new dhx.Layout("layout_container", loadJSON('/json/layouts/main.json'));
    envLayout = new dhx.Layout(null, loadJSON('/json/layouts/environment.json'));
    settingsForm = new dhx.Form(null, loadJSON('/json/settings.json'));
    initToolBar();
    initSideBar();
    initNutrientSection();

    layout.cell("content_container").attach(scheduler);   

    loadJSONAsync('/json/pumps.json', function (json) {
        pumpsForm = new dhx.Form(null, json);
    });
    loadJSONAsync('/json/controls.json', function (json) {
        controlsForm = new dhx.Form(null, json);
    });
    loadJSONAsync('/json/sensors.json', function (json) {
        sensorsForm = new dhx.Form(null, json);
    });

    schedulerHeader = loadJSON('/json/scheduler/header.json');
    schedulerHeaderCompact = loadJSON('/json/scheduler/header_compact.json');
}


 function initSideBar() {
    var sidebar = new dhx.Sidebar("sidebar_container", { width: 160, collapsed: true });
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
            showInfo();
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

function showUnderDevelopmentAlt() {
    var notice = PNotify.success({
        title: '<span style="color:white">Project Status :</span>     <span style="color:yellow">ALPHA</span>',
        text: '<b style="color:white">Currently under Development</b><br/><br/><span style="color:greenyellow;text-align:center">Mobile Support has not yet been fully added so larger browser viewing is recommended</span>',
        titleTrusted: true,
        textTrusted: true,
        icon: 'fad fa-laptop-code fa-2x',
        addClass: 'minty-notification ',
        shadow: true
    });
}



const getResCapacity = function () {
    if (settingsForm) {
        return settingsForm.getValue()['totalResCapacity'];
    }
    return 0;
};

function initNutrientSection() {
    nutrientLayout = new dhx.Layout(null, {
        rows: [
            { height: "300px", gravity: true, padding: 10, headerIcon: "fal fa-seedling", id: "dosing_amount_container", header: "Nutrient Dose : (Base Nutrients) x (Capacity " + getResCapacity() + " litres)" },
            { height: "300px", gravity: true, padding: 10, headerIcon: "fal fa-balance-scale", id: "base_nutrients_container", header: "Base Nutrients : amounts per milliliter - (double click cells to edit)" }        ]
    });
    
    const gridColumns = loadJSON('/json/headers.json');
    var baseNutrientsGrid = new dhx.Grid(null, {
        columns: gridColumns,
        autoWidth: false,
        editable: true,
        sortable: true,
        resizable: true,
        splitAt: 1
    });
    var dosingGrid = new dhx.Grid(null, {
        columns: gridColumns,
        autoWidth: false,
        editable: false,
        sortable: false,
        resizable: true,
        splitAt: 1,
        htmlEnable:true
    });

    const updateDosingGrid = function () {
        var base = baseNutrientsGrid.data.serialize();
        dosingGrid.data.removeAll();
        for (var i = 0; i < base.length; i++) {
            var keys = Object.keys(base[i]);
            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];
                var cell = base[i][key];
                if (j > 0) {
                    base[i][j] = ((parseFloat(base[i][j]) * parseFloat(getResCapacity()))).toFixed(2);
                }
            }
            dosingGrid.data.add(base[i]);
        }
    };
    nutrientLayout.cell("base_nutrients_container").attach(baseNutrientsGrid);
    baseNutrientsGrid.data.events.on("Change", function (id, status, updatedItem) {
        updateDosingGrid();
    });
    baseNutrientsGrid.data.load('/json/dosing.json').then(function () {
        updateDosingGrid();
    });

    nutrientLayout.cell("dosing_amount_container").attach(dosingGrid);    
}

function resetSchedulerLayoutConfig(){
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
    scheduler.config.details_on_create=true;
    scheduler.config.details_on_dblclick=true;
    scheduler.config.occurrence_timestamp_in_utc = true;
    scheduler.config.include_end_by = true;
    scheduler.config.repeat_precise = true;    
    scheduler.config.include_end_by = true;

    resetSchedulerLayoutConfig(); 

    scheduler.createUnitsView({
        name:"unit",
        property:"label",
        list: automation
    });

    scheduler.createTimelineView({
        name:	"timeline",
        x_unit:	"minute",
        x_date:	"%H:%i",
        x_step:	60,
        x_size: 24,
        x_start: 0,
        render:"days",
        days:63
        // ,
        // y_unit: automation,
        // y_property: "section_id"
    });

    scheduler.config.lightbox.sections = [
        { type: "select", id: "automation", map_to: "automation", name: "Resource", options: automation },
        { name: "time", height: 72, type: "calendar_time", map_to: "auto" },
        { name:"recurring", height:115, type:"recurring", map_to:"rec_type", button:"recurring"},
    ];
    
    const getEventText = function (start, end, event) {
        var type = automation[event.automation];
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

    const getEventColor = function(id,event){
        var type = automation[event.automation];
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