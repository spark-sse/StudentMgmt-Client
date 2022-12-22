import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastService } from "./toast.service";

@Injectable({ providedIn: "root" })
export class DownloadService {
	private basePath = window["__env"]["API_BASE_PATH"];

	constructor(private http: HttpClient, private toast: ToastService) {}

	/**
	 * Downloads a file from the API and opens a SaveFile-Dialog.
	 * Will try use the current access token for authentication.
	 * @param endpoint Route to the file, i.e. 'csv/courses/java-wise1920/users'.
	 * @param filename Suggested filename when user open SaveFile-Dialog.
	 */
	downloadFromApi(endpoint: string, filename: string): void {
		this.http
			.get(`${this.basePath}/${endpoint}`, {
				responseType: "blob"
			})
			.subscribe({
				next: blob => {
					const a = document.createElement("a");
					const objectUrl = URL.createObjectURL(blob);
					a.href = objectUrl;
					a.download = filename;
					a.click();
					URL.revokeObjectURL(objectUrl);
				},
				error: error => {
					this.toast.apiError(error);
				}
			});
	}
}
