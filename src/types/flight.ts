// src/types/flight.ts
export interface Flight {
  flightId: string;
  airline: string;
  flightNumber: string;
  departureDatetime: string;
  destinationDatetime: string;
  departureArrName: string;
  destinationDesName: string;
  duration: string;
  stops: number;
  leasePrice: number;
  seatnum: number;
  amenitieslist: string[];

  availablefirstClassSeats: number;
  availablebusinessSeats: number;
  availableeconomySeats: number;
  economyPrice: number;     // 经济舱价格
  businessPrice: number;   // 商务舱价格
  firstClassPrice: number; // 头等舱价格
}

export type FlightSearchParams = {
  departure: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  cabin: string;
};

export type Passenger = {
  firstName:string;
  lastName: string;
  email: string;
  phone: string;
  idNo: string;
  seatType: string;
  seatTypeReturn: string | null;
}

export type BookingFlights = {
  bookingId: string;
  flightNumber: string;
  departureTime: string;
  departureLocation: string;
  arrivalTime: string;
  arrivalLocation: string;
  amount: number;
  hasRoundTrip: boolean;
  returnbookingId?: string;
  returnflightNumber?: string;
  returndepartureTime?: string;
  returndepartureLocation?: string;
  returnarrivalTime?: string;
  returnarrivalLocation?: string;
  returnamount?: number;
  passengers: BookingPassengers[];
  returnpassengers?: BookingPassengers[];
}
export type BookingPassengers = {
  passengerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNo: string;
  seat: string;
  price: number;
}