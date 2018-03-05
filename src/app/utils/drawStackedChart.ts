import { Config } from "../config";
import * as FusionCharts from "fusioncharts";
import * as Charts from "fusioncharts/fusioncharts.charts";
import * as Ocean from "fusioncharts/themes/fusioncharts.theme.ocean";
import CH from "./fusioncharts.theme.ch";

Charts(FusionCharts);
Ocean(FusionCharts);
CH(FusionCharts);

// Date formatting
function i18nDateFormat(date: Date, format: string)
{
	return format.replace("{0}", date.getFullYear().toString()).replace("{1}", (date.getMonth() + 1).toString()).replace("{2}", date.getDate().toString());
}

function formatISODate(data: ITimeRangeValues[], index: number, i18n: ITranslationDictionary, monthOnly: boolean)
{
	const datestr = data[index].startTime;
	const date = new Date(datestr);

	if (monthOnly) {
		// Always put in the year if January

		const rec: any = {
			label: i18nDateFormat(date, i18n[date.getMonth() !== 0 ? "formatMonth" : "formatLongMonth"] as string),
			full: i18nDateFormat(date, i18n["formatLongMonth"] as string)
		};

		if (date.getMonth() === 0) rec.showLabel = 1;

		return rec;
	}

	const lastdatestr = (index > 0) ? data[index - 1].startTime : null;
	const nextdatestr = (index < data.length - 1) ? data[index + 1].startTime : null;

	// Format the local date/time as ISO format
	const localdateISO = date.getFullYear() + (date.getMonth() < 9 ? "-0" : "-") + (date.getMonth() + 1).toString() + (date.getDate() < 10 ? "-0" : "-") + date.getDate().toString() + (date.getHours() < 10 ? "T0" : "T") + date.getHours().toString() + (date.getMinutes() < 10 ? ":0" : ":") + date.getMinutes().toString() + (date.getSeconds() < 10 ? ":0" : ":") + date.getSeconds().toString();
	const localtimeISO = localdateISO.substr(11, 5);

	const fulldisplay = data[0].startTime.substr(0, 10) !== data[data.length - 1].startTime.substr(0, 10) ? i18nDateFormat(date, i18n["formatShortDate"] as string) : "";

	// If fitting too many data points, compress the date format, otherwise full format
	let display = (data.length > 10) ? i18nDateFormat(date, i18n["formatDay"] as string) : null;
	let hasTime = false;
	let alwaysShow = false;

	if (!lastdatestr) {
		// Display month on first label
		display = fulldisplay;
		alwaysShow = true;
	} else {
		const lastdate = new Date(lastdatestr);

		// Display month only when changed
		if (!display || lastdate.getMonth() !== date.getMonth()) {
			display = fulldisplay;
			alwaysShow = true;
		}

		// If date is the same as the last date, show only the time
		if (date.getFullYear() === lastdate.getFullYear() && date.getMonth() === lastdate.getMonth() && date.getDate() === lastdate.getDate()) {
			display = localtimeISO;
			hasTime = true;
		}
	}

	if (!hasTime && nextdatestr) {
		const nextdate = new Date(nextdatestr);

		// If date is the same as the next date, put in the time also
		if (date.getFullYear() === nextdate.getFullYear() && date.getMonth() === nextdate.getMonth() && date.getDate() === nextdate.getDate()) {
			display = fulldisplay + " " + localtimeISO;
			hasTime = true;
			alwaysShow = true;
		}
	}

	const r: any = { label: display, full: i18nDateFormat(date, i18n["formatLongDate"] as string) + " " + localtimeISO };

	if (alwaysShow) r.showLabel = 1;

	return r;
}


// Main charting function

export function DrawStackedChart(
	title: string,
	canvas: string,
	controllerId: number,
	timeRange: string,
	data: ITimeRangeValues[],
	i18n: ITranslationDictionary,
	categoriesSort: ((a: string, b: string) => number) | null,
	formatCategory: ((category: string, i18n: ITranslationDictionary) => string) | null,
	monthOnly: boolean
)
{
	data = data || [];
	data.sort((a, b) => a.startTime < b.startTime ? -1 : (a.startTime > b.startTime ? 1 : 0));

	// Collect categories

	const categories: { [category: string]: number[]; } = {};

	data.forEach((x, i) =>
	{
		for (const key in x.data) {
			if (!x.data.hasOwnProperty(key)) continue;

			const value = x.data[key];
			if (value === undefined || Math.abs(value) < 0.01) continue;

			if (categories[key] === undefined) categories[key] = [];
			categories[key][i] = value;
		}
	});

	// Build chart dates

	const dateslist = data.map((val, i) => formatISODate(data, i, i18n, monthOnly));

	console.debug("Dates:", dateslist);

	// Build chart series

	const chartdata: IChartingStackedSeries[] = [];

	for (const category in categories) {
		if (!categories.hasOwnProperty(category)) continue;

		const display = formatCategory ? formatCategory(category, i18n) : category;
		const list = categories[category];
		const series: IChartingStackedSeries = { seriesId: category, seriesName: display, data: [] };

		for (let i = 0; i < list.length; i++) {
			let value: number | undefined = list[i];

			if (value !== undefined && Math.abs(value) < 0.001) value = undefined;

			series.data.push({ label: dateslist[i].full, value: value });
		}

		chartdata.push(series);
	}

	// Sort the chart data by categories

	if (categoriesSort) chartdata.sort((a, b) => categoriesSort(a.seriesId, b.seriesId));

	// Completed chart data

	console.debug("Chart data:", chartdata);

	// Setup charting options

	const name = !!controllerId && Config.controllersList && Config.controllersList.filter(x => x.id === controllerId)[0].name || controllerId.toString();
	const machineinfo = !!controllerId ? i18n["labelForMachine"] as string : null;
	if (machineinfo) title += " - " + machineinfo.replace("{0}", name).replace("{1}", controllerId.toString());

	const options = {
		theme: "ocean,ch",
		numVisiblePlot: 15,
		caption: title,
		subCaption: timeRange,
		xAxisName: i18n["labelDate"],
		yAxisName: i18n["labelPercentage"],
		exportFormats: i18n["textExportFormats"],
		plotToolText: "$seriesName<br>$label<br>$percentValue"
	};

	// Draw chart

	const chart = new FusionCharts(
		{
			type: "scrollstackedcolumn2d",
			renderAt: canvas,
			width: "100%",
			height: "100%",
			dataFormat: "json",
			dataSource:
				{
					chart: options,
					categories: { category: dateslist },
					dataset: chartdata
				}
		});

	chart.render();
}
