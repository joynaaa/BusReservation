import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth';


@Component({
  selector: 'app-manage-cities',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  templateUrl: './manage-cities.html',

  styleUrl: './manage-cities.css'
})
export class ManageCitiesComponent implements OnInit {

  cities: any[] = [];

  cityName = '';

  editingCityId: number | null = null;

  editingCityName = '';

  loading = false;

  saving = false;

  errorMessage = '';

  successMessage = '';


  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.loadCities();

  }

goToDashboard(): void {
  this.router.navigate(['/admin/dashboard']);
}
  // ==========================================
  // LOAD CITIES
  // ==========================================

  loadCities(): void {

    this.loading = true;

    this.errorMessage = '';

    this.authService.getAdminCities().subscribe({

      next: (data: any[]) => {

        console.log('CITIES LOADED:', data);

        this.cities = [...data];

        this.loading = false;

        // Force Angular UI refresh
        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(
          'LOAD CITIES ERROR:',
          error
        );

        this.loading = false;

        this.errorMessage =
          error?.error?.detail ||
          error?.error?.error ||
          'Unable to load cities.';

        // Force Angular UI refresh
        this.cdr.detectChanges();

      }

    });

  }


  // ==========================================
  // ADD CITY
  // ==========================================

  addCity(): void {

    const name = this.cityName.trim();


    if (!name) {

      this.errorMessage =
        'Please enter a city name.';

      this.successMessage = '';

      this.cdr.detectChanges();

      return;

    }


    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.cdr.detectChanges();


    const data = {
      name: name
    };


    this.authService.addAdminCity(data)
      .subscribe({

        next: (response: any) => {

          console.log(
            'CITY ADDED:',
            response
          );

          this.saving = false;

          this.cityName = '';

          this.successMessage =
            'City added successfully.';

          // Reload cities
          this.loadCities();

          // Immediately update UI
          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'ADD CITY ERROR:',
            error
          );

          this.saving = false;

          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            'Unable to add city.';

          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // EDIT CITY
  // ==========================================

  editCity(city: any): void {

    this.editingCityId = city.id;

    this.editingCityName = city.name;

    this.errorMessage = '';

    this.successMessage = '';

    this.cdr.detectChanges();

  }


  // ==========================================
  // CANCEL EDIT
  // ==========================================

  cancelEdit(): void {

    this.editingCityId = null;

    this.editingCityName = '';

    this.cdr.detectChanges();

  }


  // ==========================================
  // UPDATE CITY
  // ==========================================

  updateCity(): void {

    if (this.editingCityId === null) {

      return;

    }


    const name =
      this.editingCityName.trim();


    if (!name) {

      this.errorMessage =
        'City name cannot be empty.';

      this.successMessage = '';

      this.cdr.detectChanges();

      return;

    }


    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.cdr.detectChanges();


    const cityId =
      this.editingCityId;


    this.authService.updateAdminCity(
      cityId,
      {
        name: name
      }
    ).subscribe({

      next: (response: any) => {

        console.log(
          'CITY UPDATED:',
          response
        );


        // Stop saving state
        this.saving = false;


        // Close edit mode
        this.editingCityId = null;

        this.editingCityName = '';


        // Show success message
        this.successMessage =
          'City updated successfully.';


        // Reload latest cities
        this.loadCities();


        // Immediately refresh UI
        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(
          'UPDATE CITY ERROR:',
          error
        );


        this.saving = false;


        this.errorMessage =
          error?.error?.error ||
          error?.error?.detail ||
          'Unable to update city.';


        this.cdr.detectChanges();

      }

    });

  }


  // ==========================================
  // DELETE CITY
  // ==========================================

  deleteCity(id: number): void {

    const confirmed = confirm(
      'Are you sure you want to delete this city?'
    );


    if (!confirmed) {

      return;

    }


    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.cdr.detectChanges();


    this.authService.deleteAdminCity(id)
      .subscribe({

        next: () => {

          console.log(
            'CITY DELETED:',
            id
          );


          this.saving = false;


          this.successMessage =
            'City deleted successfully.';


          // Reload cities
          this.loadCities();


          // Refresh UI immediately
          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'DELETE CITY ERROR:',
            error
          );


          this.saving = false;


          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            'Unable to delete city.';


          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);

  }

}