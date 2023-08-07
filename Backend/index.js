const express = require("express");
const http = require("http");
const WebsocketServer = require("./websocket/websocketServer");

require("dotenv").config();
global.db = require("./utils/knex");

// Creating HTTP Server
console.log("Creating Express Server");
const app = express();
const server = http.createServer(app);
const wsServer = new WebsocketServer().initialiseWebsocketServer(server);

server.listen(process.env.WS_PORT, () => {
	console.log(`Listening on: ${process.env.WS_PORT}`);
});
