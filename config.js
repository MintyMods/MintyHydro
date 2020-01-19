const SERIAL_PORT = "COM7";
const LED_PIN = 13;

const development = {
  host: 'http://localhost',
  namespace: 'arduino', // For socket.io
  port: 4000
};

const production = {
  // host: 'https://arduino-sockets.herokuapp.com', // Replace
  // namespace: 'arduino' // For socket.io
  host: 'http://localhost',
  namespace: 'arduino', // For socket.io
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
