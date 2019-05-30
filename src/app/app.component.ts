﻿import { Component, Input, Output, enableProdMode, ApplicationRef } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Config, URL, Charts, reloadControllersList } from "./config";
import { switchLanguage } from "./app.languages";
import { AppRoutes } from "./app.routes";

import * as am4core from "@amcharts/amcharts4/core";
import AnimatedChartTheme from "@amcharts/amcharts4/themes/animated";
import MaterialChartTheme from "@amcharts/amcharts4/themes/material";

enableProdMode();

// am4core.options.autoSetClassName = true;
am4core.options.classNamePrefix = Charts.cssPrefix;

am4core.useTheme(AnimatedChartTheme);
am4core.useTheme(MaterialChartTheme);

@Component({
	selector: "ichen-analytics",
	template: `
		<header>
			<div class="container">
				<a href="/"><img id="logo-ichen" src="images/common/ichen_40_logo_small.png" /></a>
				<a id="logo-ch" href="https://chenhsong.com"><img src="images/common/header_logo_dark.png" /><img class="d-none d-sm-inline" src="images/common/{{i18n.ch_logo}}.png" /></a>
				<span class="d-none d-md-inline">{{i18n.app_title_full}}</span>
				<span class="d-md-none">{{i18n.app_title_short}}</span>
			</div>
		</header>

		<div class="container" style="margin-top:2px">
			<div id="languages" class="float-right">
				<a [class.active]="currentLang=='en'" (click)="switchLanguage('en')"><img src="images/common/lang_en.png" /></a>
				<a [class.active]="currentLang=='zh-tw'" (click)="switchLanguage('zh-tw')"><img src="images/common/lang_zh-tw.png" /></a>
				<a [class.active]="currentLang=='zh-cn'" (click)="switchLanguage('zh-cn')"><img src="images/common/lang_zh-cn.png" /></a>
			</div>
		</div>

		<div class="ichen-nav-shrink d-lg-none float-sm-right float-xs-left">
			<div class="btn-group">
				<a *ngFor="let link of routes" routerLink="/{{link.path}}" [ngClass]="isRouteActive(link.path) ? 'btn-primary active' : 'btn-'+(link.background||'secondary')" class="btn btn-lg" title="{{i18n[link.name]}}">
					<span class="glyphicon glyphicon-{{link.icon}}"></span>
				</a>
			</div>
		</div>

		<div class="clearfix"></div>

		<div class="container">
			<div class="row">
				<div class="ichen-nav d-none d-lg-block col-lg-2 col-xl-3">
					<div class="btn-group-vertical">
						<a *ngFor="let link of routes" routerLink="/{{link.path}}" [ngClass]="isRouteActive(link.path) ? 'btn-primary active' : 'btn-'+(link.background||'secondary')" class="btn btn-lg">
							<span class="glyphicon glyphicon-{{link.icon}}"></span>&nbsp;&nbsp;{{i18n[link.name]}}
						</a>
					</div>
				</div>

				<div class="ichen-content col-lg-10 col-xl-9">
					<router-outlet></router-outlet>
				</div>
			</div>
		</div>

		<iframe id="downloadIFrame" [hidden]="true"></iframe>
	`
})
export class AppComponent
{
	public get i18n() { return Config.i18n; }
	public get currentLang() { return Config.lang; }
	public readonly routes = AppRoutes.filter(r => !r.hidden);

	constructor(private location: Location, private router: Router, private http: HttpClient, private app: ApplicationRef)
	{
		Config.jumpToPage = this.jumpToPage.bind(this);
		Config.appRef = app;

		this.loadAsync();
	}

	private jumpToPage(page = URL.loginRoute)
	{
		return this.router.navigate(AppRoutes.filter(r => r.name === page).map(r => "/" + r.path));
	}

	public isRouteActive(path: string)
	{
		const loc = this.location.path();
		const n = loc.lastIndexOf(path);
		return (n >= 0) && (path.length + n >= loc.length);
	}

	public switchLanguage(lang: string)
	{
		if (Config.lang !== lang) switchLanguage(lang);
	}

	private async loadAsync(): Promise<void>
	{
		try {
			// Get current logged-in user
			const user = await this.http.get<ILoggedInUser>(URL.currentUser).toPromise();

			Config.currentUser = user;

			console.log("Current user: ", user);

			await reloadControllersList(this.http);
		} catch (err) {
			console.error(err);

			switch (err.status) {
				case 401: console.error("Not logged in. Redirecting to login page..."); break;
				default: console.error("Cannot load current user!"); break;
			}
			Config.forceLogin = true;
			Config.currentUser = null;
			Config.controllersList = null;
			Config.jumpToPage();
		}
	}
}
