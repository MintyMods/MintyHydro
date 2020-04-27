
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

 
function showNotifications() {
    console.log("SHow notifications");
}

function loadJSON(url, callback) {   
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open('GET', url, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == "200") {
            callback(request.responseText);
        }
    };
    request.send(null);  
}
