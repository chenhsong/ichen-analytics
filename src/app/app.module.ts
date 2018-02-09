import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { RouterModule } from "@angular/router";
import { Observable } from "rxjs/Rx";

import { MyDateRangePickerModule } from "mydaterangepicker";

import { AppRouterModule } from "./app.routes";
import { AppComponent } from "./app.component";
import { ReportDownloadComponent } from "./views/report.download.component";
import { ReportHeaderComponent } from "./views/report.header.component";

import { HomeComponent } from "./views/home.component";
import { LoginComponent } from "./views/login.component";
import { LogoutComponent } from "./views/logout.component";
import { JobModesReportComponent } from "./views/report.jobmodes.component";
import { OpModesReportComponent } from "./views/report.opmodes.component";
import { OperatorsReportComponent } from "./views/report.operators.component";
import { JobCardsReportComponent } from "./views/report.jobcards.component";
import { MoldsReportComponent } from "./views/report.molds.component";

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		MyDateRangePickerModule,
		AppRouterModule
	],

	declarations: [
		AppComponent,
		ReportDownloadComponent,
		ReportHeaderComponent,

		//...AppComponentsList
		HomeComponent,
		LoginComponent,
		LogoutComponent,
		JobModesReportComponent,
		OpModesReportComponent,
		OperatorsReportComponent,
		JobCardsReportComponent,
		MoldsReportComponent
	],

	bootstrap: [AppComponent]
})
export class AppModule
{
}
