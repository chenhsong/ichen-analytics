import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Http, Headers } from "@angular/http";
import { Config, URL, reloadControllersList } from "../config";

@Component({
	selector: "ichen-login",
	template: `
		<form *ngIf="!isBusy" class="card">
			<div class="card-header bg-primary text-white">
				<h4><span class="glyphicon glyphicon-lock"></span>&nbsp;&nbsp;{{i18n.btnLogin}}</h4>
			</div>

			<div class="card-body">
				<div class="ichen-edit-id form-group" [class.has-danger]="!isValidUser">
					<div class="input-group input-group-lg">
						<span class="input-group-addon">{{i18n.labelUserName}}</span>
						<input name="input-username" [ngModel]="user" type="text" class="form-control form-control-danger" placeholder="{{i18n.labelEnterUserName}}"
							(input)="$event.target.value=user=$event.target.value.trim()"
						 />
					</div>
				</div>

				<div class="ichen-edit-id form-group" [class.has-danger]="!isValidPassword">
					<div class="input-group input-group-lg">
						<span class="input-group-addon">{{i18n.labelPassword}}</span>
						<input name="input-password" [ngModel]="password" type="password" class="form-control form-control-danger" placeholder="{{i18n.labelEnterPassword}}"
							(input)="$event.target.value=password=$event.target.value.trim()"
						 />
					</div>
				</div>
			</div>

			<div class="card-footer buttons-strip">
				<button type="submit" [disabled]="!isValidUser || !isValidPassword" (click)="doLogin($event)" class="btn btn-lg btn-primary"><span class="glyphicon glyphicon-log-in"></span>&nbsp;&nbsp;{{i18n.btnLogin}}</button>
			</div>
		</form>

		<div id="imgLoading" *ngIf="isBusy">
			<img src="/images/loading.gif" />
		</div>
	`
})
export class LoginComponent
{
	public user: string;
	public password: string;
	public isBusy = false;
	public isError = false;

	public get i18n() { return Config.i18n; }

	constructor(private http: Http) { }

	public get isValidUser() { return !!this.user && !!this.user.trim(); }
	public get isValidPassword() { return !!this.password && !!this.password.trim(); }

	public async doLogin(ev: Event)
	{
		ev.preventDefault();

		if (this.isBusy) return;
		if (!this.user) return;
		if (!this.password) return;

		const login = { name: this.user, password: this.password };

		this.isBusy = true;
		this.isError = false;

		try {
			const user = await this.http.post(URL.login, JSON.stringify(login), {
				headers: new Headers({ "Content-Type": "application/json" })
			}).map(r => r.json() as ILoggedInUser).toPromise();

			console.log("Successfully logged in.", user);
			this.isBusy = false;
			this.isError = false;
			Config.currentUser = user;
			Config.forceLogin = false;

			Config.jumpToPage(URL.homeRoute);

			await reloadControllersList(this.http);
		} catch (err) {
			console.error(err);
			alert("Login failed.");

			Config.forceLogin = true;
			Config.currentUser = null;
			this.isBusy = false;
			this.isError = true;
		}
	}
}
