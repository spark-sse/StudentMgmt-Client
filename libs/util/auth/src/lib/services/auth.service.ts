import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { AuthActions, AuthSelectors } from "@student-mgmt-client/state";
import { AuthenticationApi, UserDto } from "@student-mgmt/api-client";
import { OidcSecurityService } from "angular-auth-oidc-client";

@Injectable({ providedIn: "root" })
export class AuthService {
	static _accessToken = "";
	static readonly authKey = "whoAmI";

	user$ = this.store.select(AuthSelectors.selectUser);

	constructor(
		// private oauth: OAuthService,
		private oidc: OidcSecurityService,
		private authApi: AuthenticationApi,
		private store: Store
	) {
		this.oidc.isAuthenticated$.subscribe(res => {
			if (res.isAuthenticated) {
				this.oidc.getAccessToken().subscribe(token => {
					AuthService._accessToken = token;
				});
			} else {
				this.store.dispatch(AuthActions.logout());
			}
		});

		this.oidc.checkAuth().subscribe(data => {
			AuthService._accessToken = data.accessToken;

			if (data.isAuthenticated) {
				this.authApi.whoAmI().subscribe({
					next: user => {
						AuthService.setAuthState(user);
						this.store.dispatch(
							AuthActions.login({
								user
							})
						);
					},
					error: err => {
						console.error(
							"User has an access token, but Student-Mgmt-API failed to authenticate this user."
						);
						console.error(err);
					}
				});
			}
		});
	}

	static getUser(): UserDto {
		return JSON.parse(sessionStorage.getItem(AuthService.authKey));
	}

	static setAuthState(user: UserDto): void {
		sessionStorage.setItem(this.authKey, JSON.stringify(user));
	}

	/**
	 * **Only available when API is running in dev environment.**
	 *
	 * Sets the `accessToken` to the given `username` and queries the API to check whether
	 * the given username is a valid test account. If successful, the user is logged in as the
	 * specified user.
	 */
	// devLogin(username: string): Observable<UserDto> {
	// 	AuthService.setAuthState({ accessToken: username, user: null });

	// 	return this.authApi.whoAmI().pipe(
	// 		tap(user => {
	// 			const state = { user, accessToken: username };
	// 			AuthService.setAuthState(state);
	// 			this.store.dispatch(
	// 				AuthActions.login({
	// 					authResult: {
	// 						user: state.user,
	// 						accessToken: state.accessToken
	// 					}
	// 				})
	// 			);
	// 		})
	// 	);
	// }

	login(): void {
		this.oidc.authorize();
	}

	logout(): void {
		// For testing refresh
		// this.oidc.forceRefreshSession().subscribe({
		// 	next: () => {
		// 		console.log("forceRefreshSession success");
		// 	},
		// 	error: err => {
		// 		console.error("forceRefreshSession error", err);
		// 	}
		// });

		this.oidc.logoff().subscribe(() => {
			this.store.dispatch(AuthActions.logout());
		});
	}
}
