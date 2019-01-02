import * as FusionCharts from "fusioncharts";

(<any>FusionCharts).register("theme", {
	name: "ch",
	theme: {
		base: {
			chart: {
				baseFontSize: 16,
				captionFontSize: 24,
				subcaptionFontSize: 18,
				legendItemFontSize: 18,
				plotHighlightEffect: "fadeout|alpha=10",
				numVisiblePlot: 15,
				flatScrollBars: 0,
				scrollShowButtons: 1,
				scrollHeight: 15,
				showShadow: 0,
				rotateLabels: 0,
				slantLabels: 0,
				showYAxisLine: 0,
				stack100Percent: 1,
				showPercentValues: 1,
				showPercentInToolTip: 1,
				decimals: 1,
				showToolTip: 1,
				seriesNameInToolTip: 1,
				showToolTipShadow: 1,
				showPrintMenuItem: 1,
				exportEnabled: 1,
				exportAtClientSide: 1,
				exportShowMenuItem: 1
			}
		},
		doughnut2d: {
			chart: {
				labelFontSize: 18,
				useDataPlotColorForLabels: 1,
				plotHighlightEffect: "fadeout",
				showLegend: 0,
				showLabels: 1,
				enableSmartLabels: 1,
				showZeroPies: 0,
				animateClockwise: 1
			}
		},
		scrollstackedcolumn2d: {
			chart: {
			}
		}
	}
});
