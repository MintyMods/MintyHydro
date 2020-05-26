const io = require('socket.io-client');
const Encoder7Bit = require('encoder7bit');
const config = require('./MintyConfig');
const socket = io.connect(config.url);

const MintyIO = function (board, serial) {
    this.board = board;
    this.serial = serial;

    this.getSocket = function () {
        return socket;
    },

        this.sendRF = function (code) {
            if (config.isSendingRfSignals) {
                log("RF@" + code);
                this.sendSerial(config.RCT_OUTPUT_DETACH, config.RCT_OUT_PIN);
                this.sendSerial(config.RCT_OUTPUT_ATTACH, config.RCT_OUT_PIN);
                if (config.RCT_PULSE_LENGTH) {
                    this.sendSerial(config.RCT_OUTPUT_PULSE_LENGTH, config.RCT_OUT_PIN, config.RCT_PULSE_LENGTH);
                }
                let bytes = Encoder7Bit.to7BitArray([0x18, 0x00].concat(this.longToByteArray(code)));
                this.sendSerial(config.RCT_OUTPUT_CODE_LONG, config.RCT_OUT_PIN, bytes);
            } else {
                warn("RF@" + code + " - surpressed");
            }
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
    this.socketBroadcast = function (namespace, payload) {
        log("BroadCast@" + namespace, payload != undefined ? payload : "");
        socket.broadcast.emit(namespace, payload);
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
    console.warn("[" + (new Date()).toUTCString() + "]  ** ALERT ** [IO] " + msg, payload != undefined ? payload : "");
}

function log(msg, payload) {
    if (config.debug) console.log("[" + (new Date()).toUTCString() + "]  [IO] " + msg, payload != undefined ? payload : "");
}

function lookupAtlasChannel(command) {
    switch (command) {
        case 99:
            return "PH";
        case 102:
            return "Temp";
        case 100:
            return "EC";
        default:
            return "FAILED:" + command;
    }
}
function lookupAtlasCommand(command) {
    switch (command) {
        case config.ATLAS_READ_CHARCODE:
            return "READ Sensor";
        default:
            return "FAILED:" + command;
    }
}

module.exports = MintyIO;