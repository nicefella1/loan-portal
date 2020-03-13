import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  getAuthToken() {
    return sessionStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getAuthToken();
  }

  logOut() {
    sessionStorage.removeItem('token');
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
}
