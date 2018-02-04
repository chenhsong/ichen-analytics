import { Component, Input, Output } from "@angular/core";
import { Http } from "@angular/http";
import { Config } from "../config";

export abstract class ReportBaseComponent<T>
{
	public isBusy = false;
	public isError = false;

	public get isInitializing()
	{
		if (!this.currentUser) return true;
		if (!this.controllersList) return true;
		return false;
	}

	public get isDenied()
	{
		if (!this.currentUser) return false;
		if (this.requiredFilter && this.currentUser.roles.indexOf(this.requiredFilter) < 0) return true;
		if (this.noAuthority) return true;
		return false;
	}

	public data: T | null = null;
	public get currentUser() { return Config.currentUser; }
	public get controllersList() { return Config.controllersList; }

	private noAuthority = false;
	private isLoading = false;

	constructor(protected http: Http)
	{
		if (Config.forceLogin) {
			console.log("Not logged in. Redirecting to login page...");
			Config.jumpToPage();
		}
	}

	public get i18n() { return Config.i18n; }

	public get requiredFilter() { return "Status"; }

	public async loadAsync(url: string): Promise<void>
	{
		try {
			this.isBusy = true;
			this.isError = false;

			const r = await this.http.get(url).map(resp => resp.json() as T).toPromise();

			console.log(`Data returned for ${url}`, r);
			this.data = r;
		} catch (err) {
			console.error(err);
			this.data = null;

			switch (err.status) {
				case 401: this.noAuthority = true; break;
				default: this.isError = true; break;
			}
		} finally {
			this.isBusy = false;
		}
	}

	protected clearChart()
	{
		const node = document.getElementById("chartCanvas");

		if (!node) return;

		while (node.hasChildNodes()) {
			if (node.lastChild) node.removeChild(node.lastChild);
		}
	}
}

