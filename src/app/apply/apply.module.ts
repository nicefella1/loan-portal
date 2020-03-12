import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApplyRoutingModule } from './apply-routing.module';
import { ApplyComponent } from './apply.component';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageModule } from 'ng-zorro-antd/message';


@NgModule({
  declarations: [ApplyComponent],
  imports: [
    NzStepsModule,
    NzLayoutModule,
    NzIconModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzGridModule,
    NzMessageModule,
    NzAlertModule,
    NzCardModule,
    NzTableModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ApplyRoutingModule
  ]
})
export class ApplyModule { }
