function initMintyHydro() {
    debugger
    PNotify.defaults.styling = 'material';
    PNotify.defaults.icons = 'fontawesome5'; // Font Awesome 5
    showUnderDevelopment();
}

function showUnderDevelopmentAlt() {
    var notice = PNotify.success({
        title: '<span style="color:white">Project Status :</span>     <span style="color:yellow">ALPHA</span>',
        text: '<b style="color:white">Currently unavailable for download</b><br/><br/><span style="color:greenyellow;text-align:center">Click here to try out an online demo of the current prototype</span>',
        titleTrusted: true,
        textTrusted: true,
        icon: 'fad fa-laptop-code fa-2x',
        addClass: 'minty-notification ',
        shadow: true
    });
    notice.refs.elem.style.cursor = 'pointer';
    notice.on('click', function (e) {
        if ($(e.target).is('.ui-pnotify-closer *, .ui-pnotify-sticker *')) {
            return;
        }
        notice.update({
            type: 'info',
            text: '<ul class="actions special"><li><a href="demo.html" title="Very early prototype of the application" class="tooltip button primary icon fa-lightbulb-on">View Online Demo</a></li></ul>',
            addClass: 'minty-notification ',
            icon: 'fad fa-eye fa-2x',
            textTrusted: true,
            shadow: true
        });
    });
}

function showUnderDevelopment() {
    if (typeof window.stackBarTop === 'undefined') {
        window.stackBarTop = {
            'dir1': 'down',
            'firstpos1': 0,
            'spacing1': 0,
            'push': 'top'
        };
    }
    var opts = {
        title: 'Work In Progress',
        text: "Not everything works yet so use your imagination...",
        addClass: 'stack-bar-top minty-msg minty-msg-fatal',
        type: 'error',
        cornerClass: 'ui-pnotify-sharp ',
        shadow: true,
        textTrusted: true,
        width: '100vw',
        icon: 'fad fa-asterisk fa-2x',
        stack: window.stackBarTop
    };
    PNotify.alert(opts);    
}
function showSuccess() {
    PNotify.success({
        title: "This is a Simple Notice",
        text: "Different types of alerts can be configured for different levels e.g.<ul class='notice-icons'><li><i class='fad fa-question-circle'></i> Notice</li><li><i class='fad fa-info-circle'></i> Information</li><li><i class='fad fa-exclamation-circle'></i> Warning</li><li><i class='fad fa-engine-warning'></i> Critical</li><li><i class='fad fa-exclamation-triangle'></i> Fatal</li></ul>",
        shadow: true,
        textTrusted: true,
        addClass: 'minty-msg minty-msg-notice ',
        icon: 'fad fa-comments-alt fa-2x'
    });    
}
function showInfo() {
    PNotify.info({
        title: "S.M.A.R.T.: Samsung SSD 960 EVO 250GB (S3ESNX0J518212P)",
        text: "Drive Remaining Life [ 49.9543% ]<br/>INFO limit [ < 50% ]",
        textTrusted: true,
        shadow: true,
        addClass: 'minty-msg minty-msg-info',
        icon: 'fad fa-heart-rate fa-2x'
    });    
}

function showNotice() {
    PNotify.notice({
        title: "CPU [#0]: Intel Core i7-7700K: DTS",
        text: "Core #0 Thermal Throttling [ true ]<br/>WARN range [ = true ]",
        shadow: true,
        textTrusted: true,
        addClass: 'minty-msg minty-msg-warn',
        icon: 'fad fa-temperature-hot fa-2x'
    });    
}
function showError(){
    PNotify.error({
        title: "GPU [#0]: NVIDIA GeForce RTX 2080 Ti:",
        text: "GPU Fan 0 [ 237 rpm ]<br/>CRITICAL range [ < 250 rpm ]",
        shadow: true,
        textTrusted: true,
        addClass: 'minty-msg minty-msg-critical',
        icon: 'fad fa-fan fa-2x'
    });
}

document.addEventListener("DOMContentLoaded", function (event) {

    var navSelected = 'controls';
    let pumpsForm = null;
    var controlsForm = null;
    var sensorsForm = null;
    var settingsForm = null;

    var layout = new dhx.Layout("layout_container", {
        "height": "100vh",
        "width": "100vw",
        "padding": 0,
        "rows": [{
                "id": "toolbar_container",
                "gravity": false,
                "padding": 0
            },
            {
                "cols": [
                    {
                        "id": "sidebar_container",
                        "css": "dhx_layout-cell--border_right"
                    },
                    {
                        "id": "content_container",
                        "width": "100%",
                        "height": "100%"
                    }
                ]
            }]
    });

    var envLayout = new dhx.Layout(null, {
        height: '100%',
        width: '100%',
        rows: [
            { id: "water_ph_container", gravity: true, padding: 0 },
            { id: "water_ec_container", gravity: true, padding: 0, html: "<div>@todo Current pH & chart showing history will go here!</div>" },
            { id: "water_temp_container", gravity: true, padding: 0, html: "<div>@todo Current EC & chart showing history will go here!</div>" },
            { id: "air_temp_container", gravity: true, padding: 0, html: "<div>@todo Current TEMP & chart showing history will go here!</div>" },
            { id: "air_humidity_container", gravity: true, padding: 0, html: "<div>@todo Current Humidity & chart showing history will go here!</div>" },
            { id: "air_humidity_container", gravity: true, padding: 0, html: "<div>@todo Current Wattage & chart showing usage will go here!</div>" },
            { id: "control_container", gravity: true, padding: 0, html: "<div>@todo Show Running Status of all Controls Here as Icons</div>" },
            {
                cols: [
                    { id: "extract_fan_container", gravity: true, css: "dhx_layout-cell--border_right" },
                    { id: "intake_fan_container", gravity: true, width: '100%', height: '100%' }
                ]
            }
        ]
    });

    var toolbar = new dhx.Toolbar("toolbar_container", {
        css: "dhx_widget--border_bottom dhx_widget--bg_white",
    });
    toolbar.data.load('/json/toolbar.json');
    toolbar.events.on("click", function (id) {
        if (id === "toggle-sidebar") {
            sidebar.toggle();
        } else if (id === "notifications") {
            showNotifications();
        }
    });
    layout.cell("toolbar_container").attach(toolbar);

    var automation = loadJSON('/json/automation.json');
    const fullHeader = loadJSON('/json/scheduler/header.json');
    const compactHeader = loadJSON('/json/scheduler/header_compact.json');
    
    function resetConfig(){
        let header;
        if (window.innerWidth < 1000) {
            header = compactHeader;
        } else {
            header = fullHeader;
        }
        scheduler.config.header = header;
        return true;
    }
     resetConfig();
    
 
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
    scheduler.attachEvent("onBeforeViewChange", resetConfig);
    scheduler.attachEvent("onSchedulerResize", resetConfig);
    scheduler.attachEvent("onSchedulerReady", function () {
        requestAnimationFrame(function () {
            scheduler.setCurrentView(new Date(), "week_agenda");
            scheduler.load('/json/events.json');
        });
    });

    loadJSONAsync('/json/pumps.json', function (json) {
        pumpsForm = new dhx.Form(null, json);
    });
    loadJSONAsync('/json/controls.json', function (json) {
        controlsForm = new dhx.Form(null, json);
    });
    loadJSONAsync('/json/sensors.json', function (json) {
        sensorsForm = new dhx.Form(null, json);
    });
    
    settingsForm = new dhx.Form(null, loadJSON('/json/settings.json'));

    const getResCapacity = function () {
        if (settingsForm) {
            return settingsForm.getValue()['totalResCapacity'];
        }
        return 0;
    };
    const nutrientLayout = new dhx.Layout(null, {
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
                    //dosingGrid.addCellCss(base[i]["id"], j, "nutrient-dose");

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

    // Side Bar Navigation
    var sidebar = new dhx.Sidebar("sidebar_container", { width: 160, collapsed: true });
    sidebar.data.load('/json/sidebar.json');
    sidebar.events.on("click", function (id) {
        console.log("Sidebar clikced " + id);
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
    layout.cell("content_container").attach(scheduler);


});
