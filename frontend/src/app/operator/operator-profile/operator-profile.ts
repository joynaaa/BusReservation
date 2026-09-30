import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-operator-profile',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './operator-profile.html',
  styleUrl: './operator-profile.css'
})
export class OperatorProfileComponent implements OnInit {

  username = '';
  email = '';

  fullName = '';
  phone = '';
  address = '';

  companyName = '';
  operatorType = '';

  businessPhone = '';
  businessEmail = '';

  city = '';
  state = '';
  pinCode = '';

  numberOfBuses = 0;
  yearsOfExperience = 0;

  role = '';
  status = '';

  loading = true;
  errorMessage = '';


  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.loadProfile();

  }


  // ==========================================
  // LOAD PROFILE
  // ==========================================

  loadProfile(): void {

    const token =
      localStorage.getItem('access');

    this.http.get<any>(
      'http://127.0.0.1:8000/api/auth/profile/',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).subscribe({

      next: (data) => {

        console.log(
          'OPERATOR PROFILE RESPONSE:',
          data
        );

        this.username =
          data.username || '';

        this.email =
          data.email || '';

        this.fullName =
          data.full_name || '';

        this.phone =
          data.phone || '';

        this.address =
          data.address || '';

        this.companyName =
          data.company_name || '';

        this.operatorType =
          data.operator_type || '';

        this.businessPhone =
          data.business_phone || '';

        this.businessEmail =
          data.business_email || '';

        this.city =
          data.city || '';

        this.state =
          data.state || '';

        this.pinCode =
          data.pin_code || '';

        this.numberOfBuses =
          data.number_of_buses || 0;

        this.yearsOfExperience =
          data.years_of_experience || 0;

        this.role =
          data.role || 'OPERATOR';

        this.status =
          data.status || '';

        this.loading = false;

        this.cdr.detectChanges();

      },


      error: (error) => {

        console.error(
          'OPERATOR PROFILE ERROR:',
          error
        );

        this.loading = false;

        if (error.status === 401) {

          this.errorMessage =
            'Your login session has expired. Please login again.';

        }

        else {

          this.errorMessage =
            'Unable to load operator profile.';
        }

        this.cdr.detectChanges();

      }

    });

  }


  // ==========================================
  // BACK
  // ==========================================

  goToDashboard(): void {

    this.router.navigate([
      '/operator/dashboard'
    ]);

  }

}