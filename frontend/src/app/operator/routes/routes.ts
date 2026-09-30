import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth';
import { BusService } from '../../core/services/bus';
import { Router } from '@angular/router';

@Component({
  selector: 'app-routes',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './routes.html',
  styleUrl: './routes.css'
})
export class RoutesComponent implements OnInit {

  routes: any[] = [];

  // Admin cities
  cities: any[] = [];
  loadingCities = false;

  showForm = false;

  editMode = false;

  editingRouteId: number | null = null;


  route = {

    source: '',

    destination: '',

    distance: 0,

    duration: ''

  };


  constructor(
    private authService: AuthService,
    private busService: BusService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}


  ngOnInit(): void {

    this.loadCities();

    this.loadRoutes();

  }
// ==========================================
// BACK TO DASHBOARD
// ==========================================

goToDashboard(): void {

  this.router.navigate([
    '/operator/dashboard'
  ]);

}

  // ==========================================
  // LOAD CITIES FROM ADMIN
  // ==========================================

  loadCities(): void {

    this.loadingCities = true;

    this.busService
      .getCities()
      .subscribe({

        next: (data) => {

          this.cities = data;

          this.loadingCities = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading cities:',
            error
          );

          this.loadingCities = false;

          alert(
            'Unable to load cities.'
          );

        }

      });

  }


  // ==========================================
  // LOAD OPERATOR ROUTES
  // ==========================================

  loadRoutes(): void {

    this.authService
      .getOperatorRoutes()
      .subscribe({

        next: (data) => {

          this.routes = data;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error loading routes:',
            error
          );

        }

      });

  }


  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  openAddForm(): void {

    this.editMode = false;

    this.editingRouteId = null;

    this.route = {

      source: '',

      destination: '',

      distance: 0,

      duration: ''

    };

    this.showForm = true;

  }


  // ==========================================
  // EDIT ROUTE
  // ==========================================

  editRoute(item: any): void {

    this.editMode = true;

    this.editingRouteId = item.id;

    this.route = {

      source: item.source,

      destination: item.destination,

      distance: item.distance,

      duration: item.duration

    };

    this.showForm = true;

  }


  // ==========================================
  // SAVE ROUTE
  // ==========================================

  saveRoute(): void {

    if (
      !this.route.source ||
      !this.route.destination ||
      !this.route.distance ||
      !this.route.duration
    ) {

      alert('Please fill all fields.');

      return;

    }


    // Source and destination cannot be same

    if (
      this.route.source.trim().toLowerCase() ===
      this.route.destination.trim().toLowerCase()
    ) {

      alert(
        'Source and destination cannot be the same.'
      );

      return;

    }


    // ==========================================
    // EDIT
    // ==========================================

    if (
      this.editMode &&
      this.editingRouteId !== null
    ) {

      this.authService
        .updateOperatorRoute(
          this.editingRouteId,
          this.route
        )
        .subscribe({

          next: () => {

            alert(
              'Route updated successfully.'
            );

            this.showForm = false;

            this.loadRoutes();

          },

          error: (error) => {

            console.error(error);

            alert(
              'Failed to update route.'
            );

          }

        });

    }


    // ==========================================
    // ADD
    // ==========================================

    else {

      this.authService
        .addOperatorRoute(this.route)
        .subscribe({

          next: () => {

            alert(
              'Route added successfully.'
            );

            this.showForm = false;

            this.loadRoutes();

          },

          error: (error) => {

            console.error(error);

            alert(
              'Failed to add route.'
            );

          }

        });

    }

  }


  // ==========================================
  // DELETE ROUTE
  // ==========================================

  deleteRoute(id: number): void {

    const confirmDelete = confirm(
      'Are you sure you want to delete this route?'
    );


    if (!confirmDelete) {

      return;

    }


    this.authService
      .deleteOperatorRoute(id)
      .subscribe({

        next: () => {

          alert(
            'Route deleted successfully.'
          );

          this.loadRoutes();

        },

        error: (error) => {

          console.error(error);

          alert(
            'Failed to delete route.'
          );

        }

      });

  }


  // ==========================================
  // CANCEL
  // ==========================================

  cancelForm(): void {

    this.showForm = false;

    this.editMode = false;

    this.editingRouteId = null;

  }


  // ==========================================
  // MANAGE STOPS
  // ==========================================

  manageStops(routeId: number): void {

    this.router.navigate([
      '/operator/manage-stops',
      routeId
    ]);

  }

}