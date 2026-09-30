import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class PaymentsComponent implements OnInit {

  payments: any[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
     private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }
goToDashboard(): void {
  this.router.navigate(['/admin/dashboard']);
}
  loadPayments(): void {

    this.loading = true;

    this.authService.getAdminPayments().subscribe({
      next: (data: any[]) => {

        console.log('PAYMENTS API RESPONSE:', data);

        this.payments = data;
        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error: any) => {

        console.error('PAYMENT API ERROR:', error);

        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }
}