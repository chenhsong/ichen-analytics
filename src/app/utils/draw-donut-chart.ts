import { Config, Charts } from "../config";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { CreateExportMenu, AddChartTitles, ShowIndicator, HideIndicator } from "../utils/amCharts";

export function DrawDonutChart(
	title: string | null,
	controllerId: number,
	timeRange: string,
	data: ITimeRangeValues,
	i18n: ITranslationDictionary,
	categoriesSort: ((a: string, b: string) => number) | null,
	formatCategory: ((category: string, i18n: ITranslationDictionary) => string) | null
)
{
	if (!data) throw new Error("DrawDonutChart: data is null!");

	// Build chart series

	const chartdata = [] as IChartingDataPoint[];

	for (const label in data.data) {
		if (!data.data.hasOwnProperty(label)) continue;

		const value = data.data[label];
		if (!!value && Math.abs(value) > 0.001) chartdata.push({ label: label, value: value });
	}

	// Sort the categories

	if (categoriesSort) chartdata.sort((a, b) => categoriesSort(a.label as string, b.label as string));

	// Process the category names

	if (formatCategory) chartdata.forEach(category => category.label = formatCategory(category.label as string, i18n) || category.label);

	// Completed chart data

	console.debug("Chart data:", chartdata);

	// Setup titles

	const name = !!controllerId && Config.controllersList && Config.controllersList.filter(x => x.id === controllerId)[0].name || controllerId.toString();
	const subcaption = !!controllerId ? i18n["labelForMachine"] as string : null;
	if (subcaption) title += " - " + subcaption.replace("{0}", name).replace("{1}", controllerId.toString());

	// Create donut chart

	const chart = am4core.create(Charts.canvasId, am4charts.PieChart);
	chart.data = chartdata;

	AddChartTitles(chart, title || "", timeRange);

	chart.innerRadius = am4core.percent(45);
	chart.legend = new am4charts.Legend();
	chart.exporting.menu = CreateExportMenu(i18n);

	const pieSeries = chart.series.push(new am4charts.PieSeries());
	pieSeries.dataFields.value = "value";
	pieSeries.dataFields.category = "label";

	// This creates initial animation
	pieSeries.hiddenState.properties.opacity = 1;
	pieSeries.hiddenState.properties.endAngle = -90;
	pieSeries.hiddenState.properties.startAngle = -90;

	pieSeries.slices.template.stroke = am4core.color("#fff");
	pieSeries.slices.template.strokeWidth = 2;
	pieSeries.slices.template.strokeOpacity = 1;

	if (pieSeries.tooltip) pieSeries.tooltip.animationDuration = 200;

	pieSeries.slices.template.tooltipText = "{category}\n{value.percent.formatNumber('#.#')}%";
	pieSeries.labels.template.text = "{category} ({value.percent.formatNumber('#.#')}%)";
	chart.legend.valueLabels.template.text = "{value.percent.formatNumber('#.#')}%";

	return chart as am4charts.Chart;
}
