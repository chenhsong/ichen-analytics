import { Component } from "@angular/core";
import { Http } from "@angular/http";
import { Config, URL } from "../config";

@Component({
	selector: "ichen-logout",
	template: `
		<button type="button" [disabled]="!currentUser" (click)="doLogout()" class="btn btn-lg btn-danger"><span class="glyphicon glyphicon-log-out"></span>&nbsp;&nbsp;{{i18n.btnLogout}}</button>
	`
})
export class LogoutComponent
{
	public currentUser = Config.currentUser;
	public controllersList: IController[] = [];

	public get i18n() { return Config.i18n; }

	constructor(private http: Http)
	{
		this.doLogout();
	}

	public doLogout()
	{
		Config.currentUser = null;
		Config.forceLogin = true;
		this.http.get(URL.logout).subscribe(() => console.log("Successfully logged out."));
		Config.jumpToPage();
	}
}
