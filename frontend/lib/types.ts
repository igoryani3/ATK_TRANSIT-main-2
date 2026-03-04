// Type definitions for the application

export interface User {
    id: number;
    username: string;
    role: string;
}

export interface Driver {
    id: number;
    full_name: string;
    phone: string;
    documents?: string;
    current_vehicle_plate?: string;
    executor_id?: number;
    birth_date?: string;
    backup_phone?: string;
    employment_status?: string;
    license_series_number?: string;
    license_issue_date?: string;
    license_expiry_date?: string;
    license_available?: boolean;
    passport_series_number?: string;
    passport_issue_date?: string;
    passport_issued_by?: string;
    passport_available?: boolean;
    snils_number?: string;
    snils_available?: boolean;
    tachograph_number?: string;
    tachograph_issue_date?: string;
    tachograph_expiry_date?: string;
    tachograph_available?: boolean;
}

export interface Vehicle {
    id: number;
    license_plate: string;
    model: string;
    capacity?: number;
    owner?: string;
    executor_id?: number;
}

export interface Client {
    id: number;
    company_name: string;
    contact_info?: string;
}

export interface Template {
    id?: number;
    customer_id: number;
    customer_name?: string;
    route_name: string;
    start_point?: string;
    end_point?: string;
    route_type?: string;
    pickup_time?: string;
    departure_time?: string;
    capacity?: number;
    price_excl_vat?: number;
    created_at?: string;
}

export interface Contract {
    id?: number;
    provider_entity: string;
    customer_id: number;
    customer_name?: string;
    created_at?: string;
}

export interface Executor {
    id: number;
    name: string;
}

export interface ContractProvider {
    id: number;
    name: string;
}

export interface Route {
    id?: number;
    name: string;
    start_point?: string;
    end_point?: string;
    waypoints?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface DirectionVariant {
    key: string;
    client: string;
    start_point: string;
    end_point: string;
    route_type: string;
    pickup_time: string | null;
    departure_time: string | null;
    price_excl_vat: number | null;
    capacity: number | null;
}

export interface Direction {
    name: string;
    client: string;
    variants: DirectionVariant[];
}

export interface Trip {
    id?: number;
    trip_number?: string;
    trip_date?: string;  // YYYY-MM-DD
    region?: string;  // Север/Юг
    contract?: string;
    client_id?: number;
    client_name?: string;
    direction?: string;
    type?: string;
    people_count?: number;
    time_of_day?: string;  // Утро/Вечер
    submission_time?: string;
    departure_time?: string;
    route_start?: string;
    route_waypoints?: string[];
    route_end?: string;
    trip_type?: string;
    executor?: string;
    vehicle_id?: number;
    vehicle_plate?: string;
    driver_id?: number;
    driver_name?: string;
    driver_phone?: string;
    price_without_vat?: number;
    price_with_vat?: number;
    created_at?: string;
    updated_at?: string;
}
