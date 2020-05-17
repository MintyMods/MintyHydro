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

    scheduler.config.lightbox.sections = [
        { name:"Resource", tag:"RESOURCE:", type: "select", map_to: "RESOURCE:", options: automation, onchange:hideLightBoxControls },
        { name:"Custom Notes", tag:"CUSTOM:", height:50, map_to:"CUSTOM:", type:"textarea" },
        { name:"Light", tag:"LIGHT:", options:ON_OFF, map_to:"LIGHT:", type:"select", onchange:checkTriggerEnabled },
        { name:"Extract Fan", tag:"FAN:EXTRACT:", options:ON_OFF, map_to:"FAN:EXTRACT:", type:"select", onchange:checkTriggerEnabled },
        { name:"Intake Fan", tag:"FAN:INTAKE:", options:HIGH_LOW_OFF, map_to:"FAN:INTAKE:", type:"select", onchange:checkTriggerEnabled  },
        { name:"Oscillating Fans", tag:"FAN:OSCILLATING:", options:ON_OFF, map_to:"FAN:OSCILLATING:", type:"select", onchange:checkTriggerEnabled  },
        { name:"Water Heater", tag:"WATER:HEATER:", options:ON_OFF,  map_to:"WATER:HEATER:", type:"select", onchange:checkTriggerEnabled  },
        { name:"Air Heater", tag:"AIR:HEATER:", options:ON_OFF,  map_to:"AIR:HEATER:", type:"select", onchange:checkTriggerEnabled  },
        { name:"Humidifier", tag:"HUMIDIFIER:", options:HIGH_LOW_OFF, map_to:"HUMIDIFIER:", type:"select", onchange:checkTriggerEnabled  },
        { name:"De-Humidifier", tag:"DE:HUMIDIFIER:", options:ON_OFF, map_to:"DE:HUMIDIFIER:", type:"select", onchange:checkTriggerEnabled  },
        { name:"Air Pump", tag:"AIR:PUMP:", options:ON_OFF, map_to:"AIR:PUMP:", type:"select", onchange:checkTriggerEnabled  },
        { name:"Recirculating Pump", tag:"RECIRCULATING:PUMP:", options:ON_OFF, map_to:"RECIRCULATING:PUMP:", type:"select", onchange:checkTriggerEnabled  },
        { name:"Condition", tag:"TRIGGER:", type: "select", map_to: "TRIGGER:", options: conditions, onchange:getEventConditions },
        // { name:"Recurring", tag:"RECURRING:", height: 115, type: "recurring", map_to: "auto", button: "recurring" },
        { name:"Time", tag:"_TIME", type: "calendar_time", map_to: "time" }
    ];


    scheduler.attachEvent("onLightbox", function (id){
        let sections = document.getElementsByClassName("dhx_wrap_section");
        for (let i = 1; i < sections.length-1; i++) {
            let section = sections[i];
            section.style.display='none';
        }
        return true;
    });

    scheduler.attachEvent("onEventAdded", function(id, event){
        event.automation = getEventTrigger(event);
        let type = getAutomation(event);
        let color = getEventColor(event.id, event);
        
        return true;
    });
    
    scheduler.templates.week_agenda_event_text = function (start_date, end_date, event, date, position) {
        switch (position) {
            case "middle":
                return "-- " + getEventTypeDesc(event) + event.text;
            case "end":
                return "End: " + getEventTypeDesc(event) + scheduler.templates.event_date(start_date) + " " + event.text;
            case "start":
                return "Start: " + getEventTypeDesc(event) + scheduler.templates.event_date(start_date) + " " + event.text;
            default:
                return  + getEventTypeDesc(event) + scheduler.templates.event_date(start_date) + " " + event.text;
        }
    };

    scheduler.templates.event_bar_text = getEventText;
    scheduler.templates.event_text = getEventText;
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

function checkTriggerEnabled(event){
    var e = event || window.event, node = this;
    let sections = document.getElementsByClassName("dhx_wrap_section");
    sections[sections.length - 2].style.display= (node.value.startsWith('trigger:')) ? 'inline' : 'none';
}

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

function getAutomation(event) {
    let resource = event['RESOURCE:'];
    if (resource) {
        for (let i =0; i < automation.length; i++) {
            if (automation[i].key == resource) {
                return automation[i];
            }
        }
    }
    return null;
}

function getEventTrigger(event) {
    let id = event.id;
    let resource = event['RESOURCE:'];
    let trigger = event[resource];
    let condition = (trigger.indexOf('trigger:')!= -1) ? event['TRIGGER:'] : null;
    return { resource, trigger, condition, id };
}

function getEventTypeDesc(event) {
    let trigger = event['TRIGGER:'];
    if (event.automation.condition != null) {
        return '<br/>[Conditional=' + trigger +  '] <br/><i class="fal fa-ballot-check fa-2x"></i> <i class="fa-2x fa-beat ' + getResourceIcon(event) + '"></i>';
    } else {
        return '<br/><i class="fal fa-clock fa-2x"></i> <i class="fa-2x fa-beat ' + getResourceIcon(event) + '"></i>';
    }
}

function getResourceIcon(event) {
    let resource = event['RESOURCE:'];
    let condition = event.automation.condition;
    let trigger = event.automation.trigger;
    switch(resource) {
        case 'CUSTOM:' : 
        return 'fal fa-clipboard';
        case 'LIGHT:' : 
        return 'fal fa-lightbulb-on';
        case 'FAN:EXTRACT:' : 
        return 'fal fa-fan';
        case 'FAN:INTAKE:' : 
        return 'fal fa-hurricane';
        case 'FAN:OSCILLATING:' : 
        return 'fal fa-fan-table';
        case 'WATER:HEATER:' : 
        return 'fal fa-water';
        case 'AIR:HEATER:' : 
        return 'fal fa-heat';
        case 'HUMIDIFIER:' : 
        return 'fal fa-tint';
        case 'DE:HUMIDIFIER:' : 
        return 'fal fa-tint-slash';
        case 'AIR:PUMP:' : 
        return 'fal fa-wind';
        case 'RECIRCULATING:PUMP:' : 
        return 'fal fa-cog'; 
    }
}

const getEventText = function (start, end, event) {
    let type = getAutomation(event);
    currentEvent = event;
    if (type) {
        if (event.text == "New event") {
            return '<b>' + type.label + '</b>' + getEventTypeDesc(event);
        } else {
            return '<b>' + event.text + '</b>' + getEventTypeDesc(event);
        }
    } else {
        return "New Schedule";
    }
};

const getEventColor = function (id, event) {
    let type = getAutomation(event);
    if (type) {
        if (type.color) {
            event.color = type.color;
        }
        if (type.textColor) {
            event.textColor = type.textColor;
        }
    }
};
