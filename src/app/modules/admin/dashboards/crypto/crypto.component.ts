import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ApexOptions } from 'ng-apexcharts';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { CryptoService } from './crypto.service';
import { FuseAlertType } from '@fuse/components/alert';
import { MatTableDataSource } from '@angular/material/table';
import { FinanceService } from '../finance/finance.service';

@Component({
    selector: 'crypto',
    templateUrl: './crypto.component.html',
    encapsulation: ViewEncapsulation.None
})
export class CryptoComponent implements OnInit, OnDestroy {
    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    data: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: User;
    loadingData: boolean = false;

    rendezVousTableColumns: string[] = ['date_debut', 'date_fin', 'employe', 'statut'];
    rendezVousDataSource: MatTableDataSource<any> = new MatTableDataSource();
    rendezVousList: any[] = [];
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _cryptoService: CryptoService,
        private _financeService: FinanceService,
        private _userService: UserService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                this.user = user;
            });

        this.getRendezVousByEmployeId();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
            });
    }

    getRendezVousByEmployeId(): void {
        this.loadingData = true;
        const queryParams = `?employee=${localStorage.getItem("userId")}`
        this._financeService.getRendezVous(queryParams).pipe(finalize(() => { this.loadingData = false })).subscribe((data) => {
            this.rendezVousDataSource = data;
            this.rendezVousList = data;
        });
    };

    getStatusCountsString(): string {
        const statusCounts: { [key: string]: number } = {};
        this.rendezVousList.forEach((rd: any) => {
            const status = rd.status;
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            } else {
                statusCounts[status] = 1;
            }
        });
        const statusStrings = Object.keys(statusCounts).map(status => `${statusCounts[status]} ${status}`);
        return this.rendezVousList.length != 0 ? statusStrings.join(', ') : "Auncun rendez-vous";
    };

    tasks() {
        return this.rendezVousList.filter(task => task.status === 'InProgress').length;
    }

}
