let className = "";

let type = "error";
let text = "";
let title = "";
let desktop = false;
let icon;
let shadow = true;
let hide = true;
let history;
var wrapper;

var buttons = {
    modules: {
        Buttons: {
            closerHover: true,
            stickerHover: true
        }
    }
};

function showServerConfirmation(msg) {
    showMsg('confirmation', msg.title, msg.text, msg.icon + ' fa-3x'); 
}

function showMsg(type, title, text, icon) {
    let core = {
        text: text,
        title: title,
        type: type,
        titleTrusted: true,
        textTrusted: true,
        icon: icon,
        addClass: "nonblock translucent minty-notification " + className,
        shadow: shadow,
        delay: 3000,
        hide: hide
    };

    if (desktop === true) {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
            //            PNotify.modules.Desktop.permission();
        }
        var modules = {
            modules: {
                Desktop: {
                    desktop: desktop
                },
                Mobile: {
                    swipeDismiss: true
                }
            }
        };
    }

    wrapper = Object.assign({}, core, modules, buttons);
    if (desktop === true) {
        wrapper.icon = icon || "fad fa-exclamation-triangle fa-2x";
    }
    switch (type) {
        case "info":
            wrapper.icon = icon || "fas fa-info-circle fa-2x";
            PNotify.info(wrapper);
            break;
        case "success":
            wrapper.icon = icon || "fas fa-question-circle fa-2x";
            PNotify.success(wrapper);
            break;
        case "warning":
            wrapper.icon = icon || "far fa-exclamation-circle fa-2x";
            PNotify.notice(wrapper);
            break;
        case "error":
            wrapper.icon = icon || "fad fa-engine-warning fa-2x";
            PNotify.error(wrapper);
            break;
        case "confirmation":
            wrapper.addClass += " minty-confirmation";
            wrapper.icon = icon || "fas raspberry-pi fa-2x fa-spin";
            PNotify.notice(wrapper);
            break;
        case "notice":
        default:
            wrapper.addClass += " minty-notice";
            wrapper.icon = icon || "fas fa-question-circle fa-2x";
            PNotify.notice(wrapper);
    }
}

function hideMissingMintyHydroHubError() {
    if (window.permanotice != null) {
        window.permanotice.close();
    }
}

function showMissingMintyHydroHubError(reason) {
    if (window.permanotice) {
        window.permanotice.open();
    } else {
        window.permanotice = PNotify.error({
            title: 'Offline Mode',
            text: 'Minty Hydro Hub Not Connected',
            hide: false,
            icon: 'fad fa-wifi-slash fa-2x',
            width: '400px',
            textTrusted: true,
            modules: {
                Buttons: {
                    closer: true,
                    sticker: false,
                    classes: {
                        closer: 'fas fa-bomb',
                        pinUp: 'fas fa-anchor',
                        pinDown: 'fas fa-hourglass'
                    }
                },
                Mobile: {
                    swipeDismiss: true
                }
            }
        });
    }
}