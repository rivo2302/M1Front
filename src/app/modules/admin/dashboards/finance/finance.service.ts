import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FinanceService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    public _baseUrl: string = environment.apiUrl;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(): Observable<any> {
        return this._httpClient.get('api/dashboards/finance').pipe(
            tap((response: any) => {
                this._data.next(response);
            })
        );
    }

    getAllServices(): Observable<any> {
        return this._httpClient.get(`${this._baseUrl}/service`);
    }

    getUsers(queryParams: string): Observable<any> {
        return this._httpClient.get(`${this._baseUrl}/user${queryParams}`);
    }

    getRendezVous(queryParams: string): Observable<any> {
        return this._httpClient.get(`${this._baseUrl}/appointment${queryParams}`);
    }

    createRendezVous(data: any): Observable<any> {
        return this._httpClient.post(`${this._baseUrl}/appointment`, data);
    }
}
