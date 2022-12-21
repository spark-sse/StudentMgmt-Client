import { CommonModule } from "@angular/common";
import { Component, NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
	selector: "student-mgmt-login",
	templateUrl: "./login.component.html"
})
export class LoginComponent {
	errorMessage: string;

	constructor(private authService: AuthService, private router: Router) {}

	login(username: string): void {
		// this.authService.devLogin(username).subscribe({
		// 	next: user => {
		// 		this.router.navigateByUrl("");
		// 	},
		// 	error: error => {
		// 		console.log(error);
		// 		this.errorMessage = error.error.message;
		// 	}
		// });
	}
}

@NgModule({
	declarations: [LoginComponent],
	exports: [LoginComponent],
	imports: [CommonModule, MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule]
})
export class LoginComponentModule {}
