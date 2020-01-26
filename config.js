const SERIAL_PORT = "COM7";
const SOCKET_IO_NAMESPACE = 'arduino';
const LED_PIN = 13;
const IP_ADDRESS = '192.168.0.12';

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
config.ledPin = LED_PIN;

module.exports = config;
