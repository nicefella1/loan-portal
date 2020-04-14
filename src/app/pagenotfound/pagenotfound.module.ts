import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagenotfoundRoutingModule } from './pagenotfound-routing.module';
import { PagenotfoundComponent } from './pagenotfound.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [PagenotfoundComponent],
  imports: [
    CommonModule,
    SharedModule,
    PagenotfoundRoutingModule
  ]
})
export class PagenotfoundModule { }
