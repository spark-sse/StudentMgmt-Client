import { Component, ViewChild, Output, EventEmitter, OnInit } from "@angular/core";
import { AuthService } from "../auth/services/auth.service";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { map, shareReplay, withLatestFrom, filter, tap } from "rxjs/operators";
import { Router, NavigationEnd } from "@angular/router";
import { MatSidenav } from "@angular/material/sidenav";
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { LoginDialog } from "../auth/dialogs/login/login.dialog";
import { AuthenticationInfoDto } from "../../../api_auth";
import { CourseMembershipsFacade } from "../course/services/course-memberships.facade";
import { CourseDto } from "../../../api";
import { SnackbarService } from "../shared/services/snackbar.service";
import { ThemeService } from "../shared/services/theme.service";
import { OverlayContainer } from "@angular/cdk/overlay";

@Component({
	selector: "app-navigation",
	templateUrl: "./navigation.component.html",
	styleUrls: ["./navigation.component.scss"]
})
export class NavigationComponent implements OnInit {

	@Output() onLanguageChange = new EventEmitter<string>();

	@ViewChild("drawer") drawer: MatSidenav;
	isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Handset])
		.pipe(
			map(result => result.matches),
			shareReplay()
		);
	
	constructor(private breakpointObserver: BreakpointObserver,
				private router: Router,
				private authService: AuthService,
				public courseMemberships: CourseMembershipsFacade,
				public theme: ThemeService,
				private overlayContainer: OverlayContainer,
				private dialog: MatDialog,
				public snackbar: SnackbarService) {

		router.events.pipe(
			withLatestFrom(this.isHandset$),
			filter(([a, b]) => b && a instanceof NavigationEnd)
		).subscribe(x => this.drawer.close());
	}

	ngOnInit(): void {
		this.theme.theme$.subscribe(
			theme => this.onThemeChange(theme)
		);
	}

	onThemeChange(theme: string): void {
		const overlayContainerClasses = this.overlayContainer.getContainerElement().classList;
		const themeClassesToRemove = Array.from(overlayContainerClasses).filter((item: string) => item.includes("-theme"));
		if (themeClassesToRemove.length) {
			overlayContainerClasses.remove(...themeClassesToRemove);
		}
		overlayContainerClasses.add(theme);
	}

	setLanguage(lang: string): void {
		this.onLanguageChange.emit(lang);
	}

	getUserId(): string {
		return this.authService.getAuthToken()?.userId ?? "";
	}

	getUsername(): string {
		return this.authService.getAuthToken()?.username;
	}

	isLoggedIn(): boolean {
		return this.authService.isLoggedIn();
	}

	openLoginDialog(): void {
		this.dialog.open<LoginDialog, undefined, AuthenticationInfoDto>(LoginDialog).afterClosed().subscribe(
			async result => {
				// If login to auth system was successful
				if (result) {
					await this.authService.loginWithToken(result); // Attempt to authenticate user in StudentMgtm-Backend
				}
			}
		);
	}

	logout(): void {
		return this.authService.logout();
	}

	async copyJwtToClipboard(): Promise<void> {
		await navigator.clipboard.writeText(this.authService.getAuthToken().accessToken);
		this.snackbar.openSuccessMessage("Copied!");
	}

	// TODO: Function is used to allow reloading the course component, if params change -> Search for better solution
	navigateToCourse(course: CourseDto): void {
		this.router.navigateByUrl("/").then(x => this.router.navigateByUrl(`/courses/${course.id}`));
	}

}
