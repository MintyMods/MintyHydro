
const getPumpIcon = function(item) {
    if (item.active) {
        return '<i class="fal fa-cog fa-spin pump-running"></i>';
    } else if (item.state == 'auto') {
        return '<i class="fal fa-faucet-drip pump-stopped"></i>';
    } else {
        return '<i class="fal fa-faucet pump-stopped dhx_form-group--disabled"></i>';
    }
}

const getPumpTemplate = function(item) {
    var item = '<div class="' + (item.active ? 'pump-running' : 'pump-stopped') + (item.state == 'off' ? ' dhx_form-group--disabled' : '') + '">' +
        getPumpIcon(item) + '<span class="title">  ' + item.value + '</span></div>';
    return item;
}

function loadJSONAsync(url, callback) {   
    console.log("Loading JSON ASync");
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open('GET', url, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == "200") {
            callback(JSON.parse(request.responseText));
        }
    };
    request.send(null);  
}

function loadJSON(url) {
    console.log("Loading JSON Sync");
  var xmlhttp=new XMLHttpRequest();
  try {
        xmlhttp.open("GET", url, false);
        if (xmlhttp.overrideMimeType) {
            xmlhttp.overrideMimeType("application/json"); 
        }
        xmlhttp.send();
        if (xmlhttp.status==200) {
            return JSON.parse(xmlhttp.responseText);
        } else {
            throw "Failed to load " + url;
        }
    } catch (e) {
        console.log(e);
    }
}

function isMobile() {
        
}


function showFatal() {
    if (typeof window.stackBarTop === 'undefined') {
        window.stackBarTop = {
            'dir1': 'down',
            'firstpos1': 0,
            'spacing1': 0,
            'push': 'top'
        };
    }
    var opts = {
        title: '',
        text: "",
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
        title: "",
        text: "",
        shadow: true,
        textTrusted: true,
        addClass: 'minty-msg minty-msg-notice ',
        icon: 'fad fa-comments-alt fa-2x'
    });    
}
function showInfo() {
    PNotify.info({
        title: "Notifications Not Implemented",
        text: "These will show any alerts from sensors, etc.",
        textTrusted: true,
        shadow: true,
        addClass: 'minty-msg minty-msg-info',
        icon: 'fad fa-heart-rate fa-2x'
    });    
}

function showNotice() {
    PNotify.notice({
        title: "",
        text: "",
        shadow: true,
        textTrusted: true,
        addClass: 'minty-msg minty-msg-warn',
        icon: 'fad fa-temperature-hot fa-2x'
    });    
}
function showError(){
    PNotify.error({
        title: "",
        text: "",
        shadow: true,
        textTrusted: true,
        addClass: 'minty-msg minty-msg-critical',
        icon: 'fad fa-fan fa-2x'
    });
}
