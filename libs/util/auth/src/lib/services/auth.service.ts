import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { AuthActions, AuthSelectors } from "@student-mgmt-client/state";
import { AuthenticationApi, UserDto } from "@student-mgmt/api-client";
import { OAuthService } from "angular-oauth2-oidc";

@Injectable({ providedIn: "root" })
export class AuthService {
	static readonly authKey = "whoAmI";

	user$ = this.store.select(AuthSelectors.selectUser);

	constructor(
		private oauth: OAuthService,
		private authApi: AuthenticationApi,
		private store: Store
	) {
		oauth.configure({
			issuer: window["__env"]["AUTH_ISSUER_URL"],
			clientId: window["__env"]["AUTH_CLIENT_ID"],
			scope: "openid profile email offline_access",
			redirectUri: window.location.origin,
			responseType: "code", // Code Flow
			showDebugInformation: false,
			useSilentRefresh: true,
			// silentRefreshRedirectUri: window.location.origin + "/silent-refresh.html",
			useIdTokenHintForSilentRefresh: true,
			timeoutFactor: 0.1,
			// Only necessary, if provider requires specified audience
			customQueryParams: {
				audience: "Student-Mgmt-API"
			}
		});

		this.oauth.setupAutomaticSilentRefresh({}, "access_token");

		this.oauth.events.subscribe(e => {
			console.log(e);

			if (e.type === "token_received") {
				this.authApi.whoAmI().subscribe({
					next: user => {
						// console.log({ user });
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

	/**
	 * Returns the stored AccessToken (JWT), which can be assigned to the Authorization-header
	 * to authenticate the user for requests to the server.
	 */
	static getAccessToken(): string {
		// const authState = JSON.parse(localStorage.getItem(AuthService.authKey)) as AuthResultDto;
		return sessionStorage.getItem("access_token");
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
		this.oauth.loadDiscoveryDocument().then(() => {
			this.oauth.tryLoginCodeFlow().then(() => {
				if (this.oauth.hasValidAccessToken()) {
					this.authApi.whoAmI().subscribe({
						next: user => {
							// console.log({ user });
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
				} else {
					console.log("No valid access token found, initCodeFlow...");

					this.oauth.initCodeFlow();
				}
			});
		});
	}

	// tryResumeSession(): void {
	// 	this.oauth.loadDiscoveryDocument().then(() => {
	// 		if (this.oauth.hasValidAccessToken()) {
	// 			this.authApi.whoAmI().subscribe({
	// 				next: user => {
	// 					// console.log({ user });
	// 					AuthService.setAuthState(user);
	// 					this.store.dispatch(
	// 						AuthActions.login({
	// 							user
	// 						})
	// 					);
	// 				},
	// 				error: err => {
	// 					console.error(
	// 						"User has an access token, but Student-Mgmt-API failed to authenticate this user."
	// 					);
	// 					console.error(err);
	// 				}
	// 			});
	// 		} else {
	// 			console.log("No valid access token found.");
	// 			//
	// 		}
	// 	});
	// }

	logout(): void {
		this.oauth.revokeTokenAndLogout(true).then(() => {
			this.store.dispatch(AuthActions.logout());
		});
	}
}
