let automation = null;
let conditions = null;

function initScheduler() {
    automation = loadJSON('/json/scheduler/automation.json');
    conditions = loadJSON('/json/scheduler/conditions.json');

    scheduler.config.responsive_lightbox = true;
    scheduler.config.multi_day = true;
    scheduler.config.prevent_cache = true;
    scheduler.locale.labels.timeline_tab = "Schedule";
    scheduler.locale.labels.unit_tab = "Events";
    scheduler.locale.labels.week_agenda_tab = "Agenda";
    scheduler.config.details_on_create = true;
    scheduler.config.details_on_dblclick = true;
    scheduler.config.include_end_by = true;
    scheduler.config.repeat_precise = true;
    scheduler.config.mark_now = true;
    // scheduler.config.wide_form = false;
   // scheduler.config.update_render = true;

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
        var event = scheduler.getEvent(id);
        let sections = document.getElementsByClassName("dhx_wrap_section");
        let resource = event['RESOURCE:'];
        let conditional = event[resource] && event[resource].startsWith('trigger:');

        for (let i = 1; i < sections.length-1; i++) {
            let section = sections[i];
            let title = sections[i].childNodes[0].innerText;
            let current = getTriggerIdFromTitle(title);
            if (resource == current) {
                section.style.display='inline';
            } else if (conditional && current == 'TRIGGER:') {
                section.style.display='inline';
            } else {
                section.style.display='none';
            }
        }
        scheduler.updateEvent(id);
    });

    scheduler.attachEvent("onEventSave",function(id,event,is_new){
        let resource = event['RESOURCE:'];
        if (resource == '__SELECT') {
            showMsg('warn', 'Missing Resource', 'Please select a resource to schedule','fal fa-exclamation-triangle fa-2x');
            return false;
        } else if (resource == 'CUSTOM:' && event['CUSTOM:'] == '') {
            showMsg('warn', 'Missing Notes', 'Please enter some text for the notes','fal fa-exclamation-triangle fa-2x');
            return false;
        } else if (event[resource] == '') {
            showMsg('warn', 'Missing Action', 'Select the schedule action - timed / event ', getResourceIcon(event));
            return false;                      
        } 
        if (event[resource].startsWith('trigger:') &&  event['TRIGGER:'] == '__SELECT') {  
            showMsg('warn', 'Missing Condition', 'Select a condition trigger to apply to the schedule', getResourceIcon(event));
            return false;
        }
        event.automation = getEventTrigger(event);
        return true;
    });
    
    scheduler.attachEvent("onEventAdded", function(id, event){
        event.automation = getEventTrigger(event);
        return true;
    });
    
    scheduler.templates.week_agenda_event_text = function (start, end, event, date, position) {
        switch (position) {
            case "middle":
                return getEventTextSmall(start, end, event);
            case "end":
                return getEventTextSmall(start, end, event);
            case "start":
                return getEventTextSmall(start, end, event);
            default:
                return  + getEventTypeDesc(event) + scheduler.templates.event_date(start) + " " + event.text;
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
    { key: "", label: 'Select Action...' },
    { key: "off", label: 'Switch Off' },
    { key: "on", label: 'Switch On' },
    { key: "trigger:off", label: 'Conditional Off' },
    { key: "trigger:on", label: 'Conditional On' },
];

const HIGH_LOW_OFF = [
    { key: "", label: 'Select Action...' },
    { key: "off", label: 'Switch Off' },
    { key: "low", label: 'Switch On Low' },
    { key: "high", label: 'Switch On High' },
    { key: "trigger:off", label: 'Conditional Off' },
    { key: "trigger:low", label: 'Conditional Low' },
    { key: "trigger:high", label: 'Conditional High' },
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

function getEventTypeDesc(event, small) {
    if (event.automation.condition != null) {
        return '<br/><i class="fal fa-ballot-check' + (small ? '' : ' fa-2x') + '"></i> <i class="' + getResourceIcon(event) + '"></i>';
    } else {
        return '<br/><i class="fal fa-clock' + (small ? '' : ' fa-2x') + '"></i> <i class="' + getResourceIcon(event) + '"></i>';
    }
}

function getTriggerDesc(trigger) {
    return (trigger.replace('trigger:','').toLowerCase());
}

function getConditionDesc(action) {
    let desc;
    conditions.forEach(condition => {
        if (condition.key == action) {
            desc = ' if ' + condition.label + '.';
        }
    });
    return desc.toLowerCase();
}

const getEventTextSmall = function (start, end, event) {
    let type = getAutomation(event);
    if (type) {
        let action = event['TRIGGER:'];
        let resource = event['RESOURCE:'];
        let trigger = event[resource];
        if (event.automation.condition != null) {
            return getEventTypeDesc(event, true) + " Switch " + type.label.toLowerCase() + ' ' + getTriggerDesc(trigger) + getConditionDesc(action);
        } else {
            return getEventTypeDesc(event, true) + " Switch " + type.label.toLowerCase() + ' ' + getTriggerDesc(trigger);
        }
    } else {
        return "New Schedule";
    }
};

const getEventText = function (start, end, event) {
    let type = getAutomation(event);
    if (type) {
        let action = event['TRIGGER:'];
        let resource = event['RESOURCE:'];
        let trigger = event[resource];
        if (event.automation.condition != null) {
            return "Switch " + type.label.toLowerCase() + ' ' + getTriggerDesc(trigger) + getConditionDesc(action) + getEventTypeDesc(event);
        } else {
            return "Switch " + type.label.toLowerCase() + ' ' + getTriggerDesc(trigger) + getEventTypeDesc(event);
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

function getResourceIcon(event) {
    let resource = event['RESOURCE:'];
    let trigger = (event.automation) ? event.automation.trigger : event[resource];
    let off = (trigger == 'trigger:off' || trigger == 'off' || trigger == '');
    switch (resource) {
        case 'CUSTOM:' : 
            return 'fa-2x fal fa-clipboard ' + (off ? '' : 'fa-beat');
        case 'LIGHT:' : 
            return 'fa-2x fal fa-lightbulb-on ' + (off ? '' : 'fa-beat');
        case 'FAN:EXTRACT:' : 
            return 'fa-2x fal fa-fan ' + (off ? '' : 'fa-spin');
        case 'FAN:INTAKE:' : 
            return 'fa-2x fal fa-hurricane ' + (off ? '' : 'fa-spin');
        case 'FAN:OSCILLATING:' : 
            return 'fa-2x fal fa-fan-table ' + (off ? '' : 'fa-beat');
        case 'WATER:HEATER:' : 
            return 'fa-2x fal fa-water ' + (off ? '' : 'fa-beat');
        case 'AIR:HEATER:' : 
            return 'fa-2x fal fa-heat ' + (off ? '' : 'fa-beat');
        case 'HUMIDIFIER:' : 
            return 'fa-2x fal fa-tint ' + (off ? '' : 'fa-beat');
        case 'DE:HUMIDIFIER:' : 
            return 'fa-2x fal fa-tint-slash ' + (off ? '' : 'fa-beat');
        case 'AIR:PUMP:' : 
            return 'fa-2x fal fa-wind ' + (off ? '' : 'fa-beat');
        case 'RECIRCULATING:PUMP:' : 
            return 'fa-2x fal fa-cog ' + (off ? '' : 'fa-spin');
    }
}