import { Config } from "../config";
import CollectCategories from "../utils/collect-categories";

export function DrawCategorizedStackedChart(
	title: string | null,
	xAxis: string | null,
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

	const categories = CollectCategories(machines);

	// Build chart series

	const chartdata = [] as IChartingStackedSeries[];

	categories.forEach((list, category) =>
	{
		// Do not chart categories that are empty
		if (!list.some(x => x !== undefined)) return;

		const series = {
			seriesid: category,
			seriesname: formatCategory ? formatCategory(category, i18n) : category,
			data: list.map(value => ({ value: value })),
		} as IChartingStackedSeries;

		chartdata.push(series);
	});

	// Sort the chart data by categories

	if (categoriesSort) chartdata.sort((a, b) => categoriesSort(a.seriesid, b.seriesid));

	// Completed chart data

	console.debug("Chart data:", chartdata);

	return {
		charttype: "scrollstackedcolumn2d",
		chart: {
			theme: "ocean,ch",
			numVisiblePlot: 10,
			caption: title,
			subCaption: timeRange,
			xAxisName: xAxis,
			yAxisName: i18n["labelPercentage"],
			exportFormats: i18n["textExportFormats"],
			plotToolText: "$label<br>$seriesName<br>$percentValue"
		},
		categories: [{
			category: machineNames
		}],
		dataset: chartdata
	};
}
