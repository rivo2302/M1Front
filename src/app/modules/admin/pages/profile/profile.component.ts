import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseAlertType } from '@fuse/components/alert';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: User;

    profileForm: FormGroup;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    showAlert: boolean = false;
    loadingData: boolean = false;
    horaireList: string[] = [
        "De 7h à 16h",
        "De 8h à 17h",
        "De 9h à 18h",
        "De 10h à 19h"
    ];
    userId: any;

    /**
     * Constructor
     */
    constructor(
        private _userService: UserService,
        private _formBuilder: FormBuilder,
        private _route: ActivatedRoute,
        private _router: Router
    ) {
    }


    ngOnInit(): void {
        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                this.user = user;
            });

        // Create the form
        this.profileForm = this._formBuilder.group({
            lastName: ["", []],
            firstName: [""],
            email: ["", [Validators.email]],
            workSchedule: [""]
        });

        this._route.queryParams.pipe(
            switchMap(async (params: any) => {
                this.userId = params['userId'];
                if (['Manager', 'Employee'].includes(this.user.role)) {
                    this.user = await this.getUserById(this.userId || localStorage.getItem("userId"));
                    // Update the form
                    this.profileForm = this._formBuilder.group({
                        lastName: [this.user.lastName, []],
                        firstName: [this.user.firstName],
                        email: [this.user.email, [Validators.email]],
                        workSchedule: [this.user.workSchedule]
                    });
                } else {
                    this._router.navigate(["/client/rendez-vous"]);
                }
            })
        ).subscribe();
    }

    async getUserById(userId: string) {
        return await this._userService.getOneUSer(userId);
    }

    updateProfile(): void {
        if (this.profileForm.invalid) {
            return;
        }

        this.profileForm.disable();
        this.showAlert = false;

        this._userService.updateProfile(this.user._id, this.removeEmptyKeys(this.profileForm.value)).subscribe(() => {
            window.scroll(0, 0);
            this.alert = {
                type: 'success',
                message: 'Le profil à été mis à jour'
            };
            this.showAlert = true;
            this.profileForm.enable();
        }, () => {
            window.scroll(0, 0);
            this.profileForm.enable();
            this.alert = {
                type: 'error',
                message: 'Impossible de mettre à jour votre profil'
            };
            this.showAlert = true;
        });
    }

    cancel(): void {
        this.showAlert = false;
    }

    removeEmptyKeys(obj: any) {
        const newObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && (obj[key] !== "" && obj[key] !== null)) {
                newObj[key] = obj[key];
            }
        }
        return newObj;
    }
}
