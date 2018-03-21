import { Component, Input, Output } from "@angular/core";
import { Http } from "@angular/http";
import { Config, URL } from "../config";
import { ReportBaseComponent } from "./report.base.component";
import { DrawStackedChart } from "../utils/draw-stacked-chart";
import { DrawCategorizedStackedChart } from "../utils/draw-categorized-stacked-chart";
import { DrawPieChart } from "../utils/draw-pie-chart";

// Put Production first, Offline and Idle at back
const JobModeSortOrder: { [jobmode: string]: number; } = {
	"Unknown": 1,
	"ID01": 998,
	"ID02": 0,
	"ID03": 3,
	"ID04": 4,
	"ID05": 5,
	"ID06": 6,
	"ID07": 7,
	"ID08": 8,
	"ID09": 9,
	"ID10": 10,
	"ID11": 11,
	"ID12": 12,
	"ID13": 13,
	"ID14": 14,
	"ID15": 15,
	"Offline": 999
};

@Component({
	selector: "ichen-report-jobmodes",
	template: `
		<div *ngIf="!isDenied && !isInitializing">
			<ichen-report-header [i18n]="i18n"
				[disabled]="isBusy"
				[collapsed]="collapseHeader"
				[title]="title"
				[useDateRange]="true"
				[controllersList]="controllersList"
				(run)="runReportAsync($event)"
			></ichen-report-header>

			<div id="chartContainer" class="card card-body" [hidden]="!showChart || isError || isDenied">
				<div id="chartCanvas" [hidden]="isBusy"></div>

				<div id="imgLoading" *ngIf="isBusy" class="text-center">
					<img src="/images/loading.gif" />
				</div>
			</div>
		</div>

		<div id="imgLoading" *ngIf="isInitializing">
			<img src="/images/loading.gif" />
		</div>

		<div id="imgError" *ngIf="isError">
			<p><img src="/images/alert.png" /></p>
			<h2>{{i18n.textError}}</h2>
		</div>

		<div id="imgNoAuthority" *ngIf="isDenied">
			<p><img src="/images/stopsign.png" /></p>
			<h2>{{i18n.textNoAuthority}}</h2>
		</div>
	`
})
export class JobModesReportComponent extends ReportBaseComponent<ITimeRangeValuesByControllers | ITimeRangeValues[]>
{
	public showChart = false;
	public collapseHeader = false;

	constructor(http: Http) { super(http); }

	public get i18n() { return Config.i18n; }

	public get title() { return this.i18n["titleJobModes"] as string; }

	private compareJobModes(a: string, b: string)
	{
		const asort = JobModeSortOrder[a];
		const bsort = JobModeSortOrder[b];

		return (asort < bsort) ? -1 : (asort > bsort) ? 1 : 0;
	}

	private formatJobMode(category: string, i18n: ITranslationDictionary)
	{
		return i18n["labelJobMode" + category] as string;
	}

	public async runReportAsync(parameters: IRunReportParameters)
	{
		this.clearChart();
		this.collapseHeader = false;

		const controllerId = parameters.controllerId;

		let url = URL.eventsReport;
		url = url.replace("{0}", parameters.byMachine ? "" : controllerId.toString())
			.replace("{1}", "JobMode")
			.replace("//", "/");

		url += "?timezone=" + Config.timeZone + "&from=" + parameters.lower + "&to=" + parameters.upper;

		if (parameters.step !== undefined) url += "&step=" + parameters.step;

		this.showChart = true;

		await this.loadAsync(url);

		this.collapseHeader = true;

		if (!this.data) return;

		const timerange = parameters.from.substr(0, 10) + " - " + parameters.to.substr(0, 10);

		if (Array.isArray(this.data)) {
			if (this.data.length <= 0) {
				console.error("Chart has no data!");
			} else if (this.data.length <= 1) {
				DrawPieChart(this.title, Config.chartCanvasId, controllerId, timerange, this.data[0], this.i18n, this.compareJobModes, this.formatJobMode);
			} else {
				DrawStackedChart(this.title, Config.chartCanvasId, controllerId, timerange, this.data, this.i18n, this.compareJobModes, this.formatJobMode, !!parameters.monthOnly);
			}
		} else {
			const xlabel = (parameters.byMachine ? this.i18n["labelMachine"] as string : null);

			DrawCategorizedStackedChart(this.title, xlabel, Config.chartCanvasId, timerange, this.data, this.i18n, this.compareJobModes, this.formatJobMode);
		}
	}
}
