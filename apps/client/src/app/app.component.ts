import { Component, OnInit } from "@angular/core";
import { AuthService } from "@student-mgmt-client/auth";

@Component({
	selector: "student-mgmt-client-root",
	templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
	constructor(private auth: AuthService) {}

	ngOnInit(): void {
		this.auth.login();
	}
}
