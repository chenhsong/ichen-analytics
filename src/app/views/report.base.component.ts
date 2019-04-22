import { Component, Input, Output, OnDestroy } from "@angular/core";
import { Http } from "@angular/http";
import { Config } from "../config";
import * as am4charts from "@amcharts/amcharts4/charts";

export abstract class ReportBaseComponent<T> implements OnDestroy
{
	public isBusy = false;
	public isError = false;

	public chart: am4charts.Chart | null = null;

	public get chartType()
	{
		if (!this.chart) return "unknown";

		if (this.chart instanceof am4charts.PieChart) return "doughnut2d";
		if (this.chart instanceof am4charts.XYChart) return "scrollstackedcolumn2d";
		return "unknown";
	}

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

	public ngOnDestroy() { this.clearChart(); }

	public get i18n() { return Config.i18n; }

	public get requiredFilter() { return "Status"; }

	public async loadAsync(url: string): Promise<void>
	{
		let handle;

		try {
			handle = setTimeout(() => this.isBusy = true, 500);
			this.isError = false;

			const resp = await this.http.get(url).toPromise();

			clearTimeout(handle);
			const r = resp.json() as T;

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
			if (handle) clearTimeout(handle);
			this.isBusy = false;
		}
	}

	protected clearChart()
	{
		if (this.chart) this.chart.dispose();
		this.chart = null;
	}
}

