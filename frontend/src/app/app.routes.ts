import { Routes } from '@angular/router';

// AUTH
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';

// MAIN
import { IndexComponent } from './index/index';

// USER
import { HomeComponent } from './user/home/home';
import { SeatSelectionComponent } from './user/seat-selection/seat-selection';
import { PassengerDetailsComponent } from './user/passenger-details/passenger-details';
import { BookingComponent } from './user/booking/booking';
import { PaymentComponent } from './user/payment/payment';
import { TicketComponent } from './user/ticket/ticket';
import { MyBookingsComponent } from './user/my-bookings/my-bookings';
import { ReviewsComponent } from './user/reviews/reviews';
import { AllReviewsComponent } from './user/all-reviews/all-reviews';
import { BusReviewsComponent } from './user/bus-reviews/bus-reviews';
import { AiChat } from './user/ai-chat/ai-chat';
import { ProfileComponent } from './user/profile/profile';
import { RouteStopsComponent } from './user/route-stops/route-stops';


// ADMIN
import { DashboardComponent as AdminDashboardComponent }
  from './admin/dashboard/dashboard';

  import { ManageUsersComponent } 
  from './admin/manage-users/manage-users';
  
import { OperatorsComponent }
  from './admin/operators/operators';

import { BusesComponent as AdminBusesComponent }
  from './admin/buses/buses';

import { RoutesComponent as AdminRoutesComponent }
  from './admin/routes/routes';

import { SchedulesComponent as AdminSchedulesComponent }
  from './admin/schedules/schedules';

import { BookingsComponent as AdminBookingsComponent }
  from './admin/bookings/bookings';

import { PaymentsComponent }
  from './admin/payments/payments';

import { ReviewsComponent as AdminReviewsComponent }
  from './admin/reviews/reviews';

import { ReportsComponent as AdminReportsComponent }
  from './admin/reports/reports';

  import { ManageCitiesComponent }
  from './admin/manage-cities/manage-cities';

// OPERATOR
import { OperatorRegisterComponent }
  from './operator/register/register';

import { DashboardComponent as OperatorDashboardComponent }
  from './operator/dashboard/dashboard';

import { BusesComponent as OperatorBusesComponent }
  from './operator/buses/buses';

import { RoutesComponent as OperatorRoutesComponent }
  from './operator/routes/routes';



import { SeatsComponent as OperatorSeatsComponent }
  from './operator/seats/seats';

import { ReportsComponent as OperatorReportsComponent }
  from './operator/reports/reports';

  import { ManageStopsComponent }
  from './operator/manage-stops/manage-stops';

  import { ManageSchedulesComponent } from './operator/manage-schedules/manage-schedules';

  import { ManageFaresComponent }
  from './operator/manage-fares/manage-fares';

import { BookingsComponent } from './operator/bookings/bookings';
import { NotificationsComponent } from './user/notifications/notifications';


export const routes: Routes = [

  // =========================
  // MAIN
  // =========================

  {
    path: '',
    component: IndexComponent
  },


  // =========================
  // AUTH
  // =========================

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },


  // =========================
  // USER
  // =========================

  {
    path: 'home',
    component: HomeComponent
  },

  {
    path: 'seat-selection/:scheduleId/:busId',
    component: SeatSelectionComponent
  },

  {
    path: 'passenger-details',
    component: PassengerDetailsComponent
  },

  {
    path: 'booking',
    component: BookingComponent
  },

  {
    path: 'payment',
    component: PaymentComponent
  },

  {
    path: 'ticket',
    component: TicketComponent
  },

  {
    path: 'my-bookings',
    component: MyBookingsComponent
  },

  {
    path: 'reviews',
    component: ReviewsComponent
  },

  {
    path: 'all-reviews',
    component: AllReviewsComponent
  },

  {
    path: 'bus-reviews/:busId',
    component: BusReviewsComponent
  },

  {
    path: 'ai-chat',
    component: AiChat
  },

  {
    path: 'profile',
    component: ProfileComponent
  },

  {
  path: 'notifications',
  component: NotificationsComponent
},


{
  path: 'route-stops/:routeId',
  component: RouteStopsComponent
},
  // =========================
  // OPERATOR
  // =========================

  {
    path: 'operator/dashboard',
    component: OperatorDashboardComponent
  },

  {
    path: 'operator/buses',
    component: OperatorBusesComponent
  },

  {
    path: 'operator/routes',
    component: OperatorRoutesComponent
  },


  {
    path: 'operator/seats',
    component: OperatorSeatsComponent
  },

  {
    path: 'operator/reports',
    component: OperatorReportsComponent
  },

  {
    path: 'operator/register',
    component: OperatorRegisterComponent
  },

  {
  path: 'operator/bookings',
  component: BookingsComponent
},

{
  path: 'operator/manage-stops/:routeId',
  component: ManageStopsComponent
},

{
  path: 'operator/manage-schedules',
  component: ManageSchedulesComponent
},

{
  path: 'operator/manage-fares/:scheduleId',
  component: ManageFaresComponent
},
  {
    path: 'operator/profile',
    loadComponent: () =>
      import('./operator/operator-profile/operator-profile')
        .then(m => m.OperatorProfileComponent)
  },


  // =========================
  // ADMIN
  // =========================

  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent
  },

  {
  path: 'admin/users',
  component: ManageUsersComponent
},

  {
    path: 'admin/operators',
    component: OperatorsComponent
  },

  {
    path: 'admin/buses',
    component: AdminBusesComponent
  },

  {
    path: 'admin/routes',
    component: AdminRoutesComponent
  },

  {
    path: 'admin/schedules',
    component: AdminSchedulesComponent
  },

  {
    path: 'admin/bookings',
    component: AdminBookingsComponent
  },

  {
    path: 'admin/payments',
    component: PaymentsComponent
  },

  {
    path: 'admin/reviews',
    component: AdminReviewsComponent
  },

  {
    path: 'admin/reports',
    component: AdminReportsComponent
  },
{
  path: 'admin/cities',
  component: ManageCitiesComponent
},
];