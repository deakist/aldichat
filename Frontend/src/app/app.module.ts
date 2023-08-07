import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";
import { LoginFormComponent } from "./login-form/login-form.component";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { ChatPageComponent } from "./chat-page/chat-page.component";
import { ReactiveFormsModule } from "@angular/forms";

const config: SocketIoConfig = { url: "http://localhost:8080", options: {} };

@NgModule({
	declarations: [AppComponent, LoginFormComponent, ChatPageComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		ReactiveFormsModule,
		SocketIoModule.forRoot(config),
		MatCardModule,
		MatFormFieldModule,
		MatButtonModule,
		MatInputModule,
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
