import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { Config } from "../config";
import { IMyDrpOptions, IMyDayLabels, IMyMonthLabels } from "mydaterangepicker";

@Component({
	selector: "ichen-report-header",
	template: `
		<div class="card">
			<h3 class="title card-header">
				<div class="collapse-button float-right">
					<span [hidden]="collapsed" class="glyphicon glyphicon-chevron-up" (click)="collapsed=true"></span>
					<span [hidden]="!collapsed" class="glyphicon glyphicon-chevron-down" (click)="collapsed=false"></span>
				</div>

				{{title}}
			</h3>

			<div [hidden]="collapsed" class="card-body">
				<div style="margin:0 0 1rem 0">
					<my-date-range-picker
						*ngIf="useDateRange"
						class="row"
						[options]="myDateRangePickerOptions"
						[selDateRange]="dateRange"
						(dateRangeChanged)="onDateRangeChanged($event)"
						(inputFieldChanged)="onDateRangeInputFieldChanged($event)"
					></my-date-range-picker>
				</div>

				<div class="row">
					<div class="form-group col-sm-8 col-md-5">
						<div class="input-group">
							<span class="input-group-prepend input-group-text">{{i18n.labelCategorize}}</span>
							<select class="form-control" [(ngModel)]="step" [disabled]="disabled" (change)="$event.target.value==byMachineStep ? selectedController='0' : null">
								<option value="00:00:00">{{i18n.labelEntireRange}}</option>
								<option *ngIf="controllersList.length > 1" value="{{byMachineStep}}">{{i18n.labelByMachine}}</option>
								<option value="01:00:00">{{i18n.labelByHour}}</option>
								<option value="{{byShiftStep}}">{{i18n.labelByShift}}</option>
								<option value="1:00:00:00">{{i18n.labelByDay}}</option>
								<option value="-7:00:00:00">{{i18n.labelByWeek}}</option>
								<option value="-30:00:00:00">{{i18n.labelByMonth}}</option>
								<option value="-90:00:00:00">{{i18n.labelByQuarter}}</option>
								<option value="-180:00:00:00">{{i18n.labelByHalfYear}}</option>
							</select>
						</div>
					</div>

					<div class="form-group col-md-6">
						<div class="input-group">
							<span class="input-group-prepend input-group-text">{{i18n.labelMachine}}</span>
							<select class="form-control" [(ngModel)]="selectedController" [disabled]="disabled" (change)="$event.target.value!='0' && step==byMachineStep ? step='00:00:00' : null">
								<option *ngIf="controllersList.length > 1" value="0">{{i18n.labelSelectAll}}</option>
								<option *ngFor="let controller of controllersList" value="{{controller.id}}">{{controller.name}} ({{controller.id}})</option>
							</select>
						</div>
					</div>
				</div>

				<div>
					<button type="button"
						[disabled]="!validate()"
						(click)="runReport()"
						class="btn btn-lg btn-primary"><span class="glyphicon glyphicon-flash"></span>&nbsp;&nbsp;&nbsp;{{i18n.btnRunReport}}</button>
				</div>
			</div>
		</div>
	`
})
export class ReportHeaderComponent implements OnChanges
{
	@Input() public readonly i18n!: Readonly<ITranslationDictionary>;
	@Input() public title: string | null = null;
	@Input() public disabled = false;
	@Input() public useDateRange = true;
	@Input() public collapsed = false;
	@Input() public controllersList!: Readonly<IController>[];
	@Output("run") public readonly runEvent = new EventEmitter<IRunReportParameters>();

	public readonly byMachineStep = "*";
	public readonly byShiftStep = Config.shiftStep;
	public parameters: IRunReportParameters | null = null;
	public dateRange: string;
	public get hasValidDateRange() { return !!this.parameters; }
	public step = "00:00:00";
	public selectedController = "0";

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
			controllerId: parseInt(this.selectedController, 10),
			from: fromstr, to: tostr,
			lower: fromdate.toISOString(),
			upper: todate2.toISOString()
		};
	}

	public ngOnChanges(changes: SimpleChanges)
	{
		// Track changes to invalidate MyDateRangePickerOptions
		if (changes.disabled || changes.i18n) this.myDrpOptions = null;

		// Track changes to the list of controllers
		const change = changes["controllersList"];

		if (change && change.currentValue.length) {
			if (change.currentValue.length <= 1) {
				console.debug(`Length of controllers list has changed to ${change.currentValue.length}. Choosing controller ${change.currentValue[0].id} by default.`);
				if (this.step === this.byMachineStep) this.step = "00:00:00";
				if (this.selectedController === "0") this.selectedController = change.currentValue[0].id;
			}
		}
	}

	public onDateRangeChanged(ev: IDateRangePickerChangedEvent)
	{
		console.debug("onDateRangeChanged", ev);

		if (!!ev.formatted) {
			const todate = new Date(ev.endDate.year, ev.endDate.month - 1, ev.endDate.day, 0, 0, 0, 0);
			todate.setDate(todate.getDate() + 1);

			this.parameters = {
				controllerId: parseInt(this.selectedController, 10),
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

		if (this.step === this.byMachineStep && this.selectedController !== "0") return false;

		// Do not limit
		//if (this.step) {
		//	switch (this.step) {
		//		case "01:00:00": {
		//			if (this.parameters.from !== this.parameters.to) return false;
		//			break;
		//		}
		//		case this.byShiftStep: {
		//			// Check date range
		//			const from = new Date(this.parameters.from);
		//			const to = new Date(this.parameters.to);
		//			const diff = to.valueOf() - from.valueOf();
		//			const days = diff / (1000 * 60 * 60 * 24) + 1;

		//			if (days > 7) return false;
		//			break;
		//		}
		//	}
		//}

		return true;
	}

	public runReport()
	{
		if (!this.validate()) return;
		if (!this.parameters) return;

		this.parameters.controllerId = parseInt(this.selectedController, 10);

		if (this.step === this.byMachineStep) {
			delete this.parameters.step;
			this.parameters.byMachine = true;
		} else if (this.step !== "00:00:00") {
			this.parameters.step = this.step;
			delete this.parameters.byMachine;
		} else {
			delete this.parameters.step;
			delete this.parameters.byMachine;
		}

		switch (this.step) {
			case "-30:00:00:00":
			case "-90:00:00:00":
			case "-180:00:00:00": {
				this.parameters.monthOnly = true;
				break;
			}
			default: {
				delete this.parameters.monthOnly;
				break;
			}
		}

		console.log(`Run [${this.title}] with parameters:`, this.parameters);

		this.runEvent.emit(this.parameters);
	}
}
