import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { Config } from "../config";
import { IMyDrpOptions, IMyDayLabels, IMyMonthLabels } from "mydaterangepicker";

@Component({
	selector: "ichen-report-download",
	templateUrl: "./report.download.component.html"
})
export class ReportDownloadComponent implements OnChanges
{
	@Input() public readonly i18n!: Readonly<ITranslationDictionary>;
	@Input() public currentUser: Readonly<ILoggedInUser> | null = null;
	@Input() public controllersList!: Readonly<IController>[];
	@Input() public title: string | null = null;
	@Input() public disabled = false;
	@Output("run") public readonly runEvent = new EventEmitter<IRunReportParameters>();

	public isError = false;
	public parameters: IRunReportParameters | null = null;
	public dateRange: string;
	public get hasValidDateRange() { return !!this.parameters; }
	public dataset = "";
	public selectedController = "";
	public format = "xls";

	private myDrpOptions: IMyDrpOptions | null = null;

	public get myDateRangePickerOptions()
	{
		return this.myDrpOptions || (this.myDrpOptions = {
			height: "2rem",
			width: "350px",

			firstDayOfWeek: "mo",
			minYear: 2016,

			selectionTxtFontSize: "1.5rem",
			componentDisabled: this.disabled,

			showApplyBtn: false,

			dayLabels: this.i18n["labelWeekDays"] as IMyDayLabels,
			monthLabels: this.i18n["labelMonths"] as IMyMonthLabels,

			//clearBtnTxt: this.i18n["btnClear"],
			//beginDateBtnTxt: this.i18n["labelStartDate"],
			//endDateBtnTxt: this.i18n["labelEndDate"],
			//acceptBtnTxt: this.i18n["btnOK"],
			selectBeginDateTxt: this.i18n["labelSelectStartDate"] as string,
			selectEndDateTxt: this.i18n["labelSelectEndDate"] as string
		});
	}

	constructor()
	{
		this.dateRange = Config.currentDateRange;

		const fromstr = Config.currentDateRange.substr(0, 10);
		const tostr = Config.currentDateRange.substr(13, 10);
		const fromdate = new Date(parseInt(fromstr.substr(0, 4), 10), parseInt(fromstr.substr(5, 2), 10) - 1, parseInt(fromstr.substr(8, 2), 10), 0, 0, 0, 0);
		const todate = new Date(parseInt(tostr.substr(0, 4), 10), parseInt(tostr.substr(5, 2), 10) - 1, parseInt(tostr.substr(8, 2), 10), 0, 0, 0, 0);
		const todate2 = todate;
		todate2.setDate(todate2.getDate() + 1);

		this.parameters = {
			controllerId: 0,
			dataset: this.dataset,
			format: this.format,
			from: fromstr, to: tostr,
			lower: fromdate.toISOString(),
			upper: todate2.toISOString()
		};
	}

	public ngOnChanges(changes: SimpleChanges)
	{
		// Track changes to invalidate MyDateRangePickerOptions
		if (changes.disabled || changes.i18n) this.myDrpOptions = null;
	}

	public onDateRangeChanged(ev: IDateRangePickerChangedEvent)
	{
		console.debug("onDateRangeChanged", ev);

		if (!!ev.formatted) {
			const todate = new Date(ev.endDate.year, ev.endDate.month - 1, ev.endDate.day, 0, 0, 0, 0);
			todate.setDate(todate.getDate() + 1);

			this.parameters = {
				controllerId: this.selectedController ? parseInt(this.selectedController, 10) : 0,
				dataset: this.dataset,
				format: this.format,
				from: new Date(Date.UTC(ev.beginDate.year, ev.beginDate.month - 1, ev.beginDate.day, 0, 0, 0, 0)).toISOString().substr(0, 10),
				to: new Date(Date.UTC(ev.endDate.year, ev.endDate.month - 1, ev.endDate.day, 0, 0, 0, 0)).toISOString().substr(0, 10),
				lower: new Date(ev.beginDate.year, ev.beginDate.month - 1, ev.beginDate.day, 0, 0, 0, 0).toISOString(),
				upper: todate.toISOString()
			};

			Config.currentDateRange = `${this.parameters.from} - ${this.parameters.to}`;
		} else {
			this.parameters = null;
			Config.currentDateRange = Config.defaultDateRange;
		}
	}

	public onDateRangeInputFieldChanged(ev: IDateRangePickerInputChangedEvent)
	{
		console.debug("onDateRangeInputFieldChanged", ev);
		if (!ev.valid) {
			this.parameters = null;
			Config.currentDateRange = Config.defaultDateRange;
		}
	}

	public validate()
	{
		if (this.disabled) return false;
		if (!this.hasValidDateRange) return false;
		if (!this.parameters) return false;
		if (!this.selectedController) return false;
		if (!this.format) return false;

		return true;
	}

	public runReport()
	{
		if (!this.validate()) return;
		if (!this.parameters) return;

		this.parameters.controllerId = parseInt(this.selectedController, 10);
		this.parameters.dataset = this.dataset;
		this.parameters.format = this.format;

		console.log(`Run [${this.title}] with parameters:`, this.parameters);

		this.runEvent.emit(this.parameters);
	}
}
