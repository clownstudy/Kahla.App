import { Component, OnInit } from '@angular/core';
import { AuthApiService } from '../Services/Api/AuthApiService';
import { Router } from '@angular/router';
import { Values } from '../values';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';
import { ElectronService } from 'ngx-electron';
import { CacheService } from '../Services/CacheService';
import { HomeService } from '../Services/HomeService';
import { ProbeService } from '../Services/ProbeService';

@Component({
    selector: 'app-settings',
    templateUrl: '../Views/settings.html',
    styleUrls: ['../Styles/menu.scss',
                '../Styles/reddot.scss',
                '../Styles/button.scss',
                '../Styles/badge.scss']
})
export class SettingsComponent implements OnInit {
    public loadingImgURL = Values.loadingImgURL;
    constructor(
        private authApiService: AuthApiService,
        private router: Router,
        private initSerivce: InitService,
        public cacheService: CacheService,
        private _electronService: ElectronService,
        public homeService: HomeService,
        private probeService: ProbeService,
    ) {
        }

    public async ngOnInit(): Promise<void> {
        if (!this.cacheService.cachedData.me) {
            const me = await this.authApiService.Me();
            if (me.code === 0) {
                this.cacheService.cachedData.me = me.value;
                this.cacheService.cachedData.me.avatarURL = this.probeService.encodeProbeFileUrl(me.value.iconFilePath);
                this.cacheService.saveCache();
            }
        }
    }

    public pwaAddHomeScreen(): void {
        this.homeService.pwaHomeScreenPrompt.prompt();
        this.homeService.pwaHomeScreenPrompt.userChoice
            .then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    this.homeService.pwaHomeScreenSuccess = true;
                }
                this.homeService.pwaHomeScreenPrompt = null;
            });
    }

    public SignOut(): void {
        Swal.fire({
            title: 'Are you sure to sign out?',
            icon: 'warning',
            showCancelButton: true
        }).then((willSignOut) => {
            if (willSignOut.value) {
                let deviceID = localStorage.getItem('deviceID');
                if (deviceID === null) {
                    deviceID = '-1';
                }
                this.callLogOffAPI(Number(deviceID));
                if (!(this._electronService.isElectronApp || !navigator.serviceWorker)) {
                    const _this = this;
                    navigator.serviceWorker.ready.then(function (reg) {
                        return reg.pushManager.getSubscription().then(function (subscription) {
                            if (subscription != null) {
                                subscription.unsubscribe().then().catch(function (e) {
                                    console.log(e);
                                });
                            }
                        });
                    }.bind(_this));
                }
            }
        });
    }

    private callLogOffAPI(deviceID: number): void {
        const _this = this;
        this.authApiService.LogOff(Number(deviceID)).subscribe({
            next() {
                _this.initSerivce.destroy();
                _this.router.navigate(['/signin'], {replaceUrl: true});
            },
            error(e) {
                Swal.fire('Logoff error', e.message, 'error');
            }
        });
    }

    public async sendEmail(): Promise<void> {
        const me = await this.authApiService.Me();
        if (me.code === 0) {
            this.cacheService.cachedData.me.emailConfirmed = me.value.emailConfirmed;
            if (!this.cacheService.cachedData.me.emailConfirmed) {
                Swal.fire({
                    title: 'Please verify your email.',
                    text: 'Please confirm your email as soon as possible! Or you may lose access \
                        to your account in a few days! Without confirming your email, you won\'t receive \
                        any important notifications and cannot reset your password!',
                    icon: 'warning',
                    confirmButtonText: 'Send Email',
                    showCancelButton: true
                }).then((sendEmail) => {
                    if (sendEmail.value && this.cacheService.cachedData.me) {
                        this.authApiService.SendMail(this.cacheService.cachedData.me.email).subscribe((result) => {
                            if (result.code === 0) {
                                Swal.fire({
                                    title: 'Please check your inbox.',
                                    text: 'Email was send to ' + this.cacheService.cachedData.me.email,
                                    icon: 'success'
                                });
                            } else {
                                Swal.fire({
                                    title: 'Error',
                                    text: result.message,
                                    icon: 'error'
                                });
                            }
                        });
                    }
                });
            }
        }
    }
}
