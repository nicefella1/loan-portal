import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoanOfferComponent } from './loan-offer.component';


const routes: Routes = [
  {
    path: '',
    component: LoanOfferComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoanOfferRoutingModule { }
