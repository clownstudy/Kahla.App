import { Injectable } from '@angular/core';
import { ParamService } from '../ParamService';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ServerConfig } from '../../Models/ServerConfig';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    public readonly STORAGE_SERVER_CONFIG = 'serverConfig';
    public serverConfig: ServerConfig;

    private _headers: HttpHeaders =
        new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

    constructor(
        private http: HttpClient,
        private paramTool: ParamService) {
    }

    public Get<T>(address: string): Promise<T> {
        return this.GetByFullUrl<T>(`${this.serverConfig.domain.server}${address}`);
    }

    public GetByFullUrl<T>(address: string, withCredentials = true): Promise<T> {
        return this.http.get<T>(address, {
            headers: this._headers,
            withCredentials: withCredentials
        }).pipe(catchError(this.handleError)).toPromise();
    }

    public Post<T>(address: string, data: any): Promise<T> {
        return this.http.post<T>(`${this.serverConfig.domain.server}${address}`, this.paramTool.param(data), {
            headers: this._headers,
            withCredentials: true
        }).pipe(catchError(this.handleError)).toPromise();
    }

    public handleError(error: any): Promise<any> {
        return Promise.reject(error);
    }
}
