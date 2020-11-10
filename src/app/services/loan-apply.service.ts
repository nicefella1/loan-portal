import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanApplyService {
  modulePath = 'loan';
  loanOfferCache = new BehaviorSubject<any>( JSON.parse(sessionStorage.getItem('loanDetails')) || null);
  constructor(private http: HttpClient) { }

  calcRepayment(amount, tenor) {
    return this.http.post(`${environment.loanUrl}calculate-repayment`, { amount, tenor });
  }

  loanApply(loandetails) {
    return this.http.post(`${environment.loanV2Url}${this.modulePath}/apply/new`, loandetails);
  }

  automateOffer(id) {
    return this.http.post(`${environment.loanUrl}loan/offer/auto`, { id });
  }

  calculaterepayment(params) {
    const body = JSON.stringify(params);
    return this.http.post(`${environment.loanUrl}calculate-repayment`, body);
  }
  viewLoanOffer(id) {
    return this.http.post(`${environment.loanUrl}loan/offer/view`, { id });
  }

  verifyAccountDetails(bankcode, accountnumber) {
    return this.http.post(`${environment.loanUrl}verify/account`, { bankcode, accountnumber });
  }
  verifyAccountBVNDetails(id, bankname, accountnumber) {
    return this.http.post(`${environment.loanUrl}loan/account/add/new`, { id, bankname, accountnumber });
  }
  addAccount(body) {
    return this.http.post(`${environment.loanUrl}loan/account/add`, body);
  }
  uploadFile(req) {
    return this.http.request(req);
  }

  authorizeLoanReq(id, code) {
    return this.http.post(`${environment.loanUrl}confirm/code`, { id, code });
  }

  confirmLoanOffer(loan) {
    return this.http.post(`${environment.loanUrl}loan/finalize/new`, loan);
  }

  confirmLoanAutoOffer(loan) {
    return this.http.post(`${environment.loanUrl}loan/transaction/complete`, loan);
  }
}
