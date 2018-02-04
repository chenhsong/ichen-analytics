import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { RouterModule } from "@angular/router";
import { Observable } from "rxjs/Rx";

import { MyDateRangePickerModule } from "mydaterangepicker";

import { AppRoutes, AppComponentsList } from "./app.routes";
import { AppComponent } from "./app.component";
import { ReportDownloadComponent } from "./views/report.download.component";
import { ReportHeaderComponent } from "./views/report.header.component";

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		MyDateRangePickerModule,

		RouterModule.forRoot(AppRoutes)
	],

	schemas: [CUSTOM_ELEMENTS_SCHEMA],

	declarations: [
		AppComponent,
		ReportDownloadComponent,
		ReportHeaderComponent,

		...AppComponentsList
	],

	providers: [],

	bootstrap: [AppComponent]
})
export class AppModule
{
}
