const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');

const io = require('socket.io')(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});

app.use(cors());

const users = {};

io.on('connection', (socket) => {
	socket.emit('me', socket.id);

	socket.on('join', ({ name }) => {
		users[socket.id] = { id: socket.id, name };

		io.emit('updateUserList', Object.values(users));
	});

	socket.on('callUser', ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit('callUser', { signal: signalData, from, name });
	});

	socket.on('answerCall', (data) => {
		io.to(data.to).emit('callAccepted', data.signal);
	});

	socket.on('callEnded', () => {
		delete users[socket.id];
		io.emit('updateUserList', Object.values(users));
	});

	socket.on('disconnect', () => {
		delete users[socket.id];
		io.emit('updateUserList', Object.values(users));
	});

	socket.on('sendMessage', ({ to, message, from }) => {
		io.to(to).emit('receiveMessage', { message, from });
	});
});

server.listen(5000, () => console.log('Server is running on port 5000'));
