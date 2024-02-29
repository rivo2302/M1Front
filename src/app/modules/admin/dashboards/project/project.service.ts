import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
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
        return this._httpClient.get('api/dashboards/project').pipe(
            tap((response: any) => {
                this._data.next(response);
            })
        );
    }

    createService(data: any): Observable<any> {
        return this._httpClient.post(`${this._baseUrl}/service`, data);
    }

    updateService(id: string, data: any): Observable<any> {
        return this._httpClient.put(`${this._baseUrl}/service/${id}`, data);
    }

    deleteService(id: string): Observable<any> {
        return this._httpClient.delete(`${this._baseUrl}/service/${id}`);
    }

    getStats(queryParams: string): Observable<any> {
        return this._httpClient.get(`${this._baseUrl}/stat${queryParams}`);
    }

}
