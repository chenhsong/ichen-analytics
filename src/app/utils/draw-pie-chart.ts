import { Config } from "../config";

export function DrawPieChart(
	title: string | null,
	controllerId: number,
	timeRange: string,
	data: ITimeRangeValues,
	i18n: ITranslationDictionary,
	categoriesSort: ((a: string, b: string) => number) | null,
	formatCategory: ((category: string, i18n: ITranslationDictionary) => string) | null
)
{
	if (!data) throw new Error("DrawPieChart: data is null!");

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

	// Setup charting options

	const name = !!controllerId && Config.controllersList && Config.controllersList.filter(x => x.id === controllerId)[0].name || controllerId.toString();
	const subcaption = !!controllerId ? i18n["labelForMachine"] as string : null;
	if (subcaption) title += " - " + subcaption.replace("{0}", name).replace("{1}", controllerId.toString());

	return {
		charttype: "doughnut2d",
		chart: {
			theme: "ocean,ch",
			caption: title,
			subCaption: timeRange,
			exportFormats: i18n["textExportFormats"]
		},
		data: chartdata
	};
}
