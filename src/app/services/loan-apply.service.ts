import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoanApplyService {

  constructor(private http: HttpClient) { }

  calcRepayment(amount, tenor) {
    return this.http.post(`${environment.loanUrl}calculate-repayment`, {amount, tenor});
  }

  loanApply(loandetails){
    return this.http.post(`${environment.loanUrl}apply`, loandetails);
  }

  viewLoanOffer(id) {
    return this.http.post(`${environment.loanUrl}loan/offer/view`, {id});
  }

  verifyAccountDetails(bankcode, accountnumber) {
    return this.http.post(`${environment.loanUrl}verify/account`, {bankcode, accountnumber});
  }
addAccount(body) {
  return this.http.post(`${environment.loanUrl}loan/account/add`, body);
}
  uploadFile(req) {
    return this.http.request(req);
  }

  authorizeLoanReq(id, code) {
    return this.http.post(`${environment.loanUrl}confirm/code`, {id, code});
  }

  confirmLoanOffer(loan) {
    return this.http.post(`${environment.loanUrl}loan/finalize/new`, loan);
  }
}
