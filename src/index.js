import '../style/style.css';
import io from 'socket.io-client';
import { url } from '../MintyConfig';

(function () {
    const socket = io.connect(url);
});
