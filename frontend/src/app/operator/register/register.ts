import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class OperatorRegisterComponent {

  operator = {

    // =========================
    // ACCOUNT DETAILS
    // =========================

    username: '',
    email: '',
    phone: '',
    password: '',
    password2: '',


    // =========================
    // OPERATOR DETAILS
    // =========================

    full_name: '',
    company_name: '',
    operator_type: '',
    business_phone: '',
    business_email: '',


    // =========================
    // BUSINESS ADDRESS
    // =========================

    address: '',
    city: '',
    state: '',
    pin_code: '',


    // =========================
    // OPERATOR INFORMATION
    // =========================

    number_of_buses: 1,
    years_of_experience: 0,


    // =========================
    // OPERATOR VERIFICATION DOCUMENTS
    // =========================

    government_id: null as File | null,

    business_registration:
      null as File | null,

    transport_permit:
      null as File | null,


    // =========================
    // AGREEMENT
    // =========================

    information_confirmed: false,

   
  };


  loading = false;

  submitted = false;


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  // =====================================================
  // VALIDATION
  // =====================================================


  validateName(): boolean {

    return /^[A-Za-z ]{3,50}$/.test(
      this.operator.full_name.trim()
    );

  }


  validateCompany(): boolean {

    return /^[A-Za-z0-9 &.,'-]{2,100}$/.test(
      this.operator.company_name.trim()
    );

  }


  validateUsername(): boolean {

    return /^[A-Za-z0-9_]{4,30}$/.test(
      this.operator.username.trim()
    );

  }


  validateEmail(): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      this.operator.email.trim()
    );

  }


  validatePhone(): boolean {

    return /^[6-9][0-9]{9}$/.test(
      this.operator.phone.trim()
    );

  }


  validateBusinessPhone(): boolean {

    return /^[6-9][0-9]{9}$/.test(
      this.operator.business_phone.trim()
    );

  }


  validateBusinessEmail(): boolean {

    if (
      !this.operator.business_email.trim()
    ) {

      return true;

    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      this.operator.business_email.trim()
    );

  }


  validatePassword(): boolean {

    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(
      this.operator.password
    );

  }


  validateAddress(): boolean {

    return (
      this.operator.address.trim().length >= 10
    );

  }


  validateCity(): boolean {

    return /^[A-Za-z .'-]{2,50}$/.test(
      this.operator.city.trim()
    );

  }


  validateState(): boolean {

    return /^[A-Za-z .'-]{2,50}$/.test(
      this.operator.state.trim()
    );

  }


  validatePinCode(): boolean {

    return /^[1-9][0-9]{5}$/.test(
      this.operator.pin_code.trim()
    );

  }


  validateNumberOfBuses(): boolean {

    return (
      Number.isInteger(
        Number(this.operator.number_of_buses)
      ) &&
      this.operator.number_of_buses >= 1
    );

  }


  validateExperience(): boolean {

    return (
      Number.isInteger(
        Number(this.operator.years_of_experience)
      ) &&
      this.operator.years_of_experience >= 0
    );

  }


  // =====================================================
  // FILE UPLOAD
  // =====================================================

  onFileSelected(
    event: Event,
    field:
      | 'government_id'
      | 'business_registration'
      | 'transport_permit'
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      input.files &&
      input.files.length > 0
    ) {

      this.operator[field] =
        input.files[0];

    }

  }


  // =====================================================
  // FORM VALIDATION
  // =====================================================

  isFormValid(): boolean {

    return (

      // -------------------------
      // Account
      // -------------------------

      this.validateUsername() &&

      this.validateEmail() &&

      this.validatePhone() &&

      this.validatePassword() &&

      this.operator.password ===
        this.operator.password2 &&


      // -------------------------
      // Operator
      // -------------------------

      this.validateName() &&

      this.validateCompany() &&

      !!this.operator.operator_type &&

      this.validateBusinessPhone() &&

      this.validateBusinessEmail() &&


      // -------------------------
      // Address
      // -------------------------

      this.validateAddress() &&

      this.validateCity() &&

      this.validateState() &&

      this.validatePinCode() &&


      // -------------------------
      // Operator Information
      // -------------------------

      this.validateNumberOfBuses() &&

      this.validateExperience() &&


      // -------------------------
      // Operator Documents
      // -------------------------

      !!this.operator.government_id &&

      !!this.operator.business_registration &&

      !!this.operator.transport_permit &&


      // -------------------------
      // Agreement
      // -------------------------

      this.operator.information_confirmed 

    );

  }


  // =====================================================
  // REGISTER
  // =====================================================

  register(): void {

    this.submitted = true;


    // Stop if validation fails

    if (!this.isFormValid()) {

      return;

    }


    this.loading = true;


    this.authService
      .operatorRegister(this.operator)
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (response: any) => {

          console.log(
            'OPERATOR REGISTER RESPONSE:',
            response
          );


          this.loading = false;


          alert(
            'Operator registration submitted successfully. ' +
            'Your application is now pending admin verification.'
          );


          this.router.navigate([
            '/login'
          ]);

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          console.error(
            'OPERATOR REGISTER ERROR:',
            error
          );


          this.loading = false;


          if (error.error) {

            if (
              typeof error.error === 'object'
            ) {

              const messages =
                Object.entries(error.error)
                  .map(
                    ([field, message]) =>
                      `${field}: ${message}`
                  )
                  .join('\n');


              alert(messages);

            }

            else {

              alert(
                error.error
              );

            }

          }

          else {

            alert(
              'Operator registration failed. Please try again.'
            );

          }

        }

      });

  }

}