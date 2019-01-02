import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";

import { MyDateRangePickerModule } from "mydaterangepicker";

import { AppRouterModule, AppComponentsList } from "./app.routes";
import { AppComponent } from "./app.component";
import { ReportDownloadComponent } from "./views/report.download.component";
import { ReportHeaderComponent } from "./views/report.header.component";

import { FusionChartsModule } from "angular-fusioncharts";
import * as FusionCharts from "fusioncharts";
import * as Charts from "fusioncharts/fusioncharts.charts";
import * as OceanTheme from "fusioncharts/themes/fusioncharts.theme.ocean";
import "./utils/fusioncharts.theme.ch";

// Initialize FusionCharts
FusionChartsModule.fcRoot(FusionCharts, Charts, OceanTheme);
(<any>FusionCharts.options).creditLabel = false;

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		MyDateRangePickerModule,
		AppRouterModule,
		FusionChartsModule
	],

	declarations: [
		AppComponent,
		ReportDownloadComponent,
		ReportHeaderComponent,

		...AppComponentsList
	],

	bootstrap: [AppComponent]
})
export class AppModule
{
}
