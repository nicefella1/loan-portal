import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { tenors } from '../duration';
import { banks } from '../banks';
import { states } from '../states';
import { LoanApplyService } from '../services/loan-apply.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Observable, Observer } from 'rxjs';


@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrls: ['./apply.component.scss']
})
export class ApplyComponent implements OnInit {
  current = 0;
  minDate = new Date('2001-12-31');
  duration = tenors;
  banks = banks;
  direction;
  states = states;
  isLoading: boolean;
  loanBreakdown: any;
  screenHeight: number;
  screenWidth: number;
  fullApplicationDetails: any;
  amount: any;
  startForm: FormGroup;
  personalForm: FormGroup;
  contactForm: FormGroup;
  workForm: FormGroup;
  DECIMAL_SEPARATOR = '.';
  GROUP_SEPARATOR = ',';
  applicationSuccess: boolean;

  constructor(private fb: FormBuilder, private service: LoanApplyService,
              private message: NzMessageService, private loadingBar: LoadingBarService) {
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
    this.current = 2;
    this.startForm = this.fb.group({
      amount: [this.amount, [this.confirmValidator]],
      tenor: [null, [Validators.required]],
    });

    this.personalForm = this.fb.group({
      firstname: [null, [Validators.required]],
      lastname: [null, [Validators.required]],
      dob: [null, [Validators.required]],
      gender: [null, [Validators.required]],
      title: [null, [Validators.required]],
    });

    this.contactForm = this.fb.group({
      email: [null, [Validators.email, Validators.required]],
      telephone: [null, [Validators.required]],
      house_address: [null, [Validators.required]],
      city: [null, [Validators.required]],
      state: [null, [Validators.required]],
    });

    this.workForm = this.fb.group({
      place_of_work: [null, [Validators.required]],
      ippisnumber: [null, [Validators.required]],
      salary_bank_name: [null, [Validators.required]],
      salary_bank_account: [null, [this.confirmAcctNumLengthValidator]],
    });
  }

  disabledDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.minDate) > 0;
  }

  pre(): void {
    this.current -= 1;
  }

  next(): void {
    if (this.current === 0) {
      this.submitForm();
      if (this.startForm.invalid) {
        return;
      }
      this.calculateRepaymentForm();
    } else if (this.current === 2) {
      this.submitPersonalForm();
      if (this.personalForm.invalid) {
        return;
      }
      this.collectPersonalInfo();
      this.current += 1;
    } else if (this.current === 3) {
      this.submitContactForm();
      if (this.contactForm.invalid) {
        return;
      }
      this.collectContactlInfo();
      this.current += 1;
    } else if (this.current === 4) {
      console.log(this.workForm.get('salary_bank_account').value);
      this.submitWorkForm();
      if (this.workForm.invalid) {
        return;
      }
      this.collectEmploymentlInfo();
      this.current += 1;
    } else {
      this.current += 1;
    }
  }

  calculateRepaymentForm() {
    const amount = this.unFormat(this.startForm.get('amount').value);
    const tenor = this.startForm.get('tenor').value;
    this.isLoading = true;
    this.loadingBar.start();
    this.service.calcRepayment(amount, tenor).subscribe((data: any) => {
      this.isLoading = false;
      this.loadingBar.complete();
      console.log(data);
      if (data.status === 'success') {
        this.loanBreakdown = { ...data, loan_amount: amount, loanTenor: tenor };
        console.log(this.loanBreakdown);
        this.current += 1;
      } else {
        this.message.error(data.message);
      }
    }, error => {
      this.loadingBar.complete();
      this.isLoading = false;
      this.message.error('Error connecting. Please try again');
    });
  }
  done(): void {
    const { firstname, lastname, gender,
      title, email,
      telephone, house_address, city, state, place_of_work,
      ippisnumber, salary_bank_account, salary_bank_name, loan_amount } = this.fullApplicationDetails;
    const loan = {
      firstname, lastname, gender,
      title, email,
      telephone, house_address, city, state, place_of_work,
      ippisnumber, salary_bank_account, salary_bank_name, loan_amount,
      monthly_repayment: this.fullApplicationDetails.monthlyrepayment,
      tenor: this.fullApplicationDetails.loanTenor,
      dob: this.fullApplicationDetails.dob.toDateString()
    };
    this.isLoading = true;
    this.loadingBar.start();
    this.service.loanApply(loan).subscribe((data: any) => {
      this.isLoading = false;
      this.loadingBar.complete();
      if (data.status === 'success') {
        this.applicationSuccess = true;
        this.message.success(data.message);
      } else {
        this.message.error(data.message);
      }
    }, error => {
      this.isLoading = false;
      this.loadingBar.complete();
      this.message.error('Error connecting. Please try again');
    });
  }

  getBankName(value) {
    const foundbank = banks.find(bank => bank.bankcode === value);
    return foundbank.name;
  }
  collectPersonalInfo() {
    // console.log(this.personalForm.value);
    this.fullApplicationDetails = { ...this.fullApplicationDetails, ...this.personalForm.value };
  }
  collectContactlInfo() {
    // console.log(this.contactForm.value);
    this.fullApplicationDetails = { ...this.fullApplicationDetails, ...this.contactForm.value };
  }

  invalidAcctAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const value = control.value.toString();
      if (!value) {
        observer.next({ error: true, required: true });
      } else if (value.length === 10) {
        const bankcode = this.workForm.get('salary_bank_name').value;
        const accountnumber = this.workForm.get('salary_bank_account').value;
        this.service.verifyAccountDetails(bankcode, accountnumber).subscribe((data: any) => {
          console.log(data);
          if (data.status === 'success') {
            observer.next(null);
          } else {
            this.message.error(data.message)
            observer.next({ error: true, invalid: true });
          }
          observer.complete();
        });
      }
    })


  collectEmploymentlInfo() {
    this.fullApplicationDetails = { ...this.fullApplicationDetails, ...this.workForm.value, ...this.loanBreakdown };
    console.log(this.fullApplicationDetails);
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
    for (const i in this.startForm.controls) {
      this.startForm.controls[i].markAsDirty();
      this.startForm.controls[i].updateValueAndValidity();
    }
  }

  submitPersonalForm(): void {
    // tslint:disable-next-line
    for (const i in this.personalForm.controls) {
      this.personalForm.controls[i].markAsDirty();
      this.personalForm.controls[i].updateValueAndValidity();
    }
  }
  submitContactForm(): void {
    // tslint:disable-next-line
    for (const i in this.contactForm.controls) {
      this.contactForm.controls[i].markAsDirty();
      this.contactForm.controls[i].updateValueAndValidity();
    }
  }
  submitWorkForm(): void {
    // tslint:disable-next-line
    for (const i in this.workForm.controls) {
      this.workForm.controls[i].markAsDirty();
      this.workForm.controls[i].updateValueAndValidity();
    }
  }

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
    this.startForm.patchValue({ amount: inputvalue });
  }
  onChange(result: Date): void {
    console.log('onChange: ', result);
  }

}
