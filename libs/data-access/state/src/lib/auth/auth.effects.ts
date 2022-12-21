import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { tap } from "rxjs/operators";
import { AuthService } from "@student-mgmt-client/auth";
import * as AuthActions from "./auth.actions";
import { MatDialog } from "@angular/material/dialog";
import { MatrNrDialog } from "../../../../../../apps/client/src/app/matr-nr/matr-nr.dialog";

@Injectable()
export class AuthEffects {
	login$ = createEffect(
		() =>
			this.actions$.pipe(
				ofType(AuthActions.login),
				tap(({ user }) => {
					if (user.role === "USER" && !Number.isFinite(user.matrNr)) {
						const ignoreMatrNrDialog =
							localStorage.getItem("ignoreMatrNrDialog") === "true";

						if (!ignoreMatrNrDialog) {
							// Request user to enter their matrNr
							this.dialog.open(MatrNrDialog);
						}
					}
				})
			),
		{ dispatch: false }
	);

	logout$ = createEffect(
		() =>
			this.actions$.pipe(
				ofType(AuthActions.logout),
				tap(() => {
					localStorage.removeItem(this.authKey);
					sessionStorage.removeItem(this.authKey);
					this.router.navigateByUrl("courses");
				})
			),
		{ dispatch: false }
	);

	setCourses$ = createEffect(
		() =>
			this.actions$.pipe(
				ofType(AuthActions.setCourses),
				tap(action => {
					const user = AuthService.getUser();
					const accessToken = AuthService.getAccessToken();

					user.courses = action.courses;

					localStorage.setItem(
						this.authKey,
						JSON.stringify({
							user,
							accessToken
						})
					);
				})
			),
		{ dispatch: false }
	);

	private authKey = "auth";

	constructor(private actions$: Actions, private router: Router, private dialog: MatDialog) {}
}
