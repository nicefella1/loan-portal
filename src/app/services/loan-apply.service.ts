import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  verifyAccountDetails(bankcode, accountnumber) {
    return this.http.post(`${environment.loanUrl}suggestion/start`, {bankcode, accountnumber});
  }
}
