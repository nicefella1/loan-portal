import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./apply/apply.module').then(m => m.ApplyModule)
  },
  {
    path: 'offerletter/:id',
    loadChildren: () => import('./loan-offer/loan-offer.module').then(m => m.LoanOfferModule)
  }
];

export const routing = RouterModule.forRoot(routes, {useHash: true}); 
