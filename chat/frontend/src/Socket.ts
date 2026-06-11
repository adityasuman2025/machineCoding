import { io } from 'socket.io-client';

const HOST = "http://localhost:3001";
const socket = io(HOST);

export default socket;