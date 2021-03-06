let automation = null;
let conditions = null;
let nutrients = null;

const EXCLUDED_SECTIONS = 1;

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

function initScheduler() {
    automation = loadJSON('/json/scheduler/automation.json');
    conditions = loadJSON('/json/scheduler/conditions.json');
    nutrients = loadJSON('/json/nutrients/nutrients.json');

    scheduler.config.responsive_lightbox = true;
    scheduler.config.multi_day = true;
    scheduler.config.prevent_cache = true;
    scheduler.locale.labels.timeline_tab = "Schedule";
    scheduler.locale.labels.unit_tab = "Events";
    scheduler.locale.labels.week_agenda_tab = "Agenda";
    scheduler.config.details_on_create = true;
    scheduler.config.details_on_dblclick = true;
    scheduler.config.date_format = "%Y-%m-%d %H:%i";

    //YYYY-MM-DD HH:MM

    // scheduler.config.repeat_precise = true;
    // scheduler.config.mark_now = true;
    // scheduler.config.repeat_date = "%m/%d/%Y";
    // scheduler.config.include_end_by = true;
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
        { name: "Resource", tag: "RESOURCE:", type: "select", map_to: "RESOURCE:", options: automation, onchange: hideLightBoxControls },
        { name: "Custom Notes", tag: "CUSTOM:", height: 50, map_to: "CUSTOM:", type: "textarea" },
        { name: "Light", tag: "CONTROL:LIGHT:", options: ON_OFF, map_to: "CONTROL:LIGHT:", type: "select", onchange: checkTriggerEnabled },
        { name: "Extract Fan", tag: "CONTROL:AIR_EXTRACT_FAN:", options: ON_OFF, map_to: "CONTROL:AIR_EXTRACT_FAN:", type: "select", onchange: checkTriggerEnabled },
        { name: "Intake Fan", tag: "CONTROL:AIR_INTAKE_FAN:", options: HIGH_LOW_OFF, map_to: "CONTROL:AIR_INTAKE_FAN:", type: "select", onchange: checkTriggerEnabled },
        { name: "Std Fan A", tag: "CONTROL:AIR_MOVEMENT_FAN_A:", options: ON_OFF, map_to: "CONTROL:AIR_MOVEMENT_FAN_A:", type: "select", onchange: checkTriggerEnabled },
        { name: "Std Fan B", tag: "CONTROL:AIR_MOVEMENT_FAN_B:", options: ON_OFF, map_to: "CONTROL:AIR_MOVEMENT_FAN_B:", type: "select", onchange: checkTriggerEnabled },
        { name: "Water Heater", tag: "CONTROL:WATER_HEATER:", options: ON_OFF, map_to: "CONTROL:WATER_HEATER:", type: "select", onchange: checkTriggerEnabled },
        { name: "Air Heater", tag: "CONTROL:HEATER:", options: ON_OFF, map_to: "CONTROL:HEATER:", type: "select", onchange: checkTriggerEnabled },
        { name: "Humidifier", tag: "CONTROL:HUMIDIFIER:", options: HIGH_LOW_OFF, map_to: "CONTROL:HUMIDIFIER:", type: "select", onchange: checkTriggerEnabled },
        { name: "De-Humidifier", tag: "CONTROL:DEHUMIDIFIER:", options: ON_OFF, map_to: "CONTROL:DEHUMIDIFIER:", type: "select", onchange: checkTriggerEnabled },
        { name: "Air Pump", tag: "CONTROL:AIR_PUMP:", options: ON_OFF, map_to: "CONTROL:AIR_PUMP:", type: "select", onchange: checkTriggerEnabled },
        { name: "Recirculating Pump", tag: "CONTROL:WATER_PUMP:", options: ON_OFF, map_to: "CONTROL:WATER_PUMP:", type: "select", onchange: checkTriggerEnabled },
        { name: "Fill Pump", tag: "PUMP:FILL:", options: ON_OFF, map_to: "PUMP:FILL:", type: "select", onchange: checkTriggerEnabled },
        { name: "Drain Pump", tag: "PUMP:DRAIN:", options: ON_OFF, map_to: "PUMP:DRAIN:", type: "select", onchange: checkTriggerEnabled },
        { name: "Drip Feed Pump", tag: "PUMP:DRIP:", options: ON_OFF, map_to: "PUMP:DRIP:", type: "select", onchange: checkTriggerEnabled },
        { name: "Nutrient", tag: "NUTRIENT:DOSE:", options: nutrients, map_to: "NUTRIENT:DOSE:", type: "select", onchange: checkTriggerEnabled },
        { name: "Condition", tag: "TRIGGER:", type: "select", map_to: "TRIGGER:", options: conditions, onchange: getEventConditions },
        // { name:"recurring",  type:"recurring", map_to:"rec_type",  button:"recurring"},
        { name: "Time", tag: "_TIME", type: "calendar_time", map_to: "time" } 
    ];

    scheduler.attachEvent("onLightbox", function (id) {
        var event = scheduler.getEvent(id);
        let sections = document.getElementsByClassName("dhx_wrap_section");
        let resource = event['RESOURCE:'];
        let conditional = event[resource] && event[resource].startsWith('trigger:');

        for (let i = 1; i < (sections.length - EXCLUDED_SECTIONS); i++) {
            let section = sections[i];
            let title = sections[i].childNodes[0].innerText;
            let current = getTriggerIdFromTitle(title);
            if (resource == current) {
                section.style.display = 'inline';
            } else if (resource == 'Condition' || resource == 'recurring' || resource == 'Time') {
                section.style.display = 'inline';
            } else if (conditional && current == 'TRIGGER:') {
                section.style.display = 'inline';
            } else {
                section.style.display = 'none';
            }
        }
        scheduler.updateEvent(id);
    });

    scheduler.attachEvent("onEventSave", function (id, event, is_new) {
        event.automation = getEventTrigger(event);
        let resource = event['RESOURCE:'];
        if (resource == '__SELECT') {
            showMsg('warn', 'Missing Resource', 'Please select a resource to schedule', 'fal fa-exclamation-triangle');
            return false;
        } else if (resource == 'CUSTOM:' && event['CUSTOM:'] == '') {
            showMsg('warn', 'Missing Notes', 'Please enter some text for the notes', 'fal fa-exclamation-triangle');
            return false;
        } else if (event[resource] == '') {
            showMsg('warn', 'Missing Action', 'Select the schedule action - timed / event ', getResourceIcon(event));
            return false;
        }
        if ((event[resource].startsWith('trigger:') || resource == 'NUTRIENT:DOSE:') && event['TRIGGER:'] == '__SELECT') {
            showMsg('warn', 'Missing Condition', 'Select a condition trigger to apply to the schedule', getResourceIcon(event));
            return false;
        }
        return true;
    });

    scheduler.attachEvent("onEventAdded", function (id, event) {
        event.automation = getEventTrigger(event);
        getEventColor(event.id, event);
        event.desc = getEventText(event.start_date, event.end_date, event);
        saveSchedulerEvent(event);
    });
    scheduler.attachEvent("onEventChanged", function (id, event) {
        event.automation = getEventTrigger(event);
        getEventColor(event.id, event);
        event.desc = getEventText(event.start_date, event.end_date, event);
        saveSchedulerEvent(event);
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
                return + getEventTypeDesc(event) + scheduler.templates.event_date(start) + " " + event.text;
        }
    };
    scheduler.templates.event_bar_text = getEventText;
    scheduler.templates.event_text = getEventText;
    scheduler.attachEvent("onBeforeViewChange", resetSchedulerLayoutConfig);
    scheduler.attachEvent("onSchedulerResize", resetSchedulerLayoutConfig);
    scheduler.attachEvent("onSchedulerReady", function () {
        requestAnimationFrame(function () {
            scheduler.setCurrentView(new Date(), "week");
            scheduler.load('/json/events.json');
            loadSchedulerEvents();
        });
    });
}

function processSchedulerEvents(data) {
    data.rows.forEach(function (row) {
        let event = {
            id: row.id,
            start_date: row.start_date,
            end_date: row.end_date,
            text: row.text,
            textColor: row.textColor,
            color: row.color,
            '_timed': true,
            'RESOURCE:': row.resource,
            'TRIGGER:': row.condition,
            'label': "__SELECT",
            [row.resource]: row.trigger,
            automation: {
                'resource': row.resource,
                'trigger': row.trigger,
                'condition': row.condtion,
                'id': row.id
            },
            time: {
                "start_date": row.start_date,
                "end_date": row.end_date
            }
        }
        scheduler.addEvent(event);
    });

}

function checkTriggerEnabled(event) {
    var e = event || window.event, node = this;
    let sections = document.getElementsByClassName("dhx_wrap_section");
    let show = node.value.startsWith('trigger:') || (node.value.indexOf('- (Pump ') != -1);
    sections[sections.length - (EXCLUDED_SECTIONS + 1)].style.display = (show) ? 'inline' : 'none';
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
    for (let i = 1; i < (sections.length - EXCLUDED_SECTIONS); i++) {
        let section = sections[i].childNodes[0].innerText;
        section = getTriggerIdFromTitle(section);
        sections[i].style.display = (section == selected) ? 'inline' : 'none';
    }
}

function getEventConditions(event) {
    let selected = event.currentTarget.value;
}

function getAutomation(event) {
    let resource = event['RESOURCE:'];
    if (resource) {
        for (let i = 0; i < automation.length; i++) {
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
    let condition = (trigger.indexOf('trigger:') != -1) ? event['TRIGGER:'] : null;
    return { resource, trigger, condition, id };
}

function getTriggerDesc(trigger) {
    let text = trigger.replace('trigger:', '');
    if (text == 'low' || text == 'high') {
        return 'on ' + text;
    } else {
        return text;
    }
}

function getConditionDesc(action) {
    let desc;
    conditions.forEach(condition => {
        if (condition.key == action) {
            desc = ' if ' + condition.label + '.';
        }
    });
    return desc ? desc.toLowerCase() : '';
}

const getEventTextSmall = function (start, end, event) {
    let type = getAutomation(event);
    if (type) {
        let action = event['TRIGGER:'];
        let resource = event['RESOURCE:'];
        let trigger = event[resource];
        if (resource == "CUSTOM:") {
            return trigger;
        } else if (event.automation.condition != null) {
            return getEventTypeDesc(event, true) + " Switch " + type.label.toLowerCase() + ' ' +
                getTriggerDesc(trigger).toLowerCase() + getConditionDesc(action);
        } else {
            return getEventTypeDesc(event, true) + " Switch " + type.label.toLowerCase() + ' ' +
                getTriggerDesc(trigger).toLowerCase();
        }
    }
};

const getEventText = function (start, end, event) {
    let type = getAutomation(event);
    if (type) {
        let action = event['TRIGGER:'];
        let resource = event['RESOURCE:'];
        let trigger = event[resource];
        if (resource == "CUSTOM:") {
            return trigger;
        } else if (resource == "NUTRIENT:DOSE:") {
            return "Run " + type.label.toLowerCase() + ' ' + getTriggerDesc(trigger) +
                getConditionDesc(action) + getEventTypeDesc(event);
        } else if (event.automation.condition != null) {
            return "Switch " + type.label.toLowerCase() + ' ' + getTriggerDesc(trigger).toLowerCase()
                + getConditionDesc(action) + getEventTypeDesc(event);
        } else {
            return "Switch " + type.label.toLowerCase() + ' ' + getTriggerDesc(trigger).toLowerCase()
                + getEventTypeDesc(event);
        }
    } else {
        return "Create New Schedule";
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

function getEventTypeDesc(event, small) {
    if (event.automation.condition != null) {
        return '<br/><div class="fa-stack"><i class="event-icon fal fa-ballot-check' + (small ? '' : ' fa-2x') + '"></i></div>' + getResourceIcon(event);
    } else {
        return '<br/><div class="fa-stack"><i class="event-icon fal fa-clock' + (small ? '' : ' fa-2x') + '"></i></div>' + getResourceIcon(event);
    }
}

function getResourceIcon(event) {
    let resource = event['RESOURCE:'];
    let trigger = (event.automation) ? event.automation.trigger : event[resource];
    let off = (trigger == 'trigger:off' || trigger == 'off' || trigger == '');
    let icon = '';
    switch (resource) {
        case 'CUSTOM:':
            icon = 'event-icon fal fa-clipboard ' + (off ? 'fa-stack-1x fa-2x' : 'fa-beat fa-2x');
            break;
        case 'CONTROL:LIGHT:':
            icon = 'event-icon fal ' + (off ? 'fa-lightbulb fa-stack-1x fa-2x' : 'fa-lightbulb-on fa-beat fa-2x');
            break;
        case 'CONTROL:CAMERA:':
            icon = 'event-icon fal ' + (off ? 'fa-camera-home fa-stack-1x fa-2x' : 'fa-camera-home fa-beat fa-2x');
            break;
        case 'CONTROL:AIR_EXTRACT_FAN:':
            icon = 'event-icon fal fa-fan ' + (off ? 'fa-stack-1x fa-2x' : 'fa-spin fa-2x');
            break;
        case 'CONTROL:AIR_INTAKE_FAN:':
            icon = 'event-icon fal fa-hurricane ' + (off ? 'fa-stack-1x fa-2x' : 'fa-spin fa-2x');
            break;
        case 'CONTROL:AIR_MOVEMENT_FAN_A:':
        case 'CONTROL:AIR_MOVEMENT_FAN_B:':
            icon = 'event-icon fal fa-fan-table ' + (off ? 'fa-stack-1x fa-2x' : 'fa-beat fa-2x');
            break;
        case 'CONTROL:WATER_HEATER:':
            icon = 'event-icon fal fa-water ' + (off ? 'fa-stack-1x fa-2x' : 'fa-beat fa-2x');
            break;
        case 'CONTROL:HEATER:':
            icon = 'event-icon fal fa-heat ' + (off ? 'fa-stack-1x fa-2x' : 'fa-beat fa-2x');
            break;
        case 'CONTROL:HUMIDIFIER:':
            icon = 'event-icon fal fa-tint ' + (off ? 'fa-stack-1x fa-2x' : 'fa-beat fa-2x');
            break;
        case 'CONTROL:DEHUMIDIFIER:':
            icon = 'event-icon fal fa-tint-slash ' + (off ? 'fa-stack-1x fa-2x' : 'fa-beat fa-2x');
            break;
        case 'CONTROL:AIR_PUMP:':
            icon = 'event-icon fal fa-wind ' + (off ? 'fa-stack-1x fa-2x' : 'fa-beat fa-2x');
            break;
        case 'CONTROL:WATER_PUMP:':
            icon = 'event-icon fal fa-cog ' + (off ? 'fa-stack-1x fa-2x' : 'fa-spin fa-2x');
            break;
        case 'PUMP:FILL:':
            icon = 'event-icon fal fa-cog ' + (off ? 'fa-stack-1x fa-2x' : 'fa-spin fa-2x');
            break;
        case 'PUMP:DRAIN:':
            icon = 'event-icon fal fa-cog ' + (off ? 'fa-stack-1x fa-2x' : 'fa-spin fa-2x');
            break;
        case 'PUMP:DRIP:':
            icon = 'event-icon fal ' + (off ? 'fa-stack-1x fa-faucet fa-2x' : ' fa-faucet-drip fa-beat fa-2x');
            break;
        case 'NUTRIENT:DOSE:':
            icon = 'event-icon fal ' + (off ? 'fa-stack-1x fa-faucet fa-2x' : ' fa-faucet-drip fa-beat fa-2x');
            break;
    }
    if (off) {
        icon = '<div class="fa-stack"><i class="' + icon + '"></i><i class="event-icon-ban fas fa-slash fa-stack-2x fa-2x"></i></div>';
    } else {
        icon = '<div class="fa-stack"><i class="' + icon + '"></i></div>';
    }
    return icon;
}