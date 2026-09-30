import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';


@Component({
  selector: 'app-operators',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './operators.html',

  styleUrl: './operators.css'
})
export class OperatorsComponent
  implements OnInit {


  // =====================================================
  // DATA
  // =====================================================

  operators: any[] = [];

  loading = true;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    console.log(
      'Manage Operators page loaded'
    );

    this.loadOperators();

  }
goToDashboard(): void {
  this.router.navigate(['/admin/dashboard']);
}

  // =====================================================
  // LOAD OPERATORS
  // =====================================================

  loadOperators(): void {

    console.log(
      'Starting operator API request...'
    );

    this.loading = true;


    this.authService
      .getOperators()
      .subscribe({

        next: (response: any[]) => {

          console.log(
            'OPERATOR API RESPONSE:',
            response
          );


          this.operators =
            Array.isArray(response)
              ? response
              : [];


          console.log(
            'Operators loaded:',
            this.operators
          );


          console.log(
            'Operators count:',
            this.operators.length
          );


          this.loading = false;


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'OPERATOR API ERROR:',
            error
          );


          this.loading = false;


          this.cdr.detectChanges();


          if (error.status === 401) {

            alert(
              'Please login as admin.'
            );

          }

          else if (error.status === 403) {

            alert(
              'You do not have admin permission.'
            );

          }

          else {

            alert(
              'Unable to load operators.'
            );

          }

        }

      });

  }


  // =====================================================
  // APPROVE OPERATOR
  // =====================================================

  approveOperator(
    operator: any
  ): void {

    const name =
      operator.full_name ||
      operator.username;


    if (
      !confirm(
        `Approve ${name}?`
      )
    ) {

      return;

    }


    this.authService
      .approveOperator(operator.id)
      .subscribe({

        next: () => {

          alert(
            'Operator approved successfully.'
          );


          this.loadOperators();

        },


        error: (error) => {

          console.error(
            'APPROVE ERROR:',
            error
          );


          alert(
            error.error?.error ||
            'Unable to approve operator.'
          );

        }

      });

  }


  // =====================================================
  // REJECT OPERATOR
  // =====================================================

  rejectOperator(
    operator: any
  ): void {

    const name =
      operator.full_name ||
      operator.username;


    if (
      !confirm(
        `Reject ${name}?`
      )
    ) {

      return;

    }


    this.authService
      .rejectOperator(operator.id)
      .subscribe({

        next: () => {

          alert(
            'Operator rejected successfully.'
          );


          this.loadOperators();

        },


        error: (error) => {

          console.error(
            'REJECT ERROR:',
            error
          );


          alert(
            error.error?.error ||
            'Unable to reject operator.'
          );

        }

      });

  }


  // =====================================================
  // DELETE OPERATOR
  // =====================================================

  deleteOperator(
    operator: any
  ): void {

    console.log(
      'DELETE BUTTON CLICKED'
    );

    console.log(
      'Operator:',
      operator
    );

    console.log(
      'Operator ID:',
      operator.id
    );


    const name =
      operator.full_name ||
      operator.username;


    if (
      !confirm(
        `Are you sure you want to delete ${name}?`
      )
    ) {

      return;

    }


    this.authService
      .deleteOperator(operator.id)
      .subscribe({

        next: (
          response: any
        ) => {

          console.log(
            'DELETE SUCCESS:',
            response
          );


          alert(
            'Operator deleted successfully.'
          );


          this.loadOperators();

        },


        error: (
          error: any
        ) => {

          console.error(
            'DELETE ERROR STATUS:',
            error.status
          );

          console.error(
            'DELETE ERROR BODY:',
            error.error
          );

          console.error(
            'DELETE FULL ERROR:',
            error
          );


          if (
            error.status === 401
          ) {

            alert(
              'Your admin login has expired. Please login again.'
            );

          }

          else if (
            error.status === 403
          ) {

            alert(
              'You do not have admin permission.'
            );

          }

          else if (
            error.status === 404
          ) {

            alert(
              'Operator not found.'
            );

          }

          else if (
            error.status === 500
          ) {

            alert(
              'Server error while deleting operator. Check Django terminal.'
            );

          }

          else {

            alert(
              'Unable to delete operator.'
            );

          }

        }

      });

  }

}