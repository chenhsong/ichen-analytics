import { Config } from "../config";
import CollectCategories from "../utils/collect-categories";

// Types
interface IChartPoint
{
	label: string;
	full: string;
	showLabel?: 0 | 1;
}

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

		const rec: IChartPoint = {
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

	const r: IChartPoint = {
		label: display,
		full: i18nDateFormat(date, i18n["formatLongDate"] as string) + " " + localtimeISO
	};

	if (alwaysShow) r.showLabel = 1;

	return r;
}


// Main charting function

export function DrawStackedChart(
	title: string | null,
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

	// Build chart dates

	const dateslist = data.map((val, i) => formatISODate(data, i, i18n, monthOnly));

	console.debug("Dates:", dateslist);

	// Collect categories

	const categories = CollectCategories(data);

	// Build chart series

	const chartdata = [] as IChartingStackedSeries[];

	categories.forEach((list, category) =>
	{
		// Do not chart categories that are empty
		if (!list.some(x => x !== undefined)) return;

		const series = {
			seriesid: category,
			seriesname: formatCategory ? formatCategory(category, i18n) : category,
			data: list.map((value, i) => ({ label: dateslist[i].full, value: value })),
		} as IChartingStackedSeries;

		chartdata.push(series);
	});

	// Sort the chart data by categories

	if (categoriesSort) chartdata.sort((a, b) => categoriesSort(a.seriesid, b.seriesid));

	// Completed chart data

	console.debug("Chart data:", chartdata);

	// Setup charting options

	const name = !!controllerId && Config.controllersList && Config.controllersList.filter(x => x.id === controllerId)[0].name || controllerId.toString();
	const machineinfo = !!controllerId ? i18n["labelForMachine"] as string : null;
	if (machineinfo) title += " - " + machineinfo.replace("{0}", name).replace("{1}", controllerId.toString());

	return {
		charttype: "scrollstackedcolumn2d",
		chart: {
			theme: "ocean,ch",
			numVisiblePlot: 15,
			caption: title,
			subCaption: timeRange,
			xAxisName: i18n["labelDate"],
			yAxisName: i18n["labelPercentage"],
			exportFormats: i18n["textExportFormats"],
			plotToolText: "$label<br>$seriesName<br>$percentValue"
		},
		categories: [{
			category: dateslist
		}],
		dataset: chartdata
	};
}
