import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoanOfferRoutingModule } from './loan-offer-routing.module';
import { LoanOfferComponent } from './loan-offer.component';


@NgModule({
  declarations: [LoanOfferComponent],
  imports: [
    CommonModule,
    LoanOfferRoutingModule
  ]
})
export class LoanOfferModule { }
