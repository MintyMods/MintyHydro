import '../style/style.css';
import io from 'socket.io-client';
import { url } from '../mintyConfig';

(function() {
    // Connect to the socket server
    const socket = io.connect(url);
});
