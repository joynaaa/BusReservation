
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl =
    'http://127.0.0.1:8000/api/auth';

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // AUTHENTICATION
  // ==========================================

  // Normal User Registration
  register(data: any) {

    return this.http.post(
      `${this.apiUrl}/register/`,
      data
    );

  }


  // Bus Operator Registration
  // ==========================================
// BUS OPERATOR REGISTRATION
// ==========================================

operatorRegister(data: any) {

  const formData = new FormData();


  // =========================
  // ACCOUNT
  // =========================

  formData.append(
    'username',
    data.username
  );

  formData.append(
    'email',
    data.email
  );

  formData.append(
    'password',
    data.password
  );

  formData.append(
    'password2',
    data.password2
  );

  formData.append(
    'phone',
    data.phone
  );


  // =========================
  // OPERATOR DETAILS
  // =========================

  formData.append(
    'full_name',
    data.full_name
  );

  formData.append(
    'company_name',
    data.company_name
  );

  formData.append(
    'operator_type',
    data.operator_type
  );

  formData.append(
    'business_phone',
    data.business_phone
  );

  formData.append(
    'business_email',
    data.business_email || ''
  );


  // =========================
  // BUSINESS ADDRESS
  // =========================

  formData.append(
    'address',
    data.address
  );

  formData.append(
    'city',
    data.city
  );

  formData.append(
    'state',
    data.state
  );

  formData.append(
    'pin_code',
    data.pin_code
  );


  // =========================
  // OPERATOR INFORMATION
  // =========================

  formData.append(
    'number_of_buses',
    String(data.number_of_buses)
  );

  formData.append(
    'years_of_experience',
    String(data.years_of_experience)
  );


  // =========================
  // OPERATOR VERIFICATION
  // =========================

  if (data.government_id) {

    formData.append(
      'government_id',
      data.government_id
    );

  }


  if (data.business_registration) {

    formData.append(
      'business_registration',
      data.business_registration
    );

  }


  if (data.transport_permit) {

    formData.append(
      'transport_permit',
      data.transport_permit
    );

  }


  // =========================
  // SUBMIT
  // =========================

  return this.http.post(
    `${this.apiUrl}/operator-register/`,
    formData
  );

}

  // Login
  login(
    username: string,
    password: string
  ) {

    return this.http.post<any>(
      `${this.apiUrl}/login/`,
      {
        username: username,
        password: password
      }
    );

  }


  // Logout
  logout() {

    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

  }


  // Check login
  isLoggedIn(): boolean {

    return !!localStorage.getItem('access');

  }


  // Get logged-in user's profile
  getProfile() {

    const token =
      localStorage.getItem('access');

    return this.http.get(
      `${this.apiUrl}/profile/`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // ADMIN - OPERATORS
  // ==========================================

  getOperators() {

    const token =
      localStorage.getItem('access');

    console.log(
      'ADMIN TOKEN:',
      token
    );

    return this.http.get<any[]>(
      'http://127.0.0.1:8000/api/admin/operators/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  approveOperator(id: number) {

    const token =
      localStorage.getItem('access');

    return this.http.put(
      `http://127.0.0.1:8000/api/admin/operators/${id}/approve/`,
      {},
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  rejectOperator(id: number) {

    const token =
      localStorage.getItem('access');

    return this.http.put(
      `http://127.0.0.1:8000/api/admin/operators/${id}/reject/`,
      {},
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  deleteOperator(id: number) {

    const token =
      localStorage.getItem('access');

    console.log(
      'DELETE ID:',
      id
    );

    console.log(
      'DELETE TOKEN EXISTS:',
      !!token
    );

    return this.http.delete(
      `http://127.0.0.1:8000/api/admin/operators/${id}/`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // ADMIN - BUSES
  // ==========================================

  getAdminBuses() {

    const token =
      localStorage.getItem('access');

    return this.http.get<any[]>(
      'http://127.0.0.1:8000/api/admin/buses/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  addAdminBus(data: any) {

    const token =
      localStorage.getItem('access');

    return this.http.post(
      'http://127.0.0.1:8000/api/admin/buses/add/',
      data,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  updateAdminBus(
    id: number,
    data: any
  ) {

    const token =
      localStorage.getItem('access');

    return this.http.put(
      `http://127.0.0.1:8000/api/admin/buses/${id}/`,
      data,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  deleteAdminBus(id: number) {

    const token =
      localStorage.getItem('access');

    return this.http.delete(
      `http://127.0.0.1:8000/api/admin/buses/${id}/delete/`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  toggleBusStatus(id: number) {

    const token =
      localStorage.getItem('access');

    return this.http.put(
      `http://127.0.0.1:8000/api/admin/buses/${id}/toggle-status/`,
      {},
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // ADMIN - BUS APPROVAL
  // ==========================================

  approveBus(id: number) {

    const token =
      localStorage.getItem('access');

    return this.http.put(
      `http://127.0.0.1:8000/api/admin/buses/${id}/approve/`,
      {},
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  rejectBus(
    id: number,
    rejection_reason: string
  ) {

    const token =
      localStorage.getItem('access');

    return this.http.put(
      `http://127.0.0.1:8000/api/admin/buses/${id}/reject/`,
      {
        rejection_reason: rejection_reason
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // ADMIN - ROUTES
  // ==========================================

  getAdminRoutes() {

    const token =
      localStorage.getItem('access');

    return this.http.get<any[]>(
      'http://127.0.0.1:8000/api/admin/routes/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  addAdminRoute(data: any) {

    const token =
      localStorage.getItem('access');

    return this.http.post(
      'http://127.0.0.1:8000/api/admin/routes/add/',
      data,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  updateAdminRoute(
    id: number,
    data: any
  ) {

    const token =
      localStorage.getItem('access');

    return this.http.put(
      `http://127.0.0.1:8000/api/admin/routes/${id}/`,
      data,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  deleteAdminRoute(id: number) {

    const token =
      localStorage.getItem('access');

    return this.http.delete(
      `http://127.0.0.1:8000/api/admin/routes/${id}/delete/`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // ADMIN - ALL BUSES / ROUTES
  // ==========================================

  getAllBuses() {

    const token =
      localStorage.getItem('access');

    return this.http.get<any[]>(
      'http://127.0.0.1:8000/api/buses/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  getAllRoutes() {

    const token =
      localStorage.getItem('access');

    return this.http.get<any[]>(
      'http://127.0.0.1:8000/api/admin/routes/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // ADMIN - SCHEDULES
  // ==========================================

 getAdminSchedules() {

  const token =
    localStorage.getItem('access');

  const headers = {
    Authorization: `Bearer ${token}`
  };


  return this.http.get<any[]>(
    'http://127.0.0.1:8000/api/admin/schedules/',
    {
      headers
    }
  );

}

 addAdminSchedule(data: any) {

  const token =
    localStorage.getItem('access');

  const headers = {
    Authorization: `Bearer ${token}`
  };


  return this.http.post(
    'http://127.0.0.1:8000/api/admin/schedules/add/',
    data,
    {
      headers
    }
  );

}


updateAdminSchedule(
  id: number,
  data: any
) {

  const token =
    localStorage.getItem('access');

  const headers = {
    Authorization: `Bearer ${token}`
  };


  return this.http.put(

    `http://127.0.0.1:8000/api/admin/schedules/${id}/`,

    data,

    {
      headers
    }

  );

}

deleteAdminSchedule(
  id: number
) {

  const token =
    localStorage.getItem('access');

  const headers = {
    Authorization: `Bearer ${token}`
  };


  return this.http.delete(

    `http://127.0.0.1:8000/api/admin/schedules/${id}/delete/`,

    {
      headers
    }

  );

}

updateAdminScheduleDays(
  scheduleId: number,
  days: string[]
) {

  const token =
    localStorage.getItem('access');

  const headers = {
    Authorization: `Bearer ${token}`
  };


  return this.http.put(

    `http://127.0.0.1:8000/api/admin/schedules/${scheduleId}/days/update/`,

    {
      days: days
    },

    {
      headers
    }

  );

}
  // ==========================================
  // ADMIN - BOOKINGS
  // ==========================================

  getAdminBookings() {

    const token =
      localStorage.getItem('access');

    return this.http.get<any[]>(
      'http://127.0.0.1:8000/api/admin/bookings/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // ADMIN - PAYMENTS
  // ==========================================

  getAdminPayments() {

    const token =
      localStorage.getItem('access');

    return this.http.get<any[]>(
      'http://127.0.0.1:8000/api/admin/payments/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // ADMIN - REVIEWS
  // ==========================================

  getAdminReviews() {

  const token = localStorage.getItem('access');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  return this.http.get<any[]>(
    'http://127.0.0.1:8000/api/admin/reviews/',
    { headers }
  );
}


deleteAdminReview(id: number) {

  const token = localStorage.getItem('access');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  return this.http.delete(
    `http://127.0.0.1:8000/api/admin/reviews/${id}/delete/`,
    { headers }
  );
}

  // ==========================================
  // ADMIN - REPORTS
  // ==========================================

getAdminReports() {

  const token = localStorage.getItem('access');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  return this.http.get<any>(
    'http://127.0.0.1:8000/api/buses/admin/reports/',
    { headers }
  );
}

  // ==========================================
  // ADMIN - DASHBOARD
  // ==========================================

  getAdminDashboard() {

    const token =
      localStorage.getItem('access');

    return this.http.get<any>(
      'http://127.0.0.1:8000/api/admin/dashboard/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // OPERATOR - DASHBOARD
  // ==========================================

  getOperatorDashboard() {

    const token =
      localStorage.getItem('access');

    return this.http.get<any>(
      'http://127.0.0.1:8000/api/operator/dashboard/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // OPERATOR - ROUTES
  // ==========================================

  getOperatorRoutes() {

    const token =
      localStorage.getItem('access');

    console.log(
      'Loading operator routes...'
    );

    console.log(
      'Token exists:',
      !!token
    );

    return this.http.get<any[]>(
      'http://127.0.0.1:8000/api/operator/routes/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  addOperatorRoute(
    data: any
  ) {

    const token =
      localStorage.getItem('access');

    return this.http.post(
      'http://127.0.0.1:8000/api/operator/routes/',
      data,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  updateOperatorRoute(
    id: number,
    data: any
  ) {

    const token =
      localStorage.getItem('access');

    return this.http.put(
      `http://127.0.0.1:8000/api/operator/routes/${id}/`,
      data,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  deleteOperatorRoute(
    id: number
  ) {

    const token =
      localStorage.getItem('access');

    return this.http.delete(
      `http://127.0.0.1:8000/api/operator/routes/${id}/`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // OPERATOR - ROUTE STOPS
  // ==========================================

  getOperatorRouteStops(
    routeId: number
  ) {

    const token =
      localStorage.getItem('access');

    return this.http.get<any[]>(
      `http://127.0.0.1:8000/api/operator/routes/${routeId}/stops/`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  addOperatorRouteStop(
    routeId: number,
    data: any
  ) {

    const token =
      localStorage.getItem('access');

    return this.http.post(
      `http://127.0.0.1:8000/api/operator/routes/${routeId}/stops/`,
      data,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }

  // ==========================================
  // OPERATOR - UPDATE ROUTE STOP
  // ==========================================

  updateOperatorRouteStop(
    routeId: number,
    stopId: number,
    data: any
  ) {

    const token =
      localStorage.getItem('access');

    console.log(
      'UPDATE OPERATOR ROUTE STOP:',
      {
        routeId,
        stopId,
        data
      }
    );

    return this.http.put<any>(
      `http://127.0.0.1:8000/api/operator/routes/${routeId}/stops/${stopId}/`,
      data,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
          'Content-Type':
            'application/json'
        }
      }
    );

  }


  // ==========================================
  // OPERATOR - DELETE ROUTE STOP
  // ==========================================

  deleteOperatorRouteStop(
    routeId: number,
    stopId: number
  ) {

    const token =
      localStorage.getItem('access');

    console.log(
      'DELETE OPERATOR ROUTE STOP:',
      {
        routeId,
        stopId
      }
    );

    return this.http.delete<any>(
      `http://127.0.0.1:8000/api/operator/routes/${routeId}/stops/${stopId}/`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }
  // ==========================================
  // OPERATOR - SCHEDULES
  // ==========================================

  getOperatorSchedules() {

    const token =
      localStorage.getItem('access');

    console.log(
      'GET operator schedules'
    );

    console.log(
      'Token exists:',
      !!token
    );

    return this.http.get<any[]>(
      'http://127.0.0.1:8000/api/operator/schedules/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }

addOperatorSchedule(data: any) {

  const token =
    localStorage.getItem('access');

  return this.http.post(
    'http://127.0.0.1:8000/api/operator/schedules/',
    data,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

}

  updateOperatorSchedule(
    id: number,
    data: any
  ) {

    const token =
      localStorage.getItem('access');

    return this.http.put<any>(
      `http://127.0.0.1:8000/api/operator/schedules/${id}/`,
      data,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  deleteOperatorSchedule(
    id: number
  ) {

    const token =
      localStorage.getItem('access');

    return this.http.delete<any>(
      `http://127.0.0.1:8000/api/operator/schedules/${id}/`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // OPERATOR - OPERATING DAYS
  // ==========================================

  getScheduleDays(
    scheduleId: number
  ) {

    const token =
      localStorage.getItem('access');

    console.log(
      'GET schedule days:',
      scheduleId
    );

    return this.http.get<any[]>(
      `http://127.0.0.1:8000/api/operator/schedules/${scheduleId}/days/`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }

addScheduleDay( 
  scheduleId: number, day: string 
) { 
  const token = localStorage.getItem('access'); 
  return this.http.post( 
    `http://127.0.0.1:8000/api/operator/schedules/${scheduleId}/days/`, 
    { day: day }, 
    { headers: { 
      Authorization: `Bearer ${token}` 
    } 
  } 
); 
}

  // ==========================================
  // OPERATOR - SEATS
  // ==========================================

  getOperatorSeats(
    scheduleId: number
  ) {

    const token =
      localStorage.getItem('access');

    return this.http.get<any[]>(
      'http://127.0.0.1:8000/api/operator/seats/',
      {
        params: {
          schedule_id:
            scheduleId
        },
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // OPERATOR - REPORTS
  // ==========================================

  getOperatorReports() {

    const token =
      localStorage.getItem('access');

    return this.http.get<any>(
      'http://127.0.0.1:8000/api/operator/reports/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }


  // ==========================================
  // OPERATOR - BOOKINGS
  // ==========================================

  getOperatorBookings() {

    const token =
      localStorage.getItem('access');

    return this.http.get<any[]>(
      'http://127.0.0.1:8000/api/bookings/operator/',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  }

  // ==========================================
// ADMIN - CITIES
// ==========================================

getAdminCities() {

  const token =
    localStorage.getItem('access');

  return this.http.get<any[]>(
    'http://127.0.0.1:8000/api/admin/cities/',
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

}


addAdminCity(data: any) {

  const token =
    localStorage.getItem('access');

  return this.http.post(
    'http://127.0.0.1:8000/api/admin/cities/add/',
    data,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

}


updateAdminCity(
  id: number,
  data: any
) {

  const token =
    localStorage.getItem('access');

  return this.http.put(
    `http://127.0.0.1:8000/api/admin/cities/${id}/`,
    data,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

}


deleteAdminCity(id: number) {

  const token =
    localStorage.getItem('access');

  return this.http.delete(
    `http://127.0.0.1:8000/api/admin/cities/${id}/delete/`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

}

getAdminUsers() {
  const token = localStorage.getItem('access');

  return this.http.get<any[]>(
    'http://127.0.0.1:8000/api/admin/users/',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}

// ==========================================
// UPDATE ADMIN USER
// ==========================================

updateAdminUser(
  id: number,
  data: any
) {

  const token =
    localStorage.getItem('access');

  return this.http.put(
    `http://127.0.0.1:8000/api/admin/users/${id}/`,
    data,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

}


// ==========================================
// DELETE ADMIN USER
// ==========================================

deleteAdminUser(
  id: number
) {

  const token =
    localStorage.getItem('access');

  return this.http.delete(
    `http://127.0.0.1:8000/api/admin/users/${id}/delete/`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

}
}
