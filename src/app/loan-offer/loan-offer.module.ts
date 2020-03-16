import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoanOfferRoutingModule } from './loan-offer-routing.module';
import { LoanOfferComponent } from './loan-offer.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [LoanOfferComponent],
  imports: [
    CommonModule,
    SharedModule,
    LoanOfferRoutingModule
  ]
})
export class LoanOfferModule { }
