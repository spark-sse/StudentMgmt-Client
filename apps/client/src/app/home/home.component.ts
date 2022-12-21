import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, NgModule, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { RouterModule } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { AuthService } from "@student-mgmt-client/auth";
import { UnsubscribeOnDestroy } from "@student-mgmt-client/util-helper";

@Component({
	selector: "student-mgmt-home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends UnsubscribeOnDestroy implements OnInit {
	currentLanguage: string;

	constructor(
		readonly dialog: MatDialog,
		readonly translate: TranslateService,
		readonly auth: AuthService
	) {
		super();
	}

	ngOnInit(): void {
		this.currentLanguage = localStorage.getItem("language") ?? "de";
		this.subs.sink = this.translate.onLangChange.subscribe(({ lang }) => {
			this.currentLanguage = lang;
		});
	}

	setLanguage(lang: string): void {
		this.translate.use(lang);
		localStorage.setItem("language", lang);
	}
}

@NgModule({
	declarations: [HomeComponent],
	exports: [HomeComponent],
	imports: [CommonModule, RouterModule, TranslateModule, MatButtonModule, MatDialogModule]
})
export class HomeComponentModule {}
