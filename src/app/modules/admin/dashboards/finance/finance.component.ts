import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { FinanceService } from 'app/modules/admin/dashboards/finance/finance.service';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseAlertType } from '@fuse/components/alert';

@Component({
    selector: 'finance',
    templateUrl: './finance.component.html',
    encapsulation: ViewEncapsulation.None
})
export class FinanceComponent implements OnInit, OnDestroy {
    @ViewChild('rendezVousTable', { read: MatSort }) rendezVousTableSort: MatSort;

    data: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: User;
    services: any[] = [];
    employes: any[] = [];
    rendezVousTableColumns: string[] = ['date_debut', 'date_fin', 'employe', 'statut'];
    rendezVousDataSource: MatTableDataSource<any> = new MatTableDataSource();
    rendezVousList: any[] = [];
    showDefault: boolean = true;
    rendezForm: FormGroup;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    showAlert: boolean = false;
    loadingData: boolean = false;

    /**
     * Constructor
     */

    constructor(
        private _financeService: FinanceService,
        private _userService: UserService,
        private _formBuilder: FormBuilder
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        // Create the form
        this.rendezForm = this._formBuilder.group({
            startDate: ['', [Validators.required]],
            endDate: ['', Validators.required],
            employee: ['', Validators.required],
            requestedServices: [[]],
            client: [localStorage.getItem("userId")],
            status: ['InProgress']
        });

        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                this.user = user;
            });

        // Get the rendez-vous by client
        this.getRendezVousByClientId();
        this.getEmployes();
        this.getAllServices();
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

    getAllServices() {
        this._financeService.getAllServices().subscribe((res) => {
            this.services = res;
        });
    }

    getEmployes() {
        const queryParams = "?role=employee"
        this._financeService.getUsers(queryParams).subscribe((res) => {
            this.employes = res;
        });
    }

    getRendezVousByClientId(): void {
        this.loadingData = true;
        const queryParams = `?client=${localStorage.getItem("userId")}`
        this._financeService.getRendezVous(queryParams).pipe(finalize(() => { this.loadingData = false })).subscribe((data) => {
            this.rendezVousDataSource = data;
            this.rendezVousList = data;
        });
    }

    createRendezVous(): void {
        if (this.rendezForm.invalid) {
            return;
        }

        this.rendezForm.disable();
        this.showAlert = false;
        this._financeService.createRendezVous(this.rendezForm.value).subscribe(() => {
            window.scroll(0, 0);
            this.alert = {
                type: 'success',
                message: 'Rendez-vous créé avec succès'
            };
            this.showAlert = true;
            this.rendezForm.enable();
            this.rendezForm.reset();
        }, () => {
            window.scroll(0, 0);
            this.rendezForm.enable();
            this.alert = {
                type: 'error',
                message: 'Impossible de créer le rendez-vous'
            };
            this.showAlert = true;
        });
    }

    todayDate(): Date {
        return new Date();
    }

    cancel(): void {
        this.showDefault = true;
        this.rendezForm.reset();
        this.showAlert = false;
        this.getRendezVousByClientId();
    }

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
    }

}
