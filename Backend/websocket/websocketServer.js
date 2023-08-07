const { Server } = require("socket.io");
const websocketChannels = require("./websocketChannels");

module.exports = class {
	userSocketList = [];
	io = null;

	initialiseWebsocketServer(httpServer) {
		// Opening Websocket Server
		console.log("Starting websocket Server");
		this.io = new Server(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] } });

		this.io.on("connection", (socket) => {
			console.log("Incoming websocket connection");
			socket.on(websocketChannels.LOGIN, (arg) => this.handleLoginTopic(socket, arg));
			socket.on(websocketChannels.SEND_MESSAGE, async (arg) => await this.handleSendMessageTopic(socket, arg));
			socket.on(websocketChannels.LOGOUT, async (arg) => await this.handleLogout(socket, arg));

			// Removing the disconnected socket from our list
			socket.conn.on("close", () => this.handleDisconnect(socket));
		});
	}

	handleLoginTopic(socket, arg) {
		const username = arg.trim();
		console.log("Login by user: " + arg.trim());
		if (username) {
			new Promise((resolve, reject) => {
				try {
					this.getUIDByUsername(username).then((uid) => {
						if (uid) {
							resolve(uid);
						} else {
							db("users")
								.insert({ username })
								.then((uid) => {
									resolve(uid[0]);
								});
						}
					});
				} catch (error) {
					reject(`Could not initialise user! Username: ${username}`);
				}
			})
				.then((uid) => {
					// Add the user to our list
					this.userSocketList.push({ uid, username, socket });

					// Send the updated userlist for every user
					this.sendTheUserListForAllSocket();

					// Send all the corresponding messages to the user
					try {
						db("view_messages_with_username")
							.whereNull("recipent")
							.orWhere({ recipent: uid })
							.orWhere({ sender: uid })
							.then((records) => {
								socket.emit(websocketChannels.MESSAGES, JSON.stringify(records));
							});
					} catch (error) {
						console.error("Could not deliver the messages to the user. Error" + error);
					}
				})
				.catch((reason) => console.error(reason));
		}
	}

	async handleSendMessageTopic(socket, arg) {
		const param = JSON.parse(arg);
		const senderUID = await this.getUIDByUsername(param.sender);
		const recipentUID = !!param.recipent ? await this.getUIDByUsername(param.recipent) : null;

		if (senderUID) {
			// Save the message to the database
			try {
				db("messages")
					.insert({
						sender: senderUID,
						recipent: recipentUID,
						message: param.message,
					})
					.then();
			} catch (error) {
				console.error("Error durring adding the message to the datbase. Error: " + error);
			}

			const preparedMessage = {
				sender: senderUID,
				recipent: recipentUID,
				message: param.message,
				senderUsername: param.sender,
				recipentUsername: param.recipent,
			};

			// Decide where to send the message
			if (!!param.recipent) {
				// Send the message to the user
				this.userSocketList
					.filter((uItem) => uItem.uid == recipentUID)
					.forEach((uItem) => {
						try {
							uItem.socket.emit(websocketChannels.MESSAGES, JSON.stringify([preparedMessage]));
						} catch (error) {
							console.error("Failed to deliver message to a socket. Error: " + error);
						}
					});
				try {
					socket.emit(websocketChannels.MESSAGES, JSON.stringify([preparedMessage]));
				} catch (error) {
					console.error("Failed to deliver the message to the sender's socket. Error: " + error);
				}
			} else {
				// Send the message to everyone
				this.userSocketList.forEach((uItem) => {
					try {
						uItem.socket.emit(websocketChannels.MESSAGES, JSON.stringify([preparedMessage]));
					} catch (error) {
						console.error("Failed to deliver message to a socket. Error: " + error);
					}
				});
			}
		}
	}

	async handleLogout(socket, arg) {
		const uID = this.getUIDBySocket(socket);
		if (uID) {
			// I don't know if we also want to delete the user's messages
			// But it would be strange if the messages would disapear from the general topic
			// So I will not delete them...
			try {
				await db("users")
					.where({
						uid: uID,
					})
					.delete();
			} catch (error) {
				console.error("Could not delete the user from the database. Error:" + error);
			}

			const socketIndex = this.userSocketList.findIndex((uSocket) => uSocket.socket == socket);
			if (socketIndex >= 0) {
				this.userSocketList.splice(socketIndex, 1);
			}

			// send the updated user list for all the users
			this.sendTheUserListForAllSocket();
		}
	}

	handleDisconnect(socket) {
		const socketIndex = this.userSocketList.findIndex((uSocket) => uSocket.socket == socket);
		if (socketIndex >= 0) {
			this.userSocketList.splice(socketIndex, 1);
		}
	}

	async getUIDByUsername(username) {
		try {
			const user = await db("users").whereRaw("upper(username)=upper(?)", username);
			if (user && user.length > 0) {
				return user[0].uid;
			} else {
				return null;
			}
		} catch (error) {
			console.error("Error durring looking for user by username: " + error);
			return null;
		}
	}

	getUIDBySocket(socket) {
		return this.userSocketList
			.filter((userSocket) => userSocket.socket == socket)
			.map((userSocket) => userSocket.uid)
			.shift();
	}

	sendTheUserListForAllSocket() {
		// Send the updated userlist
		try {
			db("users").then((records) => {
				const users = records.map((rec) => rec.username);

				// Send The new userlist for every user
				this.userSocketList.forEach((uSocket) => {
					try {
						uSocket.socket.emit(websocketChannels.USERS, JSON.stringify(users));
					} catch (error) {
						console.error("Failed to deliver the message to the sender's socket. Error: " + error);
					}
				});
			});
		} catch (error) {
			console.error("Could not load the users from the database. Error: " + error);
		}
	}
};
