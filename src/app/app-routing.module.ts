import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'apply',
    loadChildren: () => import('./apply/apply.module').then(m => m.ApplyModule)
  },
  {
    path: 'offerdetails',
    loadChildren: () => import('./loan-offer/loan-offer.module').then(m => m.LoanOfferModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
