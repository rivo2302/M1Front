import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signInForm: FormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
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
        // Create the form
        this.signInForm = this._formBuilder.group({
            email: ['manager@gmail.com', [Validators.required, Validators.email]],
            password: ['root18', Validators.required]
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        if (this.signInForm.invalid) {
            return;
        }

        this.signInForm.disable();
        this.showAlert = false;

        this._authService.signIn(this.signInForm.value).subscribe((res: any) => {
            const redirectURL = {
                Client: "/client/rendez-vous",
                Employee: "/employee/calendrier",
                Manager: "/manager/dashboard"
            }
            this._router.navigate([redirectURL[res.user.role]]);
        }, () => {
            this.signInForm.enable();
            this.signInNgForm.resetForm();
            this.alert = {
                type: 'error',
                message: 'Wrong email or password'
            };
            this.showAlert = true;
        });
    }
};
