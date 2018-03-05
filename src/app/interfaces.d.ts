declare module "*.json" {
	const value: any;
	export default value;
}

type ITranslationDictionary = Readonly<{ [id: string]: string | { [key: string]: string; }; }>;

interface ILoggedInUser
{
	id: number;
	isEnabled: boolean;
	name: string;
	password: string;
	filters?: string;
	roles: string[];
	sessionId: string;
	started: string | Date;
	lastAccessed: string | Date;
	created: string | Date;
	modified?: string | Date;
}

type ControllerTypes = "Ai01" | "Ai02" | "Ai11" | "Ai12" | "CPC60" | "MPC60" | "CDC2000" | "CDC3000" | "CDC2000WIN" | "SPS3300" | "NewAge" | "CBmold300" | "CBmold800" | "Unknown";

interface IController
{
	id: number;
	name: string;
	isEnabled: boolean;
	type?: ControllerTypes;
	version?: string;
	model?: string;
	IP?: string;
	created: string | Date;
	modified?: string | Date;
}

interface IDate
{
	year: number;
	month: number;
	day: number;
}

interface IDateRangePickerInputChangedEvent
{
	value: string;
	dateRangeFormat: string;
	valid: boolean;
}

interface IDateRangePickerChangedEvent
{
	beginDate: IDate;
	endDate: IDate;
	formatted: string;
	beginEpoc: number;
	endEpoc: number;
}

interface ITimeRangeValues
{
	startTime: string;
	endTime: string;
	data: { [key: string]: number; }
}

interface IControllerIDandName
{
	controllerId: number;
	name: string;
}

interface ITimeRangeValuesByControllers
{
	[controllerId: string]: (ITimeRangeValues & IControllerIDandName)[];
}

interface IRunReportParameters
{
	from: string;
	to: string;
	lower: string;
	upper: string;
	controllerId: number;
	dataset?: string;
	step?: string;
	byMachine?: boolean;
	monthOnly?: boolean;
	format?: string;
}

interface IChartingDataPoint
{
	label?: string;
	value: number | undefined;
	displayValue?: string;
	isSliced?: number;
	tooltext?: string;
}
interface IChartingStackedSeries
{
	seriesId: string;
	seriesName: string;
	data: IChartingDataPoint[];
}
