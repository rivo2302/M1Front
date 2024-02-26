import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseCardModule } from '@fuse/components/card';
import { ProfileComponent } from 'app/modules/admin/pages/profile/profile.component';
import { profileRoutes } from 'app/modules/admin/pages/profile/profile.routing';
import { SharedModule } from 'app/shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FuseAlertModule } from '@fuse/components/alert';

@NgModule({
    declarations: [
        ProfileComponent
    ],
    imports     : [
        RouterModule.forChild(profileRoutes),
        MatButtonModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        FuseCardModule,
        SharedModule,
        MatCheckboxModule,
        MatSelectModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
        FuseAlertModule

    ]
})
export class ProfileModule
{
}
