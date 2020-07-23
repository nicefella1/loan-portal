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
  },
  {
    path: 'offer/:id',
    loadChildren: () => import('./offer/offer.module').then(m => m.OfferModule)
  },
  {
    path: '**',
    loadChildren: () => import('./pagenotfound/pagenotfound.module').then(m => m.PagenotfoundModule)
  }
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule { }
// export const routing = RouterModule.forRoot(routes, {useHash: true}); 
