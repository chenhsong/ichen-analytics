import { Config } from "../config";
import * as FusionCharts from "fusioncharts";
import * as Charts from "fusioncharts/fusioncharts.charts";
import * as Ocean from "fusioncharts/themes/fusioncharts.theme.ocean";
import CH from "./fusioncharts.theme.ch";

Charts(FusionCharts);
Ocean(FusionCharts);
CH(FusionCharts);

export function DrawCategorizedStackedChart(
	title: string,
	canvas: string,
	timeRange: string,
	data: ITimeRangeValuesByControllers,
	i18n: ITranslationDictionary,
	categoriesSort: ((a: string, b: string) => number) | null,
	formatCategory: ((category: string, i18n: ITranslationDictionary) => string) | null
)
{
	data = data || {};

	const machines: (ITimeRangeValues & IControllerIDandName)[] = [];

	for (const controllerId in data) {
		if (!data.hasOwnProperty(controllerId)) continue;

		const machine = data[controllerId][0];
		const id = parseInt(controllerId, 10);
		machine.controllerId = id;
		machine.name = (Config.controllersList ? Config.controllersList.filter(x => x.id === id)[0].name : null) || id.toString();
		machines.push(machine);
	}

	machines.sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0));

	// Build machines list

	const machineNames = machines.map(m => ({ label: m.name }));

	console.debug("Machines:", machineNames);

	// Collect categories

	const categories: { [category: string]: (number | undefined)[]; } = {};

	for (const machine of machines) {
		for (const category in machine.data) {
			if (!machine.data.hasOwnProperty(category)) continue;
			if (!(category in categories)) categories[category] = [];
		}
	}

	for (const machine of machines) {
		const dataset = machine.data;

		for (const category in categories) {
			if (!categories.hasOwnProperty(category)) continue;

			const value = dataset[category];

			if (value === undefined) {
				categories[category].push(undefined);
			} else {
				categories[category].push(Math.abs(value) < 0.01 ? undefined : value);
			}
		}
	}

	console.debug("Categories:", categories);

	// Build chart series

	const chartdata: IChartingStackedSeries[] = [];

	for (const category in categories) {
		if (!categories.hasOwnProperty(category)) continue;

		// Do not chart categories that are empty
		if (categories[category].filter(x => x !== undefined).length <= 0) continue;

		const display = formatCategory ? formatCategory(category, i18n) : category;
		const series: IChartingStackedSeries = { seriesId: category, seriesName: display, data: [] };

		for (const value of categories[category]) {
			series.data.push({ value: value });
		}

		chartdata.push(series);
	}

	// Sort the chart data by categories

	if (categoriesSort) chartdata.sort((a, b) => categoriesSort(a.seriesId, b.seriesId));

	// Completed chart data

	console.debug("Chart data:", chartdata);

	// Setup charting options

	const options: any = {
		theme: "ocean,ch",
		numVisiblePlot: 10,
		caption: title,
		subCaption: timeRange,
		xAxisName: i18n["labelDate"],
		yAxisName: i18n["labelPercentage"],
		exportFormats: i18n["textExportFormats"],
		plotToolText: "$seriesName<br>	$label<br>$percentValue"
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
					categories: { category: machineNames },
					dataset: chartdata
				}
		});

	chart.render();
}
