import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, NgModule, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { RouterModule } from "@angular/router";
import { Store } from "@ngrx/store";
import { TranslateModule } from "@ngx-translate/core";
import { AuthService } from "@student-mgmt-client/auth";
import { ToastService } from "@student-mgmt-client/services";
import { AuthActions, AuthSelectors } from "@student-mgmt-client/state";
import { UserApi, UserDto } from "@student-mgmt/api-client";
import { firstValueFrom } from "rxjs";

@Component({
	selector: "student-mgmt-matr-nr",
	templateUrl: "./matr-nr.dialog.html",
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatrNrDialog implements OnInit {
	private storageKey = "ignoreMatrNrDialog";
	showDialogIgnoreOption = localStorage.getItem(this.storageKey) === "true";
	displayNoMatrNrMessage = true;
	matrNr: number | undefined | null;
	user: UserDto;

	constructor(
		private store: Store,
		private dialogRef: MatDialogRef<MatrNrDialog>,
		private toast: ToastService,
		private userApi: UserApi
	) {}

	async ngOnInit(): Promise<void> {
		const user = await firstValueFrom(this.store.select(AuthSelectors.selectUser));

		this.user = user;

		if (user.matrNr) {
			this.matrNr = user.matrNr;
			this.displayNoMatrNrMessage = false;
		}
	}

	setDialogIgnoreOptionVisibility(visible: boolean): void {
		this.showDialogIgnoreOption = visible;
	}

	setDoNotShowDialogAgain(event: MatCheckboxChange): void {
		if (event.checked) {
			localStorage.setItem(this.storageKey, "true");
		} else {
			localStorage.removeItem(this.storageKey);
		}
	}

	async onConfirm(): Promise<void> {
		const matrNr = this.matrNr ?? null;

		try {
			const updatedUser = await firstValueFrom(
				this.userApi.setMatrNr({ matrNr }, this.user.id)
			);

			this.store.dispatch(
				AuthActions.login({
					user: updatedUser
				})
			);

			AuthService.setAuthState(updatedUser);

			this.toast.success();
			this.dialogRef.close(true);
		} catch (error) {
			this.toast.apiError(error);
		}
	}
}

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatCheckboxModule,
		MatButtonModule,
		TranslateModule
	],
	declarations: [MatrNrDialog],
	exports: [MatrNrDialog]
})
export class MatrNrDialogModule {}
