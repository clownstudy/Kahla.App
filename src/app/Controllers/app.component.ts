import { Component, HostListener, OnInit } from '@angular/core';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';
import { ElectronService } from 'ngx-electron';
import { ThemeService } from '../Services/ThemeService';
import { Router } from '@angular/router';
import { HomeService } from '../Services/HomeService';
import { CacheService } from '../Services/CacheService';

@Component({
    selector: 'app-kahla',
    templateUrl: '../Views/app.html',
    styleUrls: ['../Styles/app.scss']
})


export class AppComponent implements OnInit {

    constructor(
        private initService: InitService,
        private themeService: ThemeService,
        public cacheService: CacheService,
        private _electronService: ElectronService,
        public route: Router,
        public homeService: HomeService) {
    }

    @HostListener('window:popstate', [])
    onPopstate() {
        Swal.close();
    }

    @HostListener('window:load', [])
    onLoad() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            if (!this._electronService.isElectronApp) {
                navigator.serviceWorker.register('/sw.js').then(function (registration) {
                    // Registration was successful
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function (err) {
                    // registration failed :(
                    console.error('ServiceWorker registration failed: ', err);
                });
            }

            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    @HostListener('window:beforeinstallprompt', ['$event'])
    onbeforeinstallprompt(e: any) {
        this.homeService.pwaHomeScreenPrompt = e;
    }

    public async ngOnInit(): Promise<void> {
        // Temporary apply the local theme setting
        this.themeService.ApplyThemeFromLocal();
        await this.initService.init();
    }
}
