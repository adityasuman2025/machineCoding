const { Server } = require('socket.io');

const io = new Server(3001, {
    cors: {
        origin: '*' // Allow all origins for testing
    }
});

io.on('connection', (socket) => {
    console.log(`New User connected: ${socket.id}`);

    // Handle incoming messages
    socket.on('msg', (data) => {
        // Expected data: { room: 'roomName', text: 'message text', sender: 'username' }
        console.log(`New Message received:`, data);

        io.emit('msg', data);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

console.log('WebSocket (Socket.io) server running on port 3001');
