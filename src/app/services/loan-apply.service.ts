import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanApplyService {
  modulePath = 'loans';
  loanOfferCache = new BehaviorSubject<any>( JSON.parse(sessionStorage.getItem('loanDetails')) || null);
  constructor(private http: HttpClient) { }

  calcRepayment(amount, tenor) {
    return this.http.post(`${environment.loanUrl}calculate-repayment`, { amount, tenor });
  }

  loanApply(loandetails) {
    return this.http.post(`${environment.loanV2Url}${this.modulePath}/new/apply/new`, loandetails);
  }

  checkForOpenLoans(loandetails) {
    return this.http.post(`${environment.loanV2Url}${this.modulePath}/new/loandisk`, loandetails);
  }
  automateOffer(id) {
    return this.http.post(`${environment.loanV2Url}${this.modulePath}/new/process/details`, { id });
  }

  calculaterepayment(params) {
    // const body = JSON.stringify(params);
    return this.http.post(`${environment.loanV2Url}${this.modulePath}/new/offer/details`, params);
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

  confirmCreditCode(id, code) {
    // return this.http.post(`${environment.loanUrl}confirm/code`, { id, code });
    return this.http.post(`${environment.loanV2Url}${this.modulePath}/new/confirm/code`, { id, code });
  }

  confirmLoanAutoOffer(loan) {
    // return this.http.post(`${environment.loanUrl}loan/transaction/complete`, loan)
    return this.http.post(`${environment.loanV2Url}${this.modulePath}/new/submit`, loan);
  }

  verifyOnPaystack(id) {
    // return this.http.post(`${environment.loanUrl}confirm/code`, { id, code });
    return this.http.post(`${environment.loanV2Url}${this.modulePath}/new/paystack`, { id });
  }
}
