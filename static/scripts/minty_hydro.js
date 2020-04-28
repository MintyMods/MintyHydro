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
    scheduler.config.header = ["day", "week", "month", "year", "timeline", "date", "prev", "today", "next"];
    scheduler.config.multi_day = true;

    scheduler.locale.labels.timeline_tab = "Schedule";
    scheduler.config.details_on_create=true;
    scheduler.config.details_on_dblclick=true;
    scheduler.config.include_end_by = true;
    scheduler.config.repeat_precise = true;    
    scheduler.createTimelineView({
        name: "timeline",
        y_unit: automation,
        y_property: "section_id"
    });

    scheduler.config.lightbox.sections = [
        { type: "select", id: "automation", map_to: "automation", name: "Control", options: automation },
        { name: "time", height: 72, type: "time", map_to: "auto" }
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

    scheduler.templates.event_bar_text = getEventText;
    scheduler.templates.event_text = getEventText;
    scheduler.attachEvent("onLightboxButton", function(id,event){
        console.log("button " + id);
    });
    scheduler.attachEvent("onEventAdded", function(id,event){
        var type = automation[event.automation];
        if (type) {
            if (type.color) {
                event.color = type.color;
            }
            if (type.textColor) {
                event.textColor = type.textColor;
            }
        }
    });
    scheduler.attachEvent("onSchedulerReady", function () {
        requestAnimationFrame(function () {
            scheduler.setCurrentView(new Date(), "month");
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
    var sidebar = new dhx.Sidebar("sidebar_container", { width: 160, collapsed: false });
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