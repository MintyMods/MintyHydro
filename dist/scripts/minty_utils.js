
function isMobile() {

}

function showUnderDevelopmentAlt() {
    PNotify.success({
        title: '<span style="color:white">Project Status :</span>     <span style="color:yellow">ALPHA</span>',
        text: '<b style="color:white">Currently under Development</b><br/><br/><span style="color:greenyellow;text-align:center">Mobile Support has not yet been fully added so larger browser viewing is recommended</span>',
        titleTrusted: true,
        textTrusted: true,
        icon: 'fad fa-laptop-code fa-2x',
        addClass: 'minty-notification ',
        shadow: true
    });
}


// const getPumpIcon = function (item) {
//     if (item.active) {
//         return '<i class="fal fa-cog fa-spin pump-running"></i>';
//     } else if (item.state == 'auto') {
//         return '<i class="fal fa-faucet-drip pump-stopped"></i>';
//     } else {
//         return '<i class="fal fa-faucet pump-stopped dhx_form-group--disabled"></i>';
//     }
// }

// const getPumpTemplate = function (item) {
//     let item = '<div class="' + (item.active ? 'pump-running' : 'pump-stopped') + (item.state == 'off' ? ' dhx_form-group--disabled' : '') + '">' +
//         getPumpIcon(item) + '<span class="title">  ' + item.value + '</span></div>';
//     return item;
// }

function loadJSONAsync(url, callback) {
    console.log("Loading JSON ASync");
    let request = new XMLHttpRequest();
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
    let xmlhttp = new XMLHttpRequest();
    try {
        xmlhttp.open("GET", url, false);
        if (xmlhttp.overrideMimeType) {
            xmlhttp.overrideMimeType("application/json");
        }
        xmlhttp.send();
        if (xmlhttp.status == 200) {
            return JSON.parse(xmlhttp.responseText);
        } else {
            throw "Failed to load " + url;
        }
    } catch (e) {
        console.log(e);
    }
}

