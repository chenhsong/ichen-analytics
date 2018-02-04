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
	data: IEventsReportData,
	i18n: ITranslationDictionary,
	categoriesSort: ((a: string, b: string) => number) | null,
	formatCategory: ((category: string, i18n: ITranslationDictionary) => string) | null
)
{
	data = data || {};

	const datax: (ITimeRangeValues & { controllerId: number; name: string; })[] = [];

	for (const controllerId in data) {
		if (!data.hasOwnProperty(controllerId)) continue;

		const machine = data[controllerId][0] as (ITimeRangeValues & { controllerId: number; name: string; });
		const id = parseInt(controllerId, 10);
		machine.controllerId = id;
		machine.name = (Config.controllersList ? Config.controllersList.filter(x => x.id === id)[0].name : null) || id.toString();
		datax.push(machine);
	}

	datax.sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0));

	// Build machines list

	const machineslist = datax.map(m => ({ label: m.name }));

	console.debug("Machines:", machineslist);

	// Collect categories

	const categories: { [category: string]: number[]; } = {};

	for (let i = 0; i < datax.length; i++) {
		const dataset = datax[i].data;

		for (const key in dataset) {
			if (!dataset.hasOwnProperty(key)) continue;

			const value = dataset[key];
			if (value === undefined || Math.abs(value) < 0.01) continue;

			if (categories[key] === undefined) categories[key] = [];
			categories[key][i] = value;
		}
	}

	// Build chart series

	const chartdata: IChartingStackedSeries[] = [];

	for (const category in categories) {
		if (categories.hasOwnProperty(category)) continue;

		const display = formatCategory ? formatCategory(category, i18n) : category;
		const list = categories[category];
		const series: IChartingStackedSeries = { seriesId: category, seriesName: display, data: [] };

		for (let i = 0; i < list.length; i++) {
			let value: number | undefined = list[i];

			if (value !== undefined && Math.abs(value) < 0.001) value = undefined;

			series.data.push({ value });
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
					categories: { category: machineslist },
					dataset: chartdata
				}
		});

	chart.render();
}
