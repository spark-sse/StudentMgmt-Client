import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AuthRoutingModule } from "./auth-routing.module";
import { ErrorInterceptorService } from "./services/error-interceptor.service";

@NgModule({
	imports: [AuthRoutingModule],
	providers: [{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptorService, multi: true }]
})
export class AuthModule {}
