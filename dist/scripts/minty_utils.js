function isCompact() {
    return window.innerWidth < 1000   
}

function getAvg(amounts) {
    const sum = amounts.reduce((a, b) => a + b, 0);
    return (sum / amounts.length) || 0;
}

function getById(id) {
    return document.getElementById(id);
}

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

function toCamelCase(str){
    return str.split(' ').map(function(word,index){
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}

function showUnderDevelopmentAlt() {
    PNotify.success({
        title: '<span style="color:white">Project Status :</span>     <span style="color:yellow">ALPHA</span>',
        text: '<b style="color:white">Currently under Development</b><br/><br/><span style="color:greenyellow;text-align:center">Some section are not fully working yet</span>',
        titleTrusted: true,
        textTrusted: true,
        icon: 'fad fa-laptop-code fa-2x',
        addClass: 'minty-notification ',
        shadow: true
    });
}
