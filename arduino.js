
const io = require('socket.io-client');
const five = require('johnny-five');
const config = require('./config');
const Serialport = require("serialport");
const Encoder7Bit = require('encoder7bit');

const serial = new Serialport(config.serialPort);
const board = new five.Board({ port: serial });

const RC_OUT_PIN = 2;
const RC_PULSE_LENGTH = 185;
const SYSEX_START = (0xF0);
const SYSEX_END = (0xF7);
const RCOUTPUT_DATA = (0x5C);
const RCOUTPUT_ATTACH = (0x01);
const RCOUTPUT_DETACH = (0x02);
const RCOUTPUT_PULSE_LENGTH = (0x12);
const RCOUTPUT_CODE_LONG = (0x22);

const RF_CODE_INTAKE_LOW = "7446194"; 
const RF_CODE_INTAKE_HIGH = "7446193"; 
const RF_CODE_INTAKE_OFF = "7446196";
const RF_CODE_HUMID_LOW = "12562584"; 
const RF_CODE_HUMID_HIGH = "12562578";
const RF_CODE_HUMID_OFF_LOW = "12562580"; 
const RF_CODE_HUMID_OFF_HIGH = "12562577";


const RF_CODE_12V_A = "2775137";
const RF_CODE_12V_B = "2775138"; // pulse Length 361
const RF_CODE_12V_C = "2775140";
const RF_CODE_12V_D = "2775144";

const RF_CODE_S1_ON = "5264691";
const RF_CODE_S1_OFF = "5264700";
const RF_CODE_S2_ON = "5264835";
const RF_CODE_S2_OFF = "5264844";
const RF_CODE_S3_ON = "5265155";
const RF_CODE_S3_OFF = "5265164";
const RF_CODE_S4_ON = "5266691";
const RF_CODE_S4_OFF = "5266700";
const RF_CODE_S5_ON = "5272835";
const RF_CODE_S5_OFF = "5272844";
const RF_CODE_Q1_ON = "8950879";
const RF_CODE_Q1_OFF = "8950878";
const RF_CODE_Q2_ON = "8950871";
const RF_CODE_Q2_OFF = "8950870";
const RF_CODE_Q3_ON = "8950875";
const RF_CODE_Q3_OFF = "8950874";
const RF_CODE_Q4_ON = "8950867";
const RF_CODE_Q4_OFF = "8950866";
const RF_CODE_QALL_ON = "8950877";
const RF_CODE_QALL_OFF = "8950876";


const RF = {
  Light : {
    on:  RF_CODE_S5_ON,
    off: RF_CODE_S5_OFF
  },
  DrainRes : {
    on:  RF_CODE_12V_A,
    off: RF_CODE_12V_B,
  },
  DrainPots : {
    on: RF_CODE_12V_C,
    off: RF_CODE_12V_D
  },
  WaterPump : {
    on: RF_CODE_Q1_ON,
    off:RF_CODE_Q1_OFF
  },
  AirPump : {
    on: RF_CODE_Q3_ON,
    off:RF_CODE_Q3_OFF
  },
  WaterHeater : {
    on: RF_CODE_Q2_ON,
    off:RF_CODE_Q2_OFF
  },
  Heater : {
    on: RF_CODE_S2_ON,
    off:RF_CODE_S2_OFF
  },  
  AirMovementFanSmall : {
    on: RF_CODE_Q4_ON,
    off:RF_CODE_Q4_OFF
  },
  AirMovementFanLarge : {
    on: RF_CODE_S3_ON,
    off:RF_CODE_S3_OFF
  },  
  AirExtractFan : {
    on: RF_CODE_S4_ON,
    off:RF_CODE_S4_OFF
  },  
  AirIntakeFan : {
    low: RF_CODE_INTAKE_LOW,
    high: RF_CODE_INTAKE_HIGH,
    off:RF_CODE_INTAKE_OFF
  },
  Dehumidifier : {
    on: RF_CODE_S1_ON,
    off:RF_CODE_S1_OFF
  },
  Humidifier : {
    low: RF_CODE_HUMID_LOW,
    high: RF_CODE_HUMID_HIGH,
    off_low:RF_CODE_HUMID_OFF_LOW, 
    off_high:RF_CODE_HUMID_OFF_HIGH
  },
  Extention : {
    on:  RF_CODE_QALL_ON,
    off: RF_CODE_QALL_OFF
  }

}

// Connect to the socket server
const socket = io.connect(config.url);
console.log("Minty-Hydro Arduino Controller starting - config URL: " + config.url);

board.on('ready', function() {
  console.log("Johnny-Five Board Init - " + config.serialPort);
  const led = new five.Led(config.ledPin);

  // try {
  //   // GROVE Motor Controller Test
  //   var pumpPhUp = new five.Motor({
  //     controller: "GROVE_I2C_MOTOR_DRIVER",
  //     pin: "A",
  //   });

  //   var pumpPhDown = new five.Motor({
  //     controller: "GROVE_I2C_MOTOR_DRIVER",
  //     pin: "B",
  //   });

  //   this.wait(3000, function() {
  //     console.log("PH Pumps FORWARD");
  //     pumpPhUp.fwd(127);
  //     pumpPhDown.fwd(127);

  //     // Demonstrate motor stop in 2 seconds
  //     this.wait(3000, function() {
  //       console.log("PH Pumps STOP");
  //       pumpPhUp.stop();
  //       pumpPhDown.stop();

  //       // Terminate Exit
  //       // this.wait(1000, function() {
  //       //   process.emit("SIGINT");
  //       // });
  //     }.bind(this));
  //   }.bind(this));
  // } catch (err) {
  //   console.log('Grove Motor Shield Failed: ' + err);
  // }

  // // END GROVE Motor Controller Test

  // try {

  //   // AdaFruit Motor Controller Test
  //   var configs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2;
  //   // floraMicro MUST be added first!!
  //   var pumpFloraMicro = new five.Motor(configs.M1);
  //   var pumpFloraBloom = new five.Motor(configs.M2);
  //   var pumpFloraGrow = new five.Motor(configs.M3);
  //   var pumpCalMag = new five.Motor(configs.M4);
    
  //   // Start the motor at maximum speed
  //   console.log("Nutrient Pumps Starting");
  //   pumpFloraMicro.start(255);
  //   pumpFloraBloom.start(255);
  //   pumpFloraGrow.start(255);
  //   pumpCalMag.start(255);
    
  //   this.wait(3000, function() {
  //     console.log("Nutrient Pumps STOP");
  //     pumpFloraMicro.stop();
  //     pumpFloraBloom.stop();
  //     pumpFloraGrow.stop();
  //     pumpCalMag.stop();
      
  //   }.bind(this));
  // } catch (err) {
  //   console.log('AdaFruit Motor Shield Failed: ' + err);
  // }

  socket.on('RF:WATER_PUMP:OFF', function() {
    sendRcCode(RF.WaterPump.off);
  });
  socket.on('RF:WATER_PUMP:ON', function() {
    sendRcCode(RF.WaterPump.on);
  });
  socket.on('RF:WATER_HEATER:OFF', function() {
    sendRcCode(RF.WaterHeater.off);
  });
  socket.on('RF:WATER_HEATER:ON', function() {
    sendRcCode(RF.WaterHeater.on);
  });
  socket.on('RF:AIR_PUMP:OFF', function() {
    sendRcCode(RF.AirPump.off);
  });
  socket.on('RF:AIR_PUMP:ON', function() {
    sendRcCode(RF.AirPump.on);
  });
  socket.on('RF:DEHUMIDIFIER:OFF', function() {
    sendRcCode(RF.Dehumidifier.off);
  });
  socket.on('RF:DEHUMIDIFIER:ON', function() {
    sendRcCode(RF.Dehumidifier.on);
  });
  socket.on('RF:HUMIDIFIER:LOW', function() {
    sendRcCode(RF.Humidifier.low);
    setTimeout(function(){
      sendRcCode(RF.Humidifier.off_high);
    },500);
  });

  socket.on('RF:HUMIDIFIER:HIGH', function() {
    sendRcCode(RF.Humidifier.high);
    setTimeout(function(){
       sendRcCode(RF.Humidifier.low);
    },500);
  });
  socket.on('RF:HUMIDIFIER:OFF', function() {
    sendRcCode(RF.Humidifier.off_low);
    setTimeout(function(){
      sendRcCode(RF.Humidifier.off_high);
    },500);
  });
  socket.on('RF:HEATER:OFF', function() {
    sendRcCode(RF.Heater.off);
  });
  socket.on('RF:HEATER:ON', function() {
    sendRcCode(RF.Heater.on);
  });
  socket.on('RF:AIR_EXTRACT_FAN:OFF', function() {
    sendRcCode(RF.AirExtractFan.off);
  });
  socket.on('RF:AIR_EXTRACT_FAN:ON', function() {
    sendRcCode(RF.AirExtractFan.on);
  });
  socket.on('RF:AIR_INTAKE_FAN:OFF', function() {
    sendRcCode(RF.AirIntakeFan.off);
  });
  socket.on('RF:AIR_INTAKE_FAN:LOW', function() {
    sendRcCode(RF.AirIntakeFan.low);
  });
  socket.on('RF:AIR_INTAKE_FAN:HIGH', function() {
    sendRcCode(RF.AirIntakeFan.high);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_SMALL:OFF', function() {
    sendRcCode(RF.AirMovementFanSmall.off);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_SMALL:ON', function() {
    sendRcCode(RF.AirMovementFanSmall.on);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_LARGE:OFF', function() {
    sendRcCode(RF.AirMovementFanLarge.off);
  });
  socket.on('RF:AIR_MOVEMENT_FAN_LARGE:ON', function() {
    sendRcCode(RF.AirMovementFanLarge.on);
  });
  socket.on('RF:LIGHT:OFF', function() {
    sendRcCode(RF.Light.off);
  });
  socket.on('RF:LIGHT:ON', function() {
    sendRcCode(RF.Light.on);
  });
  socket.on('RF:DRAIN_RES:ON', function() {
    console.log("RF:DRAIN_RES");
    sendRcCode(RF.DrainRes.on);
  });
  socket.on('RF:DRAIN_RES:OFF', function() {
    console.log("Close RF:DRAIN_RES");
    sendRcCode(RF.DrainRes.off);
  });
  socket.on('RF:DRAIN_POTS:ON', function() {
    console.log("RF:DRAIN_POTS");
    sendRcCode(RF.DrainPots.on);
  });
  socket.on('RF:DRAIN_POTS:OFF', function() {
    console.log("Close RF:DRAIN_POTS");
    sendRcCode(RF.DrainPots.off);
  });
  socket.on('RF:EXTENTION:ON', function(){
    sendRcCode(RF.Extention.on);
  });
  socket.on('RF:EXTENTION:OFF', function(){
    sendRcCode(RF.Extention.off);
  });
  socket.on('HW:LED:ON', function(){
    led.on();
  });
  socket.on('HW:LED:OFF', function(){
    led.off();
  });
  socket.on('RF:ALL:ON', function() {
    sendRcCode(RF.Humidifier.low);
    setTimeout(function(){
      sendRcCode(RF.Humidifier.high);
    },1000);
  });  
});


// rework of https://github.com/git-developer/RCSwitchFirmata
sendSerialCommand = function(command, pin, val) {
  var data = [];
  data.push(SYSEX_START);
  data.push(RCOUTPUT_DATA);
  data.push(command);
  data.push(pin);
  if (val) {
    if (Array.isArray(val)) {
      for (var i = 0; i < val.length ; i++) {
        data.push(val[i]);   
      }        
    } else {
      data.push(val & 0x7F);
      val = val >> 7 ;
      data.push(val & 0x7F);        
      val = val >> 7 ;
      data.push(val & 0x7F);
    }
  }
  data.push(SYSEX_END);    
  serial.write(data);
};

sendRcCode = function(code) {
  console.log("Sending :: " + code);
  sendSerialCommand(RCOUTPUT_DETACH, RC_OUT_PIN);   
  sendSerialCommand(RCOUTPUT_ATTACH, RC_OUT_PIN);
  if (RC_PULSE_LENGTH) {
      sendSerialCommand(RCOUTPUT_PULSE_LENGTH, RC_OUT_PIN, RC_PULSE_LENGTH);
  }

  let bytes = Encoder7Bit.to7BitArray([0x18, 0x00].concat(longToByteArray(code)));
  sendSerialCommand(RCOUTPUT_CODE_LONG, RC_OUT_PIN,  bytes);
};

// https://stackoverflow.com/questions/8482309/converting-javascript-integer-to-byte-array-and-back
longToByteArray = function(long) {
  var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
  for ( var index = 0; index < byteArray.length; index ++ ) {
      var byte = long & 0xff;
      byteArray [ index ] = byte;
      long = (long - byte) / 256 ;
  }
  return byteArray;
};

byteArrayToLong = function(byteArray) {
  var value = 0;
  for ( var i = byteArray.length - 1; i >= 0; i--) {
      value = (value * 256) + byteArray[i];
  }
  return value;
};