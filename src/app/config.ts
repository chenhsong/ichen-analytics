import { ApplicationRef } from "@angular/core";
import { Http } from "@angular/http";
import { map } from "rxjs/operators";

// Constants

const iframeId = "downloadIFrame";
const urlRoot = (window as any).ServiceUrl || "";
const chartCanvasId = "chartCanvas";
const shiftStep = "08:00:00";		// 8-hour shifts
const timeZone = -(new Date()).getTimezoneOffset();

export const URL = {
	i18n: "lib/i18n.json",

	loginRoute: "routeLogin",
	homeRoute: "routeHome",
	login: `${urlRoot}/login`,
	logout: `${urlRoot}/logout`,
	currentUser: `${urlRoot}/user`,

	controllersList: `${urlRoot}/config/controllers`,
	eventsReport: `${urlRoot}/reports/events/{0}/{1}`,
	dataDownload: `${urlRoot}/reports/{0}/{1}`
};

// Load default time range with current date

const now = new Date();
const nowstr = now.toISOString().substr(0, 10);

const bom = new Date(nowstr);
bom.setDate(1);
const bomstr = bom.toISOString().substr(0, 10);

const defaultDateRange = `${bomstr} - ${nowstr}`;


// Utility functions

function jumpToPage(page?: string) { throw new Error("Not implemented."); }

const currentUser = null as ILoggedInUser | null;

const Cfg = {
	lang: "",
	urlRoot,
	appRef: null,
	get iFrame() { return document.getElementById(iframeId) as HTMLIFrameElement; },
	jumpToPage,
	currentUser,
	forceLogin: false,
	controllersList: null as IController[] | null,
	i18n: {},
	chartCanvasId,
	timeZone,
	shiftStep,
	defaultDateRange,
	currentDateRange: defaultDateRange
};

export async function reloadControllersList(http: Http)
{
	try {
		// Get controllers
		const list = await http.get(URL.controllersList).pipe(map(r => r.json() as { [id: number]: IController; })).toPromise();

		//for (const id in list) {
		//	const c = list[id];
		//	if (c.created) c.created = new Date(c.created as string);
		//	if (c.modified) c.modified = new Date(c.modified as string);
		//}

		Cfg.controllersList = [];

		for (const key in list) Cfg.controllersList.push(list[key]);

		console.log("Controllers: ", Cfg.controllersList);
	} catch (err) {
		console.error("Cannot load controllers!");
		console.error(err);
	}
}

export const Config = Cfg as {
	lang: string;
	readonly urlRoot: string;
	appRef: ApplicationRef | null;
	iFrame: HTMLIFrameElement | null;
	jumpToPage: (page?: string) => void;
	currentUser: Readonly<ILoggedInUser> | null;
	forceLogin: boolean;
	controllersList: Readonly<IController>[] | null;
	i18n: ITranslationDictionary;
	readonly chartCanvasId: string;
	readonly timeZone: number;
	readonly shiftStep: string;
	readonly defaultDateRange: string;
	currentDateRange: string;
};
