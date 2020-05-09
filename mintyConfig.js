const SERIAL_PORT = "COM15";
const SOCKET_IO_NAMESPACE = 'arduino';
const IP_ADDRESS = '192.168.0.12';
const DEBUGGING = true;

const development = {
  host: 'http://' + IP_ADDRESS,
  namespace: SOCKET_IO_NAMESPACE,
  port: 4000
};

const production = {
  host: 'http://' + IP_ADDRESS,
  namespace: SOCKET_IO_NAMESPACE,
  port: 4000
};

const config = process.env.NODE_ENV === 'development' ? development : production;
const port = config.port ? ':' + config.port : '';
const namespace = config.namespace ? config.namespace : '';
const url = config.host + port + '/' + namespace;

config.url = url;
config.serialPort = SERIAL_PORT;
config.debug = DEBUGGING;

config.tick = {
  bme280: 4000,
  calibrationPolling: 1000,
  mintyhydro: 10000,
}

/* RF433 Transmitter Support */
config.RCT_IN_PIN = 6;
config.RCT_OUT_PIN = 7;
config.RCT_PULSE_LENGTH = 185;
config.RCT_OUTPUT_DATA = (0x5C);
config.RCT_OUTPUT_ATTACH = (0x01);
config.RCT_OUTPUT_DETACH = (0x02);
config.RCT_OUTPUT_PULSE_LENGTH = (0x12);
config.RCT_OUTPUT_CODE_LONG = (0x22);
config.SYSEX_START = (0xF0);
config.SYSEX_END = (0xF7);
config.ATLAS_BYTES_TO_READ = 30;
config.ATLAS_DELAY = 1400;


/* Arduino Digital Pin Assignment */
config.RESERVED_PIN = 2;
config.SPARE_PIN = 3;

/* HWR = Hardware Relays 240v */
config.HWR_RELAY_ONE_PIN = 4;
config.HWR_RELAY_TWO_PIN = 5;

/* WLS = Water Level Switches */
config.WLS_RES_LOW_PIN = 9;
config.WLS_RES_HIGH_PIN = 10;
config.WLS_TANK_LOW_PIN = 11;
config.WLS_TANK_HIGH_PIN = 12;

/* Arduino I2C Address Assignment */
config.I2C_GROVE_TEMP_HUMIDITY_ADDR = (0x40);
config.I2C_ADAFRUIT_MOTORBOARD_TWO_ADDR = (0x60);
config.I2C_ADAFRUIT_MOTORBOARD_ONE_ADDR = (0x61);
config.I2C_ATLAS_PH_SENSOR_ADDR = (0x63);
config.I2C_ATLAS_EC_SENSOR_ADDR = (0x64);
config.I2C_ATLAS_TEMP_SENSOR_ADDR = (0x66);
config.I2C_ADAFRUIT_MOTORBOARD_ALL_CALL_ADDR = (0x70);
config.I2C_BME280_SENSOR_ADDR = (0x76);

config.ATLAS_READ_CHARCODE = ['r'.charCodeAt(0)];

/* Air Intake Fan */
const RF_CODE_INTAKE_LOW = "7446194";
const RF_CODE_INTAKE_HIGH = "7446193";
const RF_CODE_INTAKE_OFF = "7446196";

/* Minty HumiBox - Humidifier */
const RF_CODE_HUMID_LOW = "12562584";
const RF_CODE_HUMID_HIGH = "12562578";
const RF_CODE_HUMID_OFF_LOW = "12562580";
const RF_CODE_HUMID_OFF_HIGH = "12562577";

/**
 * Geekcreit® 12V 4CH Channel 433Mhz 
 * Following RF codes will toggle all relay channels at once
 * e.g. to open Relays 2&4 and close Realys 1&3 we send 2775141
 * RELAY_CHANNEL_1234 Where 0=CLOSED 1=OPEN
 */
const RF_CODE_12V = {
  RF_0000: "2775136",
  RF_0001: "2775137",
  RF_0010: "2775138",
  RF_0011: "2775139",
  RF_0100: "2775140",
  RF_0101: "2775141",
  RF_0110: "2775142",
  RF_0111: "2775143",
  RF_1000: "2775144",
  RF_1001: "2775145",
  RF_1010: "2775146",
  RF_1011: "2775147",
  RF_1100: "2775148",
  RF_1101: "2775149",
  RF_1110: "2775150",
  RF_1111: "2775151",
}

config.MINTY_FDD = {
  DRIP: RF_CODE_12V.RF_1000,
  FILL: RF_CODE_12V.RF_0110,
  DRAIN: RF_CODE_12V.RF_0010,
  MAGMIX: RF_CODE_12V.RF_0001,
  OFF: RF_CODE_12V.RF_0000,
}
// config.MINTY_FDD = {
//   FILL: RF_CODE_12V.RF_1000,
//   DRAIN: RF_CODE_12V.RF_0110,
//   DRIP: RF_CODE_12V.RF_0010,
//   MAGMIX: RF_CODE_12V.RF_0001,
//   OFF: RF_CODE_12V.RF_0000,
// }

/* Etekcity Wireless Remote Control Sockets */
const RF_CODE_S1_ON = "5264691"; // Dehumidifier
const RF_CODE_S1_OFF = "5264700";
const RF_CODE_S2_ON = "5264835"; // Air Heater
const RF_CODE_S2_OFF = "5264844";
const RF_CODE_S3_ON = "5265155"; // Air Fan Large
const RF_CODE_S3_OFF = "5265164";
const RF_CODE_S4_ON = "5266691"; // Air Extract
const RF_CODE_S4_OFF = "5266700";
const RF_CODE_S5_ON = "5272835"; // Light
const RF_CODE_S5_OFF = "5272844";

/* Energenie Trailing Gang with Four Radio Controlled Surge Protected Sockets */
const RF_CODE_Q1_ON = "8950879"; // SPARE
const RF_CODE_Q1_OFF = "8950878";
const RF_CODE_Q2_ON = "8950871"; // SPARE
const RF_CODE_Q2_OFF = "8950870";
const RF_CODE_Q3_ON = "8950875"; // Air Pump
const RF_CODE_Q3_OFF = "8950874";
const RF_CODE_Q4_ON = "8950867"; // Air Fan Small
const RF_CODE_Q4_OFF = "8950866";
const RF_CODE_QALL_ON = "8950877"; // Extention Block Over-ride
const RF_CODE_QALL_OFF = "8950876";


config.RF = {
  Light: {
    on: RF_CODE_S5_ON,
    off: RF_CODE_S5_OFF
  },
  WaterPump: {
    on: RF_CODE_Q1_ON,
    off: RF_CODE_Q1_OFF
  },
  AirPump: {
    on: RF_CODE_Q3_ON,
    off: RF_CODE_Q3_OFF
  },
  WaterHeater: {
    on: RF_CODE_Q2_ON,
    off: RF_CODE_Q2_OFF
  },
  Heater: {
    on: RF_CODE_S2_ON,
    off: RF_CODE_S2_OFF
  },
  AirMovementFan: {
    on: RF_CODE_Q4_ON,
    off: RF_CODE_Q4_OFF
  },
  AirExtractFan: {
    on: RF_CODE_S4_ON,
    off: RF_CODE_S4_OFF
  },
  AirIntakeFan: {
    low: RF_CODE_INTAKE_LOW,
    high: RF_CODE_INTAKE_HIGH,
    off: RF_CODE_INTAKE_OFF
  },
  Dehumidifier: {
    on: RF_CODE_S1_ON,
    off: RF_CODE_S1_OFF
  },
  Humidifier: {
    low: RF_CODE_HUMID_LOW,
    high: RF_CODE_HUMID_HIGH,
    off_low: RF_CODE_HUMID_OFF_LOW,
    off_high: RF_CODE_HUMID_OFF_HIGH
  },
  Extention: {
    on: RF_CODE_QALL_ON,
    off: RF_CODE_QALL_OFF
  }

}

const ADAFRUIT_MOTOR_SHIELD_DRIVER = "PCA9685";
config.ADAFRUIT_MOTOR_SHIELD = {
  M1: { // Pump A : Cal Mag
    pins: {
      pwm: 8,
      dir: 9,
      cdir: 10
    },
    address: config.I2C_ADAFRUIT_MOTORBOARD_ONE_ADDR,
    controller: ADAFRUIT_MOTOR_SHIELD_DRIVER
  },
  M2: { // Pump B : Flora Micro
    pins: {
      pwm: 13,
      dir: 12,
      cdir: 11
    },
    address: config.I2C_ADAFRUIT_MOTORBOARD_ONE_ADDR,
    controller: ADAFRUIT_MOTOR_SHIELD_DRIVER
  },
  M3: { // Pump C : Flora Grow
    pins: {
      pwm: 7,
      dir: 6,
      cdir: 5
    },
    address: config.I2C_ADAFRUIT_MOTORBOARD_ONE_ADDR,
    controller: ADAFRUIT_MOTOR_SHIELD_DRIVER
  },
  M4: { // Pump D : Flora Bloom
    pins: {
      pwm: 2,
      dir: 3,
      cdir: 4
    },
    address: config.I2C_ADAFRUIT_MOTORBOARD_ONE_ADDR,
    controller: ADAFRUIT_MOTOR_SHIELD_DRIVER
  },
  M5: { // Pump E : Hydro Guard
    pins: {
      pwm: 2,
      dir: 3,
      cdir: 4
    },
    address: config.I2C_ADAFRUIT_MOTORBOARD_TWO_ADDR,
    controller: ADAFRUIT_MOTOR_SHIELD_DRIVER
  },
  M6: { // Pump F : Spare
    pins: {
      pwm: 8,
      dir: 9,
      cdir: 10
    },
    address: config.I2C_ADAFRUIT_MOTORBOARD_TWO_ADDR,
    controller: ADAFRUIT_MOTOR_SHIELD_DRIVER
  },
  M7: { // Pump G : PH Up
    pins: {
      pwm: 13,
      dir: 12,
      cdir: 11
    },
    address: config.I2C_ADAFRUIT_MOTORBOARD_TWO_ADDR,
    controller: ADAFRUIT_MOTOR_SHIELD_DRIVER
  },
  M8: { // Pump H : PH Down
    pins: {
      pwm: 7,
      dir: 6,
      cdir: 5
    },
    address: config.I2C_ADAFRUIT_MOTORBOARD_TWO_ADDR,
    controller: ADAFRUIT_MOTOR_SHIELD_DRIVER
  }
};


module.exports = config;
