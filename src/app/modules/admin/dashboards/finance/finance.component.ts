import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApexOptions } from 'ng-apexcharts';
import { FinanceService } from 'app/modules/admin/dashboards/finance/finance.service';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector       : 'finance',
    templateUrl    : './finance.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinanceComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild('recentTransactionsTable', {read: MatSort}) recentTransactionsTableMatSort: MatSort;

    data: any;
    accountBalanceOptions: ApexOptions;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['transactionId', 'date', 'name', 'amount', 'status'];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: User;
    /**
     * Constructor
     */

    constructor(
        private _financeService: FinanceService,
        private _userService: UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

        // Subscribe to the user service
        this._userService.user$
        .pipe((takeUntil(this._unsubscribeAll)))
        .subscribe((user: User) => {
            this.user = user;
        });

        // Get the data
        this._financeService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.data = data;

                // Store the table data
                this.recentTransactionsDataSource.data = data.recentTransactions;

                // Prepare the chart data
                this._prepareChartData();
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        // Make the data source sortable
        this.recentTransactionsDataSource.sort = this.recentTransactionsTableMatSort;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
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
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void
    {
        // Account balance
        this.accountBalanceOptions = {
            chart  : {
                animations: {
                    speed           : 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                width     : '100%',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#A3BFFA', '#667EEA'],
            fill   : {
                colors : ['#CED9FB', '#AECDFD'],
                opacity: 0.5,
                type   : 'solid'
            },
            series : this.data.accountBalance.series,
            stroke : {
                curve: 'straight',
                width: 2
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark',
                x           : {
                    format: 'MMM dd, yyyy'
                },
                y           : {
                    formatter: (value): string => value + '%'
                }
            },
            xaxis  : {
                type: 'datetime'
            }
        };
    }
}
