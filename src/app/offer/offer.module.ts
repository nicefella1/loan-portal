import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfferRoutingModule } from './offer-routing.module';
import { OfferComponent } from './offer.component';
import { SharedModule } from '../shared/shared.module';
import { NgOtpInputModule } from 'ng-otp-input';


@NgModule({
  declarations: [OfferComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgOtpInputModule,
    OfferRoutingModule
  ]
})
export class OfferModule { }
