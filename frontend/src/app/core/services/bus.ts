import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BusService {

  private apiUrl = 'http://127.0.0.1:8000/api/buses';
  private bookingApiUrl = 'http://127.0.0.1:8000/api/bookings';
  private operatorApiUrl = 'http://127.0.0.1:8000/api/operator';

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // AUTH HEADERS
  // ==========================================

  private getAuthHeaders(): HttpHeaders {

    const token = localStorage.getItem('access');

    console.log(
      'JWT token exists:',
      !!token
    );

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  // ==========================================
  // PUBLIC BUS APIs
  // ==========================================

  getCities() {

    return this.http.get<any[]>(
      `${this.apiUrl}/cities/`
    );
  }


  getBuses() {

    return this.http.get<any[]>(
      `${this.apiUrl}/`
    );
  }


  // ==========================================
  // SEARCH BUSES
  // ==========================================
// ==========================================
// SEARCH BUSES
// ==========================================

searchBuses(
  source: string,
  destination: string,
  date: string,
  filters: any = {}
) {

  let params = new HttpParams()
    .set('source', source)
    .set('destination', destination)
    .set('date', date);


  // ------------------------------------------
  // OPTIONAL FILTERS
  // ------------------------------------------

  if (filters.bus_type) {

    params = params.set(
      'bus_type',
      filters.bus_type
    );

  }


  if (
    filters.min_price !== null &&
    filters.min_price !== undefined &&
    filters.min_price !== ''
  ) {

    params = params.set(
      'min_price',
      filters.min_price.toString()
    );

  }


  if (
    filters.max_price !== null &&
    filters.max_price !== undefined &&
    filters.max_price !== ''
  ) {

    params = params.set(
      'max_price',
      filters.max_price.toString()
    );

  }


  if (filters.departure_from) {

    params = params.set(
      'departure_from',
      filters.departure_from
    );

  }


  if (filters.departure_to) {

    params = params.set(
      'departure_to',
      filters.departure_to
    );

  }


  if (filters.arrival_from) {

    params = params.set(
      'arrival_from',
      filters.arrival_from
    );

  }


  if (filters.arrival_to) {

    params = params.set(
      'arrival_to',
      filters.arrival_to
    );

  }


  if (filters.min_rating) {

    params = params.set(
      'min_rating',
      filters.min_rating.toString()
    );

  }


  // ------------------------------------------
  // DEBUG
  // ------------------------------------------

  const url =
    `${this.apiUrl}/search/`;

  console.log('================================');
  console.log('SEARCH BUSES API');
  console.log('================================');

  console.log(
    'URL:',
    url
  );

  console.log(
    'SOURCE:',
    source
  );

  console.log(
    'DESTINATION:',
    destination
  );

  console.log(
    'DATE:',
    date
  );

  console.log(
    'PARAMS:',
    params.toString()
  );

  console.log('================================');


  // ------------------------------------------
  // API REQUEST
  // ------------------------------------------

  return this.http.get<any[]>(
    url,
    {
      params: params
    }
  );

}

  // ==========================================
  // BUS SEATS
  // DATE + SEGMENT BASED
  // ==========================================

  getSeats(
    busId: number,
    scheduleId: number,
    fromStopId: number,
    toStopId: number,
    travelDate: string
  ) {

    const params = new HttpParams()
      .set(
        'schedule_id',
        scheduleId.toString()
      )
      .set(
        'from_stop',
        fromStopId.toString()
      )
      .set(
        'to_stop',
        toStopId.toString()
      )
      .set(
        'travel_date',
        travelDate
      );

    console.log(
      'GET SEATS PARAMETERS:',
      {
        busId,
        scheduleId,
        fromStopId,
        toStopId,
        travelDate,
        url:
          `${this.apiUrl}/${busId}/seats/`
      }
    );

    return this.http.get<any[]>(
      `${this.apiUrl}/${busId}/seats/`,
      { params }
    );
  }


  // ==========================================
  // BOOKING - HOLD SEAT
  // ==========================================

  holdSeat(
    scheduleId: number,
    seatId: number,
    fromStopId: number,
    toStopId: number,
    travelDate: string
  ) {

    const body = {

      schedule: scheduleId,

      seat: seatId,

      from_stop: fromStopId,

      to_stop: toStopId,

      travel_date: travelDate

    };

    console.log(
      'HOLD SEAT REQUEST:',
      body
    );

    return this.http.post<any>(
      `${this.bookingApiUrl}/hold-seat/`,
      body,
      {
        headers:
          this.getAuthHeaders()
      }
    );
  }


  // ==========================================
  // SCHEDULE
  // ==========================================

  getSchedule(
    scheduleId: number
  ) {

    const url =
      `${this.operatorApiUrl}/schedules/${scheduleId}/`;

    console.log(
      'GET SCHEDULE:',
      url
    );

    return this.http.get<any>(
      url,
      {
        headers:
          this.getAuthHeaders()
      }
    );
  }


  // ==========================================
  // OPERATOR - BUSES
  // ==========================================

  getOperatorBuses() {

    const url =
      `${this.apiUrl}/operator/`;

    console.log(
      'GET OPERATOR BUSES:',
      url
    );

    return this.http.get<any[]>(
      url,
      {
        headers:
          this.getAuthHeaders()
      }
    );
  }


  addOperatorBus(data: any) {

    const formData = new FormData();

    formData.append('bus_number', data.bus_number);
    formData.append('bus_name', data.bus_name);
    formData.append('bus_type', data.bus_type);
    formData.append('total_seats', String(data.total_seats));
    formData.append('seats_per_row', String(data.seats_per_row));

    if (data.vehicle_rc) {
      formData.append('vehicle_rc', data.vehicle_rc);
    }

    if (data.insurance_certificate) {
      formData.append('insurance_certificate', data.insurance_certificate);
    }

    if (data.fitness_certificate) {
      formData.append('fitness_certificate', data.fitness_certificate);
    }

    console.log('ADD OPERATOR BUS: FormData prepared');

    return this.http.post<any>(
      `${this.apiUrl}/operator/`,
      formData,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('access')}`
        })
      }
    );
  }


  updateOperatorBus(id: number, data: any) {

    const formData = new FormData();

    formData.append('bus_number', data.bus_number);
    formData.append('bus_name', data.bus_name);
    formData.append('bus_type', data.bus_type);
    formData.append('total_seats', String(data.total_seats));
    formData.append('seats_per_row', String(data.seats_per_row));

    if (data.vehicle_rc) {
      formData.append('vehicle_rc', data.vehicle_rc);
    }

    if (data.insurance_certificate) {
      formData.append('insurance_certificate', data.insurance_certificate);
    }

    if (data.fitness_certificate) {
      formData.append('fitness_certificate', data.fitness_certificate);
    }

    console.log('UPDATE OPERATOR BUS:', id);

    return this.http.put<any>(
      `${this.apiUrl}/operator/${id}/`,
      formData,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('access')}`
        })
      }
    );
  }


  deleteOperatorBus(
    id: number
  ) {

    console.log(
      'DELETE OPERATOR BUS:',
      id
    );

    return this.http.delete<any>(
      `${this.apiUrl}/operator/${id}/`,
      {
        headers:
          this.getAuthHeaders()
      }
    );
  }


  // ==========================================
  // ROUTE STOPS
  // ==========================================


getRouteStops(routeId: number) {

  const url =
    `${this.apiUrl}/routes/${routeId}/stops/`;

  console.log('================================');
  console.log('GET ROUTE STOPS');
  console.log('Route ID:', routeId);
  console.log('URL:', url);
  console.log('================================');

  return this.http.get<any>(url);
}


  // ==========================================
  // SCHEDULE FARES
  // ==========================================

  getScheduleFares(
    scheduleId: number
  ) {

    const url =
      `${this.operatorApiUrl}/schedules/${scheduleId}/fares/`;

    console.log(
      '================================'
    );

    console.log(
      'GET SCHEDULE FARES'
    );

    console.log(
      'Schedule ID:',
      scheduleId
    );

    console.log(
      'URL:',
      url
    );

    console.log(
      '================================'
    );

    return this.http.get<any[]>(
      url,
      {
        headers:
          this.getAuthHeaders()
      }
    );
  }


  // ==========================================
  // ADD / UPDATE SCHEDULE FARE
  // ==========================================

  addScheduleFare(
    scheduleId: number,
    data: {
      from_stop: number;
      to_stop: number;
      fare: number;
    }
  ) {

    const url =
      `${this.operatorApiUrl}/schedules/${scheduleId}/fares/add/`;

    console.log(
      '================================'
    );

    console.log(
      'ADD / UPDATE SCHEDULE FARE'
    );

    console.log(
      'Schedule ID:',
      scheduleId
    );

    console.log(
      'URL:',
      url
    );

    console.log(
      'Request Data:',
      data
    );

    console.log(
      '================================'
    );

    return this.http.post<any>(
      url,
      data,
      {
        headers:
          this.getAuthHeaders()
      }
    );
  }


  // ==========================================
  // DELETE SCHEDULE FARE
  // ==========================================

  deleteScheduleFare(
    scheduleId: number,
    fareId: number
  ) {

    const url =
      `${this.operatorApiUrl}/schedules/${scheduleId}/fares/${fareId}/`;

    console.log(
      '================================'
    );

    console.log(
      'DELETE SCHEDULE FARE'
    );

    console.log(
      'Schedule ID:',
      scheduleId
    );

    console.log(
      'Fare ID:',
      fareId
    );

    console.log(
      'URL:',
      url
    );

    console.log(
      '================================'
    );

    return this.http.delete<any>(
      url,
      {
        headers:
          this.getAuthHeaders()
      }
    );
  }



  // ==========================================
  // ADMIN - BUS APPROVAL
  // ==========================================

  approveBus(id: number) {

    const token = localStorage.getItem('access');

    return this.http.put(
      `http://127.0.0.1:8000/api/admin/buses/${id}/approve/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  }


  rejectBus(id: number, rejection_reason: string) {

    const token = localStorage.getItem('access');

    return this.http.put(
      `http://127.0.0.1:8000/api/admin/buses/${id}/reject/`,
      { rejection_reason },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  }

}