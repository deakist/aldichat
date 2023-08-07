import { Input, Component, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalService } from "src/services/local.service";

@Component({
	selector: "app-login-form",
	templateUrl: "./login-form.component.html",
	styleUrls: ["./login-form.component.css"],
})
export class LoginFormComponent {
	@Input() error: string | null = null;
	@Output() submitEM = new EventEmitter();

	constructor(private router: Router, private localStorage: LocalService) {
		// Check if the user already "Authenticated", push him to the chat page if he is
		const username = this.localStorage.getData("USERNAME");
		if (!!username) {
			this.router.navigate(["/chat"]);
		}
	}

	form: FormGroup = new FormGroup({
		username: new FormControl(""),
	});

	public onSubmit() {
		if (this.form.valid) {
			let username = this.form.controls["username"].value;
			if (!!username) {
				username = (username as string).trim();
				this.localStorage.saveData("USERNAME", username);
				this.router.navigate(["/chat"]);
			}
		}
	}
}
