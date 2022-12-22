import { LayoutModule } from "@angular/cdk/layout";
import { registerLocaleData } from "@angular/common";
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import localeDeExtra from "@angular/common/locales/extra/de";
import { LOCALE_ID, NgModule } from "@angular/core";
import { MatNativeDateModule } from "@angular/material/core";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { AuthModule } from "@student-mgmt-client/auth";
import { StateModule } from "@student-mgmt-client/state";
import { ApiModule, Configuration } from "@student-mgmt/api-client";
import { AuthInterceptor, AuthModule as OAuthModule, LogLevel } from "angular-auth-oidc-client";
import { ToastrModule } from "ngx-toastr";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HomeComponentModule } from "./home/home.component";
import { NavigationComponentModule } from "./navigation/navigation.component";

registerLocaleData(localeDe, "de", localeDeExtra);

export function createTranslateLoader(http: HttpClient): TranslateLoader {
	return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		HttpClientModule,
		LayoutModule,
		BrowserAnimationsModule,
		MatNativeDateModule,
		AppRoutingModule,
		StateModule,
		AuthModule,
		NavigationComponentModule,
		HomeComponentModule,
		OAuthModule.forRoot({
			config: {
				authority: window["__env"]["AUTH_ISSUER_URL"],
				clientId: window["__env"]["AUTH_CLIENT_ID"],
				secureRoutes: [window["__env"]["API_BASE_PATH"]],
				redirectUrl: window.location.origin,
				postLogoutRedirectUri: window.location.origin,
				scope: "openid profile email offline_access",
				responseType: "code",
				silentRenew: true,
				useRefreshToken: true,
				ignoreNonceAfterRefresh: true,
				logLevel: LogLevel.Debug
				// Only necessary, if identity provider requires audience parameter
				// customParamsAuthRequest: {
				// 	audience: "Student-Mgmt-API"
				// },
				// customParamsRefreshTokenRequest: {
				// 	audience: "Student-Mgmt-API"
				// },
				// customParamsCodeRequest: {
				// 	audience: "Student-Mgmt-API"
				// }
			}
		}),
		ApiModule.forRoot(
			() =>
				new Configuration({
					basePath: window["__env"]["API_BASE_PATH"]
				})
		),
		TranslateModule.forRoot({
			defaultLanguage: localStorage.getItem("language") ?? "de",
			loader: {
				provide: TranslateLoader,
				useFactory: createTranslateLoader,
				deps: [HttpClient]
			}
		}),
		MatSnackBarModule,
		ToastrModule.forRoot({
			positionClass: "toast-bottom-right",
			progressBar: true
		})
	],
	providers: [
		{ provide: LOCALE_ID, useValue: "de" },
		{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: "fill" } },
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
