let automation = null;
let conditions = null;

function initScheduler() {
    automation = loadJSON('/json/scheduler/automation.json');
    conditions = loadJSON('/json/scheduler/conditions.json');

    scheduler.config.responsive_lightbox = true;
    scheduler.config.multi_day = true;
    scheduler.config.prevent_cache = true;
    scheduler.locale.labels.timeline_tab = "Schedule";
    // scheduler.locale.labels.unit_tab = "Events";
    // scheduler.locale.labels.week_agenda_tab = "Agenda";
    scheduler.config.details_on_create = true;
    scheduler.config.details_on_dblclick = true;
    scheduler.config.include_end_by = true;
    scheduler.config.repeat_precise = true;
    scheduler.config.mark_now = true;
    // scheduler.config.wide_form = false;
   // scheduler.config.update_render = true;

    // scheduler.createUnitsView({
    //     name: "unit",
    //     property: "label",
    //     list: automation
    // });

    // scheduler.createTimelineView({
    //     name: "timeline",
    //     x_unit: "minute",
    //     x_date: "%H:%i",
    //     x_step: 60,
    //     x_size: 24,
    //     x_start: 0,
    //     render: "days",
    //     days: 63
    //     // ,
    //     // y_unit: automation,
    //     // y_property: "section_id"
    // });

    
    function checkTriggerEnabled(event){
        var e = event || window.event, node = this;
        let sections = document.getElementsByClassName("dhx_wrap_section");
        sections[sections.length - 2].style.display= (node.value.startsWith('trigger:')) ? 'inline' : 'none';
    }

    scheduler.attachEvent("onLightbox", function (id){
        let sections = document.getElementsByClassName("dhx_wrap_section");
        for (let i = 1; i < sections.length-1; i++) {
            let section = sections[i];
            section.style.display='none';
        }
        return true;
    });
    function getTriggerIdFromTitle(title) {
        let sections = scheduler.config.lightbox.sections;
        for (let i = 0; i < sections.length; i++) {
            let section = sections[i];
            if (section.name == title) {
                return section.tag;
            }
        }
    }
    function hideLightBoxControls(event) {
        let selected = event.currentTarget.value;
        let sections = document.getElementsByClassName("dhx_wrap_section");
        for (let i = 1; i < sections.length-1; i++) {
            let section = sections[i].childNodes[0].innerText;
            section = getTriggerIdFromTitle(section);
            sections[i].style.display= (section == selected) ? 'inline' : 'none';
        }
    }

    function getEventConditions(event) {
        let selected = event.currentTarget.value;
    }

    const ON_OFF = [
        { key: "off", label: 'Off : Scheduled' },
        { key: "on", label: 'On : Scheduled' },
        { key: "trigger:off", label: 'Off : Conditional' },
        { key: "trigger:on", label: 'On : Conditional' },
    ];

    const HIGH_LOW_OFF = [
        { key: "off", label: 'Off : Scheduled' },
        { key: "low", label: 'Low : Scheduled' },
        { key: "high", label: 'High : Scheduled' },
        { key: "trigger:off", label: 'Off : Conditional' },
        { key: "trigger:low", label: 'Low : Conditional' },
        { key: "trigger:high", label: 'High : Conditional' },
    ];

    scheduler.config.lightbox.sections = [
        { name:"Resource", tag:"_RESOURCE:", type: "select", map_to: "resource", options: automation, onchange:hideLightBoxControls },
        { name:"Custom Notes", tag:"CUSTOM:", height:50, map_to:"custom", type:"textarea" },
        { name:"Light", tag:"LIGHT:", options:ON_OFF, map_to:"light", type:"select", onchange:checkTriggerEnabled },
        { name:"Extract Fan", tag:"FAN:EXTRACT:", options:ON_OFF, map_to:"extract", type:"select", onchange:checkTriggerEnabled },
        { name:"Intake Fan", tag:"FAN:INTAKE:", options:HIGH_LOW_OFF, map_to:"intake", type:"select", onchange:checkTriggerEnabled  },
        { name:"Oscillating Fans", tag:"FAN:OSCILLATING:", options:ON_OFF, map_to:"oscillating", type:"select", onchange:checkTriggerEnabled  },
        { name:"Water Heater", tag:"WATER:HEATER:", options:ON_OFF,  map_to:"waterheater", type:"select", onchange:checkTriggerEnabled  },
        { name:"Air Heater", tag:"AIR:HEATER:", options:ON_OFF,  map_to:"airheater", type:"select", onchange:checkTriggerEnabled  },
        { name:"Humidifier", tag:"HUMIDIFIER:", options:HIGH_LOW_OFF, map_to:"humidifier", type:"select", onchange:checkTriggerEnabled  },
        { name:"De-Humidifier", tag:"DE:HUMIDIFIER:", options:ON_OFF, map_to:"dehumidifier", type:"select", onchange:checkTriggerEnabled  },
        { name:"Air Pump", tag:"AIR:PUMP:", options:ON_OFF, map_to:"airpump", type:"select", onchange:checkTriggerEnabled  },
        { name:"Recirculating Pump", tag:"RECIRCULATING:PUMP:", options:ON_OFF, map_to:"recirculatingpump", type:"select", onchange:checkTriggerEnabled  },
        { name:"Condition", tag:"TRIGGER:", type: "select", map_to: "triggers", options: conditions, onchange:getEventConditions },
        // { name:"Recurring", tag:"_RECURRING", height: 115, type: "recurring", map_to: "recurring", button: "recurring" },
        { css:'minty_section', name:"Time", tag:"_TIME", type: "calendar_time", map_to: "time" }
    ];

    scheduler.attachEvent("onEventAdded", function(id,event){
        let type = automation[event.automation];
    });

    const getEventText = function (start, end, event) {
        let type = automation[event.automation];
        currentEvent = event;
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
    scheduler.attachEvent("onLightboxButton", function(id,event){
        log("scheduler button " + id);
    });
    scheduler.attachEvent("onEventAdded", getEventColor);
    scheduler.attachEvent("onEventChanged", getEventColor);
    scheduler.attachEvent("onBeforeViewChange", resetSchedulerLayoutConfig);
    scheduler.attachEvent("onSchedulerResize", resetSchedulerLayoutConfig);
    scheduler.attachEvent("onSchedulerReady", function () {
        requestAnimationFrame(function () {
            scheduler.setCurrentView(new Date(), "week");
            scheduler.load('/json/events.json');
        });
    });
}
