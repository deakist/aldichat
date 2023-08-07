import { Component, ElementRef, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ChatService } from "src/services/chat.service";
import { LocalService } from "src/services/local.service";

@Component({
	selector: "app-chat-page",
	templateUrl: "./chat-page.component.html",
	styleUrls: ["./chat-page.component.css"],
})
export class ChatPageComponent {
	@ViewChild("chatContainer") private chatContainer: ElementRef | undefined;
	private subscriptions: Subscription[] = [];
	private beepAudio: HTMLAudioElement = new Audio("/assets/beep.ogg");
	private firstMessagesRecived = false;

	public form: FormGroup = new FormGroup({
		message: new FormControl(""),
	});
	public username: string = "";
	public userList: any[] = [];
	public messageList: any[] = [];
	public activeChannel: string = "";

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private localStorage: LocalService,
		private chat: ChatService
	) {
		// Check if the user already "Authenticated", If not push him back to login
		const username = this.localStorage.getData("USERNAME");
		if (!username) {
			this.router.navigate(["/"]);
			return;
		}

		this.username = username!;
		this.subscribeTopics();
		this.chat.sendLogin(this.username);
	}

	private subscribeTopics() {
		// User List Topic
		this.subscriptions.push(
			this.chat.getUsers().subscribe((value) => {
				const tempList: any[] = JSON.parse(value as string);
				this.userList = tempList.filter(
					(user) => user.trim().toLocaleUpperCase() != this.username.trim().toLocaleUpperCase()
				);
			})
		);
		// Messages Topic
		this.subscriptions.push(
			this.chat.getMessages().subscribe((value) => {
				this.messageList.push(...JSON.parse(value as string));

				if (!this.firstMessagesRecived) {
					// Workaround to produce an oversimplified version of seen/unseen messages
					this.messageList.forEach((msg) => (msg.seen = true));
				} else {
					// Play a beep sound on every message
					this.beepAudio?.play();
				}
				this.firstMessagesRecived = true;

				// Scroll the chat panel to bottom
				// Ideally we should check if the currently opened channel recived a message
				this.scrollToBottom();
			})
		);
	}

	private scrollToBottom() {
		// Workaround, because we could only update after angular has updated the component
		setTimeout(() => {
			if (this.chatContainer) {
				this.chatContainer.nativeElement.scroll({
					top: this.chatContainer.nativeElement.scrollHeight,
					left: 0,
					behavior: "smooth",
				});
			}
		}, 200);
	}

	public ngOnDestroy() {
		// Clean up the subscriptions
		this.subscriptions.forEach((sub) => sub.unsubscribe());
		this.subscriptions.splice(0, this.subscriptions.length);
	}

	/**
	 * Send logout command for backend
	 * Clear local storage
	 * Push it back to login
	 */
	public handleOnLogout() {
		this.chat.sendLogout();
		this.localStorage.clearData();
		this.router.navigate(["/"]);
	}

	/**
	 * Send the message to the backend
	 * Clean out the input field
	 */
	public handleOnSubmit() {
		const message = this.form.controls["message"].value;
		if (!!message.trim()) {
			this.chat.sendMessage(this.username, this.activeChannel, message);
			this.form.setValue({ message: "" });
		}
	}

	/**
	 * Get the messages of the active channel
	 * Set all of them to seen
	 * @returns list of messages
	 */
	public getMessagesOfActiveChannel() {
		const result = this.getMessageListOfChannel(this.activeChannel);
		result.forEach((msg) => (msg.seen = true));
		return result;
	}

	/**
	 * Get the messages of the active channel
	 * @param channel
	 * @returns list of messages
	 */
	private getMessageListOfChannel(channel: string) {
		return channel == ""
			? this.messageList.filter((msg) => !msg.recipentUsername)
			: this.messageList.filter(
					(msg) =>
						!!msg.senderUsername &&
						!!msg.recipentUsername &&
						((msg.senderUsername.trim().toLocaleUpperCase() == channel.trim().toLocaleUpperCase() &&
							msg.recipentUsername.trim().toLocaleUpperCase() == this.username.trim().toLocaleUpperCase()) ||
							(msg.senderUsername.trim().toLocaleUpperCase() == this.username.trim().toLocaleUpperCase() &&
								msg.recipentUsername.trim().toLocaleUpperCase() == channel.trim().toLocaleUpperCase()))
			  );
	}

	/**
	 * Change the active channel
	 * @param newChannel
	 */
	public changeChannel(newChannel: string) {
		this.activeChannel = newChannel;
		this.scrollToBottom();
	}

	/**
	 * Get a classname list for the given channel
	 * @param channel
	 * @returns
	 */
	public getClassnamesOfChannel(channel: string) {
		const result: string[] = [];
		this.activeChannel == channel ? result.push("SelectedChannel") : result.push("Channel");
		if (this.getMessageListOfChannel(channel).find((msg) => !msg.seen)) {
			result.push("BoldChannelName");
		}
		return result;
	}
}
