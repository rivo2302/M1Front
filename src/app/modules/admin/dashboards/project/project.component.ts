import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApexOptions } from 'ng-apexcharts';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { FinanceService } from '../finance/finance.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseAlertType } from '@fuse/components/alert';

@Component({
    selector: 'project',
    templateUrl: './project.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ProjectComponent implements OnInit, OnDestroy {
    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    data: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: User;
    employes: any;
    services: any;
    loadingData: boolean = false;
    showDefault: boolean = true;
    serviceForm: FormGroup;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    showAlert: boolean = false;
    redirectURL = {
        Client: "/client/rendez-vous",
        Employee: "/employee/calendrier",
        Manager: "/manager/dashboard"
    };
    configForm: FormGroup;
    isEdit: boolean  = false;
    service: any;

    /**
     * Constructor
     */
    constructor(
        private _projectService: ProjectService,
        private _userService: UserService,
        private _financeService: FinanceService,
        private _router: Router,
        private _formBuilder: FormBuilder,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.serviceForm = this._formBuilder.group({
            name: ["", [Validators.required]],
            price: ["", [Validators.required]],
            processingTime: ["", [Validators.required]],
            commissionPercentage: ["", [Validators.required]]
        });

        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                this.user = user;
                if (!this.checkRole()) {
                    this._router.navigate([this.redirectURL[this.user.role]]);
                }
            });


        // Get the data
        this._projectService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.data = data;

                // Prepare the chart data
                this._prepareChartData();
            });

        this.getEmployes();
        this.getAllServices();

        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    }
                }
            }
        };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    checkRole() {
        return this._router.url.split("/")[1].toLowerCase() === this.user.role.toLowerCase()
    };

    getEmployes() {
        const queryParams = "?role=employee"
        this._financeService.getUsers(queryParams).subscribe((res) => {
            this.employes = res;
            console.log(this.employes);

        });
    }

    getAllServices() {
        this.loadingData = true;
        this._financeService.getAllServices().subscribe((res) => {
            this.services = {
                columns: ["name", "price", "processingTime", "commissionPercentage", "actions"],
                rows: res
            };
        });
        this.loadingData = false;
    }

    navigateToProfile(userId: string): void {
        this._router.navigate(['employee/profil'], { queryParams: { userId: userId } });
    }

    cancel(): void {
        this.showDefault = true;
        this.serviceForm.reset();
        this.showAlert = false;
        this.isEdit = false;
        this.getAllServices();
    }

    createService(): void {
        if (this.serviceForm.invalid) {
            return;
        }

        this.serviceForm.disable();
        this.showAlert = false;

        this._projectService.createService(this.serviceForm.value).subscribe(() => {
            window.scroll(0, 0);
            this.alert = {
                type: 'success',
                message: 'Service créé avec succès'
            };
            this.showAlert = true;
            this.serviceForm.enable();
            this.serviceForm.reset();
        }, () => {
            window.scroll(0, 0);
            this.serviceForm.enable();
            this.alert = {
                type: 'error',
                message: 'Impossible de créer le service'
            };
            this.showAlert = true;
        });
    }

    updateService(): void {
        if (this.serviceForm.invalid) {
            return;
        }

        this.serviceForm.disable();
        this.showAlert = false;

        this._projectService.updateService(this.service._id, this.serviceForm.value).subscribe(() => {
            window.scroll(0, 0);
            this.alert = {
                type: 'success',
                message: 'Service mis à jour avec succès'
            };
            this.showAlert = true;
            this.serviceForm.enable();
            this.serviceForm.reset();
        }, () => {
            window.scroll(0, 0);
            this.serviceForm.enable();
            this.alert = {
                type: 'error',
                message: 'Impossible de mettre à jour le service'
            };
            this.showAlert = true;
        });
    }

    setServiceForm(service: any) {
        this.service = service;
        this.serviceForm = this._formBuilder.group({
            name: [service.name, [Validators.required]],
            price: [service.price, [Validators.required]],
            processingTime: [service.processingTime, [Validators.required]],
            commissionPercentage: [service.commissionPercentage, [Validators.required]]
        });
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

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void {
        // Github issues
        this.chartGithubIssues = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#64748B', '#94A3B8'],
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0],
                background: {
                    borderWidth: 0
                }
            },
            grid: {
                borderColor: 'var(--fuse-border)'
            },
            labels: this.data.githubIssues.labels,
            legend: {
                show: false
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%'
                }
            },
            series: this.data.githubIssues.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.75
                    }
                }
            },
            stroke: {
                width: [3, 0]
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            xaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    color: 'var(--fuse-border)'
                },
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                tooltip: {
                    enabled: false
                }
            },
            yaxis: {
                labels: {
                    offsetX: -16,
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                }
            }
        };

        // Task distribution
        this.chartTaskDistribution = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'polarArea',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            labels: this.data.taskDistribution.labels,
            legend: {
                position: 'bottom'
            },
            plotOptions: {
                polarArea: {
                    spokes: {
                        connectorColors: 'var(--fuse-border)'
                    },
                    rings: {
                        strokeColor: 'var(--fuse-border)'
                    }
                }
            },
            series: this.data.taskDistribution.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.75
                    }
                }
            },
            stroke: {
                width: 2
            },
            theme: {
                monochrome: {
                    enabled: true,
                    color: '#93C5FD',
                    shadeIntensity: 0.75,
                    shadeTo: 'dark'
                }
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            yaxis: {
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                }
            }
        };

        // Budget distribution
        this.chartBudgetDistribution = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'radar',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#818CF8'],
            dataLabels: {
                enabled: true,
                formatter: (val: number): string | number => `${val}%`,
                textAnchor: 'start',
                style: {
                    fontSize: '13px',
                    fontWeight: 500
                },
                background: {
                    borderWidth: 0,
                    padding: 4
                },
                offsetY: -15
            },
            markers: {
                strokeColors: '#818CF8',
                strokeWidth: 4
            },
            plotOptions: {
                radar: {
                    polygons: {
                        strokeColors: 'var(--fuse-border)',
                        connectorColors: 'var(--fuse-border)'
                    }
                }
            },
            series: this.data.budgetDistribution.series,
            stroke: {
                width: 2
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: (val: number): string => `${val}%`
                }
            },
            xaxis: {
                labels: {
                    show: true,
                    style: {
                        fontSize: '12px',
                        fontWeight: '500'
                    }
                },
                categories: this.data.budgetDistribution.categories
            },
            yaxis: {
                max: (max: number): number => parseInt((max + 10).toFixed(0), 10),
                tickAmount: 7
            }
        };
    }
}
