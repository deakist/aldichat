import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { map } from "rxjs/operators";

import { WebsocketChannels } from "./websocketChannels";

@Injectable({
	providedIn: "root",
})
export class ChatService {
	constructor(private socket: Socket) {
		socket.connect();
	}

	sendLogin(username: string) {
		this.socket.emit(WebsocketChannels.LOGIN, username);
	}

	sendMessage(senderUsername: string, recipent: string, msg: string) {
		this.socket.emit(
			WebsocketChannels.SEND_MESSAGE,
			JSON.stringify({
				sender: senderUsername,
				recipent: recipent == "" ? null : recipent,
				message: msg,
			})
		);
	}

	sendLogout() {
		this.socket.emit(WebsocketChannels.LOGOUT);
	}

	getUsers() {
		return this.socket.fromEvent(WebsocketChannels.USERS).pipe();
	}

	getMessages() {
		return this.socket.fromEvent(WebsocketChannels.MESSAGES).pipe();
	}
}
