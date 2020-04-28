
const io = require('socket.io-client');
const Encoder7Bit = require('encoder7bit');
const config = require('./mintyConfig');
const socket = io.connect(config.url);

const MintyIO = function(board, serial) {
    this.board = board;
    this.serial = serial;

    this.sendRF = function(code) {
        log('RF[' + code + '] - ' + lookupRfCode(code));
        this.sendSerial(config.RCT_OUTPUT_DETACH, config.RCT_OUT_PIN);
        this.sendSerial(config.RCT_OUTPUT_ATTACH, config.RCT_OUT_PIN);
        if (config.RCT_PULSE_LENGTH) {
            this.sendSerial(config.RCT_OUTPUT_PULSE_LENGTH, config.RCT_OUT_PIN, config.RCT_PULSE_LENGTH);
        }
        let bytes = Encoder7Bit.to7BitArray([0x18, 0x00].concat(this.longToByteArray(code)));
        this.sendSerial(config.RCT_OUTPUT_CODE_LONG, config.RCT_OUT_PIN, bytes);
    }.bind(this);
    
    /* rework of https://github.com/git-developer/RCSwitchFirmata */
    this.sendSerial = function (command, pin, val) {
        var data = [];
        data.push(config.SYSEX_START);
        data.push(config.RCT_OUTPUT_DATA);
        data.push(command);
        data.push(pin);
        if (val) {
            if (Array.isArray(val)) {
                for (var i = 0; i < val.length; i++) {
                data.push(val[i]);
                }
            } else {
                data.push(val & 0x7F);
                val = val >> 7;
                data.push(val & 0x7F);
                val = val >> 7;
                data.push(val & 0x7F);
            }
        }
        data.push(config.SYSEX_END);
        this.serial.write(data);
    }.bind(this);    
    
    /* Communicate with the Atlas Tenticle Shield, Motor Shields, etc via I2C */
    this.sendAtlasI2C = function (channel, command, callback) {
        log('I2C[' + lookupAtlasChannel(channel) + '] Sending Command: ' + lookupAtlasCommand(command));
        this.board.io.i2cWrite(channel, command);
        this.board.wait(config.ATLAS_DELAY, function () {
            this.board.i2cReadOnce(channel, config.ATLAS_BYTES_TO_READ, function (bytes) {
                let data = (String.fromCharCode(...bytes.filter(Boolean)));
                data = data.slice(1, data.length);
                log('I2C[' + channel + '] Result: ' + data);
                callback(data);
             });
        }.bind(this));
    }.bind(this);
    
    this.socketEmit = function (namespace, payload) {
        log("EMIT@" + namespace, payload != undefined ? payload : "");
        socket.emit(namespace, payload);
    }.bind(this);

    // https://stackoverflow.com/questions/8482309/converting-javascript-integer-to-byte-array-and-back
    this.longToByteArray = function (long) {
        var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
        for (var index = 0; index < byteArray.length; index++) {
            var byte = long & 0xff;
            byteArray[index] = byte;
            long = (long - byte) / 256;
        }
        return byteArray;
    };
    
    this.byteArrayToLong = function (byteArray) {
        var value = 0;
        for (var i = byteArray.length - 1; i >= 0; i--) {
            value = (value * 256) + byteArray[i];
        }
        return value;
    };
    
}
function warn(msg, payload) {
    console.warn("** ALERT ** [IO] " + msg,  payload != undefined ? payload : "");
  }
function log(msg, payload) {
    if (config.debug) console.log("[IO] " + msg,  payload != undefined ? payload : "");
}

function lookupAtlasChannel(command) {
    switch (command) {
        case 99 : 
            return "PH";
        case 102 : 
            return "Temp";
        case 100 :
            return "EC";
        default : 
            return "FAILED:" + command;
    }
}
function lookupAtlasCommand(command) {
    switch (command) {
        case config.ATLAS_READ_CHARCODE : 
            return "READ Sensor";
        default : 
            return "FAILED:" + command;
    }
}


function lookupRfCode(code) {
    if (code == config.RF_CODE_S1_ON) {
        return "Dehumidifier On";
    } else if (code == config.RF_CODE_S1_OFF) {
        return "Dehumidifier Off";
    } else if (code == config.RF_CODE_S2_ON) {
        return "Heater On";
    } else if (code == config.RF_CODE_S2_OFF) {
        return "Heater Off";
    } else if (code == config.RF_CODE_S3_ON) {
        return "";
    } else if (code == config.RF_CODE_S3_OFF) {
        return "";
    } else if (code == config.RF_CODE_S4_ON) {
        return "Extract Fan On";
    } else if (code == config.RF_CODE_S4_OFF) {
        return "Extract Fan Off";
    } else if (code == config.RF_CODE_S5_ON) {
        return "Light On";
    } else if (code == config.RF_CODE_S5_OFF) {
        return "Light Off";
    } else if (code == config.RF_CODE_Q4_ON) {
        return "Oscillating Fan On";
    } else if (code == config.RF_CODE_Q4_OFF) {
        return "Oscillating Fan Off";
    } else if (code == config.RF_CODE_Q3_ON) {
        return "Air Pump On";
    } else if (code == config.RF_CODE_Q3_OFF) {
        return "Air Pump Off";
    } else if (code == config.RF_CODE_Q1_ON) {
        return " On";
    } else if (code == config.RF_CODE_Q1_OFF) {
        return " Off";
    } else if (code == config.RF_CODE_Q2_ON) {
        return " On";
    } else if (code == config.RF_CODE_Q2_OFF) {
        return " Off";
    } else if (code == config.MINTY_FDD.RES) {
        return "Drain Reservoir";
    } else if (code == config.MINTY_FDD.POTS) {
        return "Drain Pots";
    } else if (code == config.MINTY_FDD.DRAIN) {
        return "Drain Reservoir & Pots";
    } else if (code == config.MINTY_FDD.FILL) {
        return "Fill Reservoir from Tank";
    } else if (code == config.MINTY_FDD.DRIP) {
        return "Drip Feed";
    } else if (code == config.MINTY_FDD.OFF) {
        return "Close All Minty-FDD ";
    } else if (code == config.RF_CODE_INTAKE_LOW) {
        return "Intake Fan Low";
    } else if (code == config.RF_CODE_INTAKE_HIGH) {
        return "Intake Fan High";
    } else if (code == config.RF_CODE_INTAKE_OFF) {
        return "Intake Fan Off";
    } else if (code == config.RF_CODE_HUMID_LOW) {
        return "Humidity Low";
    } else if (code == config.RF_CODE_HUMID_HIGH) {
        return "Humidity High";
    } else if (code == config.RF_CODE_HUMID_OFF_LOW) {
        return "Humidity Low Off";
    } else if (code == config.RF_CODE_HUMID_OFF_HIGH) {
        return "Humidity High Off";
    } else {
        return "FAILED to lookup RF Code:'" + code +"'";
    }
}



module.exports = MintyIO;