import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ChatPageComponent } from "./chat-page/chat-page.component";
import { LoginFormComponent } from "./login-form/login-form.component";

const routes: Routes = [
	{
		path: "",
		component: LoginFormComponent,
	},
	{
		path: "chat",
		component: ChatPageComponent,
	},
	{
		path: "**",
		component: LoginFormComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
