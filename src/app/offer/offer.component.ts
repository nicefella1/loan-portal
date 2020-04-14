import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidationErrors } from '@angular/forms';
import { LoanApplyService } from '../services/loan-apply.service';
import { NzMessageService } from 'ng-zorro-antd';
import { UploadXHRArgs } from 'ng-zorro-antd/upload';
import { LoadingBarService } from '@ngx-loading-bar/core';
import * as differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
import { tenors } from '../duration';
import { banks } from '../banks';
import { states } from '../states';
import { Observable, Observer } from 'rxjs';
import { HttpRequest, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Params } from '@angular/router';
import { Options, LabelType } from 'ng5-slider';

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent implements OnInit {
  current = 0;
  uploadUrl = `${environment.loanUrl}passport/upload`;
  minDate = new Date('2001-12-31');
  duration = tenors;
  banks = banks;
  direction;
  states = states;
  isLoading: boolean;
  loanBreakdown: any;
  loanOfferDetails: any;
  screenHeight: number;
  screenWidth: number;
  fullApplicationDetails: any;
  amount: any;
  loanOfferId;
  idCardUploadMessage: string;
  passportUploadMessage: string;
  idCardUploadName: string;
  passportUploadName: string;
  bankAcountForm: FormGroup;
  authorizationForm: FormGroup;
  DECIMAL_SEPARATOR = '.';
  GROUP_SEPARATOR = ',';
  applicationSuccess: boolean;
  loanOfferLoaded: boolean;
  loanamount: number = 0;
  durationValue: any = null;
  options: Options = {
    floor: 20000,
    ceil: this.loanamount,
    step: 10000,
    showSelectionBar: true,
    selectionBarGradient: {
      from: '#f56b2a',
      to: '#f56b2a'
    },
    getPointerColor: (value: number): string => {
      return '#f56b2a';
    },
    translate: (value: number, label: LabelType): string => {
      return '₦' + value;
    }
  };
  actualtenor: number;
  insurance: number;
  disbursementfees: number;
  interest: number;
  monthlyrepayment: number;
  verification: any;
  loans: any;
  salaryhistory: any;
  loanhistory: any;
  loanresult: any;
  automateDetails: boolean;
  constructor(private fb: FormBuilder, private service: LoanApplyService,
              private message: NzMessageService, private loadingBar: LoadingBarService, private route: ActivatedRoute) {
      this.getScreenSize();
     }

    @HostListener('window:resize', ['$event'])
    getScreenSize(event?) {
      this.screenHeight = window.innerHeight;
      this.screenWidth = window.innerWidth;
      if (this.screenWidth < 768) {
        this.direction = 'vertical';
      } else {
        this.direction = 'horizontal';
      }
    }
    ngOnInit(): void {
      this.route.params.subscribe((param: Params) => {
        this.loanOfferId = param.id;
      });
      this.viewLoanOffer();

      this.bankAcountForm = this.fb.group({
        bankname: [null, [Validators.required]],
        accountnumber: [null, [this.confirmAcctNumLengthValidator]],
      });
  
      this.authorizationForm = this.fb.group({
        email: [{value: null, disabled: true}],
        code: [null, [Validators.required]]
      });
      
    }
  
  viewLoanOffer() {
    this.loadingBar.start();
    this.service.loanOfferCache.subscribe((data: any) => {
      this.loanOfferLoaded = true;
      this.loadingBar.complete();
      if (data) {
        console.log(data);
        this.loans = data;
        this.salaryhistory = data.salaryhistory;
        this.loanhistory = data.loanhistory;
        this.verification = data.verification;
        window.localStorage.setItem('emailaddress', this.loans.loan.email);
        window.localStorage.setItem('firstname', this.loans.loan.firstname);
        window.localStorage.setItem('lastname', this.loans.loan.lastname);
        this.loanamount = data.loanamount;
        this.durationValue = data.duration;
        this.loanresult = data.loanresult;
        this.actualtenor = this.loanresult.actualtenor;
        const newOptions = Object.assign({}, this.options);
        newOptions.ceil = data.loanamount;
        this.options = newOptions;
        this.setLoanRepayment();
      } else {
        this.message.error('No loan offer found');
      }
    }, err => {
      this.loadingBar.complete();
      this.message.error('Error connecting to server. Please try again');
    });
  }
  
    pre(): void {
      this.current -= 1;
    }

    next(): void {
      if (this.current === 0) {
        const data = {
          loanId: this.loanOfferId,
          loanAmount: this.loanamount,
          duration: this.durationValue,
        };
        sessionStorage.setItem('loanData', JSON.stringify(data));
        console.log(sessionStorage.getItem('loanData'));
        this.current += 1;
      } else if (this.current === 1) {
        this.submitForm();
        // this.submitIdCardForm();
        if (this.bankAcountForm.invalid) {
          return;
        }
        this.verifyBankAccount();
      } else if (this.current === 2) {
        this.collectIdCard();
        this.current += 1;
      } else if (this.current === 3) {
        this.collectIdCard();
        this.current += 1;
      } else {
        this.current += 1;
      }
    }
    done(): void {
      const loan = {
        id: this.loanOfferId,
        loan_amount: this.loanamount,
        monthly_repayment: this.monthlyrepayment,
        duration: this.durationValue,
        idcard: this.idCardUploadMessage ? this.idCardUploadMessage : '',
        passport: this.passportUploadMessage ? this.passportUploadMessage : ''
      };
      console.log(loan);
      this.isLoading = true;
      this.loadingBar.start();
      this.service.confirmLoanOffer(loan).subscribe((data: any) => {
        console.log(data);
        this.isLoading = false;
        this.loadingBar.complete();
        if (data.status === 'success') {
          this.applicationSuccess = true;
          this.message.success(data.message);
        } else {
          this.message.error(data.message);
        }
      }, error => {
        console.log(error)
        this.isLoading = false;
        this.loadingBar.complete();
        this.message.error('Error connecting. Please try again');
      });
    }

    setLoanRepayment() {
      const interestperday = 0.0025 * this.actualtenor;
      this.insurance = 0.03 * this.loanamount;
      this.disbursementfees = 1250;
      this.interest = interestperday * this.loanamount;
      this.monthlyrepayment = (this.interest + this.loanamount + this.insurance + this.disbursementfees) / this.durationValue;
    }
    changeduration(value) {
      console.log(value);
      if (value) {
      if (confirm('Are you sure you want to change the duration')) {
         this.durationValue = value;
         this.setDuration(this.durationValue);
       }
     }
    }

    setDuration(duration) {
      const json = {
        tenor: duration,
        amount: this.loanamount
      };
      this.loadingBar.start();
      this.service.calculaterepayment(json)
        .subscribe((data: any) => {
          this.loadingBar.stop();
          console.log(data);
          if (data.status === 'success') {
            this.actualtenor = data.actualtenor;
            this.monthlyrepayment = data.monthlyrepayment;
          } else {
            this.message.error(data.message);
          }
        },
          (error) => {
            this.loadingBar.stop();
            console.log(error);
            this.message.error('Network error. Please try again');
          }
        );
    }
    verifyBankAccount() {
      const bankname = this.bankAcountForm.get('bankname').value;
      const accountnumber = this.bankAcountForm.get('accountnumber').value;
      this.isLoading = true;
      this.loadingBar.start();
      this.service.verifyAccountBVNDetails(this.loanOfferId, bankname, accountnumber).subscribe((data: any) => {
        console.log(data);
        this.isLoading = false;
        this.loadingBar.complete();
        if (data.status === 'success') {
          this.process();
        } else {
          this.message.error(data.message);
        }
      }, err => {
        this.isLoading = false;
        this.loadingBar.complete();
        this.message.error('Error connecting to server. Please try again later');
      });
    }
  
    process() {
      const accountData = {
        id: this.loanOfferId,
        bankname: this.bankAcountForm.get('bankname').value,
        accountnumber: this.bankAcountForm.get('accountnumber').value
      };
      this.isLoading = true;
      this.loadingBar.start();
      this.service.addAccount(accountData).subscribe((data: any) => {
        this.isLoading = false;
        this.loadingBar.complete();
        if (data.status === 'success') {
          this.current += 1;
        } else {
          this.message.error(data.message);
        }
      }, err => {
        this.isLoading = false;
        this.loadingBar.complete();
        this.message.error('Error connecting to server. Please try again later');
      });
    }
    customReq = (item: UploadXHRArgs) => {
      // Create a FormData here to store files and other parameters.
      const formData = new FormData();
      // tslint:disable-next-line:no-any
      formData.append('file[]', item.file as any, item.file.name as any);
      // tslint:disable-next-line: no-non-null-assertion
      const req = new HttpRequest('POST', item.action!, formData, {
        reportProgress: true,
      });
      this.loadingBar.start();
      this.isLoading = true;
      return this.service.uploadFile(req).subscribe(
        // tslint:disable-next-line no-any
        (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            // tslint:disable-next-line: no-non-null-assertion
            if (event.total! > 0) {
              // tslint:disable-next-line: no-non-null-assertion
              (event as any).percent = (event.loaded / event.total!) * 100;
            }
            // tslint:disable-next-line: no-non-null-assertion
            item.onProgress!(event, item.file!);
          } else if (event instanceof HttpResponse) {
            this.loadingBar.complete();
            this.isLoading = false;
            // tslint:disable-next-line: no-non-null-assertion
            item.onSuccess!(event.body, item.file!, event);
            if (event.body.status === 'success') {
              console.log(event.url, event.body);
              if (this.current === 2) {
              this.idCardUploadName = item.file.name;
              this.idCardUploadMessage = event.body.message;
              this.message.success('Successfully uploaded');
             } else {
              this.passportUploadName = item.file.name;
              this.passportUploadMessage = event.body.message;
              this.message.success('Successfully uploaded');
             }
            } else {
              this.message.success('Error conencting to the server. Please try again later');
              this.message.error(event.body.message);
            }
          }
        },
        err => {
          this.loadingBar.complete();
          this.isLoading = false;
          // tslint:disable-next-line: no-non-null-assertion
          item.onError!(err, item.file!);
        }
      );
    }
    getBankName(value) {
      const foundbank = banks.find(bank => bank.bankcode === value);
      return foundbank.name;
    }
    collectIdCard() {
      this.fullApplicationDetails = { ...this.fullApplicationDetails, };
    }
    // authorizeRequest() {
    //   this.fullApplicationDetails = { ...this.fullApplicationDetails, ...this.authorizationForm.value };
    //   const code = this.authorizationForm.get('code').value;
    //   this.loadingBar.start();
    //   this.isLoading = true;
    //   this.service.authorizeLoanReq(this.loanOfferId, code).subscribe((data: any) => {
    //     this.loadingBar.complete();
    //     this.isLoading = false;
    //     if (data.status === 'success') {
    //       this.current += 1;
    //     } else {
    //       this.message.error(data.message);
    //     }
    //   }, err => {
    //     this.loadingBar.complete();
    //     this.isLoading = false;
    //     this.message.error('Error connecting to server. Please try again');
    //   });
    // }
  
    invalidAcctAsyncValidator = (control: FormControl) =>
      new Observable((observer: Observer<ValidationErrors | null>) => {
        const value = control.value.toString();
        if (!value) {
          observer.next({ error: true, required: true });
        } else if (value.length === 10) {
          const bankcode = this.bankAcountForm.get('bankname').value;
          const accountnumber = this.bankAcountForm.get('accountnumber').value;
          this.service.verifyAccountDetails(bankcode, accountnumber).subscribe((data: any) => {
            if (data.status === 'success') {
              observer.next(null);
            } else {
              this.message.error(data.message);
              observer.next({ error: true, invalid: true });
            }
            observer.complete();
          });
        }
      })
  
  
    collectEmploymentlInfo() {
      this.fullApplicationDetails = { ...this.fullApplicationDetails, ...this.bankAcountForm.value, ...this.loanBreakdown };
    }
  
    format(valString) {
      if (!valString) {
        return '';
      }
      const val = valString.toString();
      const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
      return parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, this.GROUP_SEPARATOR) + (!parts[1] ? '' : this.DECIMAL_SEPARATOR + parts[1]);
    }
  
  
    unFormat(val) {
      if (!val) {
        return '';
      }
      val = val.replace(/^0+/, '');
  
      if (this.GROUP_SEPARATOR === ',') {
        return val.replace(/,/g, '');
      } else {
        return val.replace(/\./g, '');
      }
    }
  
    submitForm(): void {
      // tslint:disable-next-line
      for (const i in this.bankAcountForm.controls) {
        this.bankAcountForm.controls[i].markAsDirty();
        this.bankAcountForm.controls[i].updateValueAndValidity();
      }
    }
    submitAuthorizationForm(): void {
      // tslint:disable-next-line
      for (const i in this.authorizationForm.controls) {
        this.authorizationForm.controls[i].markAsDirty();
        this.authorizationForm.controls[i].updateValueAndValidity();
      }
    }
    // submitWorkForm(): void {
    //   // tslint:disable-next-line
    //   for (const i in this.bankAcountForm.controls) {
    //     this.bankAcountForm.controls[i].markAsDirty();
    //     this.bankAcountForm.controls[i].updateValueAndValidity();
    //   }
    // }
  
    confirmValidator = (control: FormControl): { [s: string]: boolean } => {
      const val = this.unFormat(control.value);
      if (!control.value) {
        return { error: true, required: true };
      } else if (isNaN(val)) {
        return { amount: true, error: true };
      } else if (val < 30000) {
        return { minAmt: true, error: true };
      } else if (val > 1000000) {
        return { maxAmt: true, error: true };
      }
      return {};
    }
  
    confirmAcctNumLengthValidator = (control: FormControl): { [s: string]: boolean } => {
      if (!control.value) {
        return { error: true, required: true };
      } else if (isNaN(control.value)) {
        return { invalid: true, error: true };
      } else {
        if (control.value.length < 10) {
          return { minlen: true, error: true };
        } else if (control.value.length > 10) {
          return { maxlen: true, error: true };
        }
      }
      return {};
    }
  
    changeNum(e) {
      const val = e.target.value;
      const inputvalue = this.format(e.target.value);
      this.bankAcountForm.patchValue({ amount: inputvalue });
    }

}
