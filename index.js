const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

app.use(cors());

const PORT = process.env.PORT || 5000;

let users = [];

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	users.push({ id: socket.id });
	io.emit("updateUserList", users);

	socket.on("disconnect", () => {
		users = users.filter(user => user.id !== socket.id);
		io.emit("updateUserList", users);
		socket.broadcast.emit("callEnded");
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal);
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
