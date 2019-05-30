import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Config, URL } from "../config";

@Component({
	selector: "ichen-home",
	template: `
		<ichen-report-download [i18n]="i18n"
			*ngIf="currentUser && controllersList"
			[disabled]="isBusy"
			[currentUser]="currentUser"
			[controllersList]="controllersList"
			[title]="i18n.titleDownload"
			(run)="downloadReport($event)"
		></ichen-report-download>

		<div id="imgLoading" *ngIf="isBusy">
			<img src="/images/loading.gif" />
		</div>
	`
})
export class HomeComponent
{
	public isBusy = false;
	public get currentUser() { return Config.currentUser; }
	public get controllersList() { return Config.controllersList; }

	public get i18n() { return Config.i18n; }

	constructor()
	{
		if (Config.forceLogin) {
			console.log("Not logged in. Redirecting to login page...");
			Config.jumpToPage();
		}
	}

	public downloadReport(parameters: IRunReportParameters)
	{
		let url = URL.dataDownload;
		url = url.replace("{0}", parameters.dataset || "???").replace("{1}", parameters.controllerId.toString());

		url += `?timezone=${Config.timeZone}&from=${parameters.lower}&to=${parameters.upper}&format=${parameters.format}`;

		//this.isBusy = true;

		if (Config.iFrame) {
			Config.iFrame.src = url;
			const msg = this.i18n["textDownloading"];
			setTimeout(() => { alert(msg); }, 0);
		}
	}
}
