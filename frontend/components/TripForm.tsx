'use client';

import { useState, useEffect, useRef } from 'react';
import { tripsAPI, directionsAPI, executorsAPI, contractProvidersAPI } from '@/lib/api';
import { Trip, Driver, Vehicle, Client, Direction, DirectionVariant, Executor, ContractProvider } from '@/lib/types';

// Helper function to add 10 minutes to time
const addTenMinutes = (time: string): string => {
    if (!time) return '00:10';
    const [hours, minutes] = time.split(':').map(Number);
    let newMinutes = minutes + 10;
    let newHours = hours;

    if (newMinutes >= 60) {
        newMinutes = 0;
        newHours = (hours + 1) % 24;
    }

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

// Helper function to subtract 10 minutes from time
const subtractTenMinutes = (time: string): string => {
    if (!time) return '23:50';
    const [hours, minutes] = time.split(':').map(Number);
    let newMinutes = minutes - 10;
    let newHours = hours;

    if (newMinutes < 0) {
        newMinutes = 50;
        newHours = hours === 0 ? 23 : hours - 1;
    }

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

interface TripFormProps {
    trip: Trip | null;
    drivers: Driver[];
    vehicles: Vehicle[];
    clients: Client[];
    executors?: Executor[];
    contractProviders?: ContractProvider[];
    onSubmit: () => void;
    onCancel: () => void;
    mode?: 'trip' | 'template';
    template?: any; // Template data if editing template
}

export default function TripForm({ trip, drivers, vehicles, clients, executors = [], contractProviders = [], onSubmit, onCancel, mode = 'trip', template }: TripFormProps) {
    const [formData, setFormData] = useState<Trip>({
        region: '',
        contract: '',
        client_id: undefined,
        direction: '',
        type: '',
        people_count: undefined,
        time_of_day: '',
        submission_time: '',
        departure_time: '',
        route_start: '',
        route_waypoints: [],
        route_end: '',
        trip_type: '',
        executor: '',
        vehicle_id: undefined,
        driver_id: undefined,
        driver_phone: '',
        price_without_vat: undefined,
        price_with_vat: undefined,
    });

    // Template-specific state
    const [weekdays, setWeekdays] = useState<string[]>([]);
    const [endDate, setEndDate] = useState<string>('');

    const [waypointsText, setWaypointsText] = useState('');
    const [loading, setLoading] = useState(false);
    const [directions, setDirections] = useState<Direction[]>([]);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
    const [directionSearch, setDirectionSearch] = useState('');
    const [showDirectionDropdown, setShowDirectionDropdown] = useState(false);
    const [filteredDirections, setFilteredDirections] = useState<Direction[]>([]);
    const directionInputRef = useRef<HTMLDivElement>(null);

    // Customer search states
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [filteredCustomers, setFilteredCustomers] = useState<Client[]>([]);
    const customerInputRef = useRef<HTMLDivElement>(null);

    // Driver search states
    const [driverSearch, setDriverSearch] = useState('');
    const [showDriverDropdown, setShowDriverDropdown] = useState(false);
    const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
    const driverInputRef = useRef<HTMLDivElement>(null);

    // Vehicle search states
    const [vehicleSearch, setVehicleSearch] = useState('');
    const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
    const vehicleInputRef = useRef<HTMLDivElement>(null);

    // Executor search states
    const [executorSearch, setExecutorSearch] = useState('');
    const [showExecutorDropdown, setShowExecutorDropdown] = useState(false);
    const [filteredExecutors, setFilteredExecutors] = useState<Executor[]>([]);
    const [selectedExecutorId, setSelectedExecutorId] = useState<number | null>(null);
    const executorInputRef = useRef<HTMLDivElement>(null);

    // Contract Provider search states
    const [contractProviderSearch, setContractProviderSearch] = useState('');
    const [showContractProviderDropdown, setShowContractProviderDropdown] = useState(false);
    const [filteredContractProviders, setFilteredContractProviders] = useState<ContractProvider[]>([]);
    const contractProviderInputRef = useRef<HTMLDivElement>(null);

    // Collapsible sections state
    const [sectionsCollapsed, setSectionsCollapsed] = useState({
        basic: false,
        route: false,
        execution: false,
        pricing: false,
        schedule: false,
    });

    const toggleSection = (section: keyof typeof sectionsCollapsed) => {
        setSectionsCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const WEEKDAYS = [
        { value: 'monday', label: 'Пн' },
        { value: 'tuesday', label: 'Вт' },
        { value: 'wednesday', label: 'Ср' },
        { value: 'thursday', label: 'Чт' },
        { value: 'friday', label: 'Пт' },
        { value: 'saturday', label: 'Сб' },
        { value: 'sunday', label: 'Вс' }
    ];

    // Load directions on mount
    useEffect(() => {
        loadDirections();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (directionInputRef.current && !directionInputRef.current.contains(event.target as Node)) {
                setShowDirectionDropdown(false);
            }
            if (customerInputRef.current && !customerInputRef.current.contains(event.target as Node)) {
                setShowCustomerDropdown(false);
            }
            if (driverInputRef.current && !driverInputRef.current.contains(event.target as Node)) {
                setShowDriverDropdown(false);
            }
            if (vehicleInputRef.current && !vehicleInputRef.current.contains(event.target as Node)) {
                setShowVehicleDropdown(false);
            }
            if (executorInputRef.current && !executorInputRef.current.contains(event.target as Node)) {
                setShowExecutorDropdown(false);
            }
            if (contractProviderInputRef.current && !contractProviderInputRef.current.contains(event.target as Node)) {
                setShowContractProviderDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadDirections = async () => {
        try {
            const response = await directionsAPI.getAll();
            setDirections(response.data);
        } catch (error) {
            console.error('Ошибка загрузки направлений:', error);
        }
    };

    useEffect(() => {
        if (trip) {
            setFormData(trip);
            setWaypointsText(trip.route_waypoints?.join('\n') || '');
            setDirectionSearch(trip.direction || '');

            // Initialize customer search
            const customer = clients.find(c => c.id === trip.client_id);
            setCustomerSearch(customer?.company_name || '');

            // Initialize driver search
            const driver = drivers.find(d => d.id === trip.driver_id);
            setDriverSearch(driver?.full_name || '');

            // Initialize vehicle search
            const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
            setVehicleSearch(vehicle?.license_plate || '');

            // Initialize executor search and ID
            const executor = executors.find(e => e.name === trip.executor);
            setExecutorSearch(trip.executor || '');
            setSelectedExecutorId(executor?.id || null);

            // Initialize contract provider search
            setContractProviderSearch(trip.contract || '');
        } else if (template) {
            // Initialize from template
            setFormData({
                region: template.region || '',
                contract: template.contract || '',
                client_id: template.customer_id,
                direction: template.route_name || '',
                type: template.type || '',
                people_count: template.capacity ? Math.floor(template.capacity) : undefined,
                time_of_day: template.time_of_day || '',
                submission_time: template.pickup_time || '',
                departure_time: template.departure_time || '',
                route_start: template.start_point || '',
                route_waypoints: [],
                route_end: template.end_point || '',
                trip_type: template.route_type || '',
                executor: template.executor || '',
                vehicle_id: template.vehicle_id,
                driver_id: template.driver_id,
                driver_phone: template.driver_phone || '',
                price_without_vat: template.price_excl_vat,
                price_with_vat: template.price_excl_vat ? template.price_excl_vat * 1.22 : undefined,
            });
            setWeekdays(template.weekdays || []);
            setEndDate(template.end_date || '');
            setDirectionSearch(template.route_name || '');

            // Initialize searches
            const customer = clients.find(c => c.id === template.customer_id);
            setCustomerSearch(customer?.company_name || '');

            const driver = drivers.find(d => d.id === template.driver_id);
            setDriverSearch(driver?.full_name || '');

            const vehicle = vehicles.find(v => v.id === template.vehicle_id);
            setVehicleSearch(vehicle?.license_plate || '');

            const executor = executors.find(e => e.name === template.executor);
            setExecutorSearch(template.executor || '');
            setSelectedExecutorId(executor?.id || null);

            setContractProviderSearch(template.contract || '');
        }
    }, [trip, template, clients, drivers, vehicles, executors]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const waypoints = waypointsText
                .split('\n')
                .map(w => w.trim())
                .filter(w => w.length > 0);

            if (mode === 'template') {
                // Template submission
                const { templatesAPI } = await import('@/lib/api');
                const submitData = {
                    customer_id: formData.client_id,
                    route_name: formData.direction,
                    start_point: formData.route_start,
                    end_point: formData.route_end,
                    route_type: formData.trip_type,
                    pickup_time: formData.submission_time,
                    departure_time: formData.departure_time,
                    capacity: formData.people_count,
                    price_excl_vat: formData.price_without_vat,
                    region: formData.region,
                    contract: formData.contract,
                    type: formData.type,
                    time_of_day: formData.time_of_day,
                    executor: formData.executor,
                    vehicle_id: formData.vehicle_id,
                    driver_id: formData.driver_id,
                    driver_phone: formData.driver_phone,
                    weekdays: weekdays,
                    end_date: endDate || null
                };

                if (template?.id) {
                    await templatesAPI.update(template.id, submitData);
                } else {
                    await templatesAPI.create(submitData);
                }
            } else {
                // Trip submission
                const submitData = {
                    ...formData,
                    route_waypoints: waypoints,
                };

                if (trip?.id) {
                    await tripsAPI.update(trip.id, submitData);
                } else {
                    await tripsAPI.create(submitData);
                }
            }

            onSubmit();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof Trip, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Auto-calculate price with VAT when price without VAT changes
        if (field === 'price_without_vat' && value) {
            const priceWithoutVat = Number(value);
            if (!isNaN(priceWithoutVat) && priceWithoutVat > 0) {
                const priceWithVat = priceWithoutVat * 1.22; // +22% VAT
                setFormData(prev => ({ ...prev, price_with_vat: Number(priceWithVat.toFixed(2)) }));
            }
        }
    };

    const handleDirectionSearchChange = (searchText: string) => {
        setDirectionSearch(searchText);

        if (searchText.trim() === '') {
            setFilteredDirections(directions);
            setShowDirectionDropdown(true);
            return;
        }

        const filtered = directions.filter(dir =>
            dir.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredDirections(filtered);
        setShowDirectionDropdown(true);
    };

    const handleDirectionSelect = (directionName: string) => {
        const direction = directions.find(d => d.name === directionName);
        if (!direction) return;

        setFormData(prev => ({ ...prev, direction: directionName }));
        setDirectionSearch(directionName);
        setShowDirectionDropdown(false);

        if (direction.variants.length === 1) {
            applyVariant(direction.variants[0]);
        } else {
            setSelectedDirection(direction);
            setShowVariantModal(true);
        }
    };

    // Customer search handlers
    const handleCustomerSearchChange = (searchText: string) => {
        setCustomerSearch(searchText);

        if (searchText.trim() === '') {
            setFilteredCustomers(clients);
            setShowCustomerDropdown(true);
            return;
        }

        const filtered = clients.filter(client =>
            client.company_name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredCustomers(filtered);
        setShowCustomerDropdown(true);
    };

    const handleCustomerSelect = (client: Client) => {
        setFormData(prev => ({ ...prev, client_id: client.id, client_name: client.company_name }));
        setCustomerSearch(client.company_name);
        setShowCustomerDropdown(false);
    };

    // Driver search handlers
    const handleDriverSearchChange = (searchText: string) => {
        setDriverSearch(searchText);

        // Filter drivers by selected executor
        const executorFilteredDrivers = selectedExecutorId
            ? drivers.filter(d => d.executor_id === selectedExecutorId)
            : drivers;

        if (searchText.trim() === '') {
            setFilteredDrivers(executorFilteredDrivers);
            setShowDriverDropdown(true);
            return;
        }

        const filtered = executorFilteredDrivers.filter(driver =>
            driver.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
            driver.phone.includes(searchText)
        );
        setFilteredDrivers(filtered);
        setShowDriverDropdown(true);
    };

    const handleDriverSelect = (driver: Driver) => {
        setFormData(prev => ({ ...prev, driver_id: driver.id, driver_name: driver.full_name, driver_phone: driver.phone }));
        setDriverSearch(driver.full_name);
        setShowDriverDropdown(false);
    };

    // Vehicle search handlers
    const handleVehicleSearchChange = (searchText: string) => {
        setVehicleSearch(searchText);

        // Filter vehicles by selected executor
        const executorFilteredVehicles = selectedExecutorId
            ? vehicles.filter(v => v.executor_id === selectedExecutorId)
            : vehicles;

        if (searchText.trim() === '') {
            setFilteredVehicles(executorFilteredVehicles);
            setShowVehicleDropdown(true);
            return;
        }

        const filtered = executorFilteredVehicles.filter(vehicle =>
            vehicle.license_plate.toLowerCase().includes(searchText.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredVehicles(filtered);
        setShowVehicleDropdown(true);
    };

    const handleVehicleSelect = (vehicle: Vehicle) => {
        setFormData(prev => ({ ...prev, vehicle_id: vehicle.id, vehicle_plate: vehicle.license_plate }));
        setVehicleSearch(vehicle.license_plate);
        setShowVehicleDropdown(false);
    };

    // Executor search handlers
    const handleExecutorSearchChange = (searchText: string) => {
        setExecutorSearch(searchText);

        if (searchText.trim() === '') {
            setFilteredExecutors(executors);
            setShowExecutorDropdown(true);
            return;
        }

        const filtered = executors.filter(executor =>
            executor.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredExecutors(filtered);
        setShowExecutorDropdown(true);
    };

    const handleExecutorSelect = (executor: Executor) => {
        setFormData(prev => ({ ...prev, executor: executor.name }));
        setExecutorSearch(executor.name);
        setShowExecutorDropdown(false);
        setSelectedExecutorId(executor.id);

        // Clear driver and vehicle selections when executor changes
        setDriverSearch('');
        setVehicleSearch('');
        setFormData(prev => ({ ...prev, driver_id: undefined, driver_name: '', driver_phone: '', vehicle_id: undefined, vehicle_plate: '' }));
    };

    // Contract Provider search handlers
    const handleContractProviderSearchChange = (searchText: string) => {
        setContractProviderSearch(searchText);

        if (searchText.trim() === '') {
            setFilteredContractProviders(contractProviders);
            setShowContractProviderDropdown(true);
            return;
        }

        const filtered = contractProviders.filter(provider =>
            provider.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredContractProviders(filtered);
        setShowContractProviderDropdown(true);
    };

    const handleContractProviderSelect = (provider: ContractProvider) => {
        setFormData(prev => ({ ...prev, contract: provider.name }));
        setContractProviderSearch(provider.name);
        setShowContractProviderDropdown(false);
    };

    const toggleWeekday = (day: string) => {
        setWeekdays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const handleEndDateChange = (newEndDate: string) => {
        setEndDate(newEndDate);

        if (!newEndDate) {
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const end = new Date(newEndDate);
        end.setHours(0, 0, 0, 0);

        if (end < today) {
            return;
        }

        const weekdaysSet = new Set<string>();
        const current = new Date(today);

        while (current <= end) {
            const dayOfWeek = current.getDay();
            const weekdayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            weekdaysSet.add(weekdayMap[dayOfWeek]);
            current.setDate(current.getDate() + 1);
        }

        setWeekdays(Array.from(weekdaysSet));
    };

    const applyVariant = (variant: DirectionVariant) => {
        const matchedClient = clients.find(c => c.company_name === variant.client);

        const priceWithVat = variant.price_excl_vat
            ? Number((variant.price_excl_vat * 1.22).toFixed(2))
            : undefined;

        setFormData(prev => ({
            ...prev,
            client_id: matchedClient?.id,
            client_name: variant.client,
            route_start: variant.start_point,
            route_end: variant.end_point,
            trip_type: variant.route_type,
            submission_time: variant.pickup_time || '',
            departure_time: variant.departure_time || '',
            price_without_vat: variant.price_excl_vat || undefined,
            price_with_vat: priceWithVat,
            people_count: variant.capacity ? Math.floor(variant.capacity) : undefined,
        }));
        setShowVariantModal(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">
                            {mode === 'template'
                                ? (template ? 'Редактирование шаблона' : 'Новый шаблон')
                                : (trip ? 'Редактирование рейса' : 'Новый рейс')
                            }
                        </h2>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-slate-400 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 space-y-6">
                        {/* Основная информация */}
                        <div>
                            <button
                                type="button"
                                onClick={() => toggleSection('basic')}
                                className="w-full flex items-center text-lg font-semibold text-white mb-4 hover:text-blue-400 transition-colors"
                            >
                                <span className="mr-2">{sectionsCollapsed.basic ? '+' : '-'}</span>
                                <span>Основная информация</span>
                            </button>

                            {!sectionsCollapsed.basic && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Север/Юг
                                        </label>
                                        <select
                                            value={formData.region || ''}
                                            onChange={(e) => handleChange('region', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Выберите...</option>
                                            <option value="Север">Север</option>
                                            <option value="Юг">Юг</option>
                                        </select>
                                    </div>

                                    <div className="relative" ref={contractProviderInputRef}>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Договор
                                        </label>
                                        <input
                                            type="text"
                                            value={contractProviderSearch}
                                            onChange={(e) => handleContractProviderSearchChange(e.target.value)}
                                            onFocus={() => {
                                                if (contractProviderSearch.trim() === '') {
                                                    setFilteredContractProviders(contractProviders);
                                                    setShowContractProviderDropdown(true);
                                                } else if (filteredContractProviders.length > 0) {
                                                    setShowContractProviderDropdown(true);
                                                }
                                            }}
                                            placeholder="Начните вводить название договора..."
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {showContractProviderDropdown && filteredContractProviders.length > 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                                {filteredContractProviders.map(provider => (
                                                    <button
                                                        key={provider.id}
                                                        type="button"
                                                        onClick={() => handleContractProviderSelect(provider)}
                                                        className="w-full text-left px-4 py-2 hover:bg-slate-700 text-white transition-colors border-b border-slate-700 last:border-b-0"
                                                    >
                                                        <div className="text-sm">{provider.name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {showContractProviderDropdown && contractProviderSearch && filteredContractProviders.length === 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl px-4 py-3 text-slate-400 text-sm">
                                                Договоры не найдены
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative" ref={customerInputRef}>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Заказчик (ЮЛ)
                                        </label>
                                        <input
                                            type="text"
                                            value={customerSearch}
                                            onChange={(e) => handleCustomerSearchChange(e.target.value)}
                                            onFocus={() => {
                                                if (customerSearch.trim() === '') {
                                                    setFilteredCustomers(clients);
                                                    setShowCustomerDropdown(true);
                                                } else if (filteredCustomers.length > 0) {
                                                    setShowCustomerDropdown(true);
                                                }
                                            }}
                                            placeholder="Начните вводить название компании..."
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {showCustomerDropdown && filteredCustomers.length > 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                                {filteredCustomers.map(client => (
                                                    <button
                                                        key={client.id}
                                                        type="button"
                                                        onClick={() => handleCustomerSelect(client)}
                                                        className="w-full text-left px-4 py-2 hover:bg-slate-700 text-white transition-colors border-b border-slate-700 last:border-b-0"
                                                    >
                                                        <div className="text-sm">{client.company_name}</div>
                                                        {client.contact_info && (
                                                            <div className="text-xs text-slate-400 mt-1">{client.contact_info}</div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {showCustomerDropdown && customerSearch && filteredCustomers.length === 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl px-4 py-3 text-slate-400 text-sm">
                                                Заказчики не найдены
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Тип
                                        </label>
                                        <select
                                            value={formData.type || ''}
                                            onChange={(e) => handleChange('type', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Выберите...</option>
                                            <option value="Развозка">Развозка</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Количество человек
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.people_count || ''}
                                            onChange={(e) => handleChange('people_count', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Утро/Вечер
                                        </label>
                                        <select
                                            value={formData.time_of_day || ''}
                                            onChange={(e) => handleChange('time_of_day', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Выберите...</option>
                                            <option value="Утро">Утро</option>
                                            <option value="Вечер">Вечер</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Подача
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.submission_time || ''}
                                            onChange={(e) => {
                                                const newSubmissionTime = e.target.value;
                                                const newDepartureTime = addTenMinutes(newSubmissionTime);
                                                setFormData({ ...formData, submission_time: newSubmissionTime, departure_time: newDepartureTime });
                                            }}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Выезд
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.departure_time || ''}
                                            onChange={(e) => {
                                                const newDepartureTime = e.target.value;
                                                const newSubmissionTime = subtractTenMinutes(newDepartureTime);
                                                setFormData({ ...formData, departure_time: newDepartureTime, submission_time: newSubmissionTime });
                                            }}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Маршрут */}
                        <div>
                            <button
                                type="button"
                                onClick={() => toggleSection('route')}
                                className="w-full flex items-center border-t border-slate-700 pt-6 text-lg font-semibold text-white mb-4 hover:text-blue-400 transition-colors"
                            >
                                <span className="mr-2">{sectionsCollapsed.route ? '+' : '-'}</span>
                                <span>Маршрут</span>
                            </button>

                            {!sectionsCollapsed.route && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative" ref={directionInputRef}>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Направление
                                        </label>
                                        <input
                                            type="text"
                                            value={directionSearch}
                                            onChange={(e) => handleDirectionSearchChange(e.target.value)}
                                            onFocus={() => {
                                                if (directionSearch.trim() === '') {
                                                    setFilteredDirections(directions);
                                                    setShowDirectionDropdown(true);
                                                } else if (filteredDirections.length > 0) {
                                                    setShowDirectionDropdown(true);
                                                }
                                            }}
                                            placeholder="Начните вводить название направления..."
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {showDirectionDropdown && filteredDirections.length > 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                                {filteredDirections.map(dir => (
                                                    <button
                                                        key={dir.name}
                                                        type="button"
                                                        onClick={() => handleDirectionSelect(dir.name)}
                                                        className="w-full text-left px-4 py-2 hover:bg-slate-700 text-white transition-colors border-b border-slate-700 last:border-b-0"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm">{dir.name}</span>
                                                            <span className="text-xs text-slate-400">
                                                                {dir.variants.length} вариант{dir.variants.length > 1 ? 'ов' : ''}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {showDirectionDropdown && directionSearch && filteredDirections.length === 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl px-4 py-3 text-slate-400 text-sm">
                                                Направления не найдены
                                            </div>
                                        )}
                                    </div>

                                    <div></div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Начало маршрута
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.route_start || ''}
                                            onChange={(e) => handleChange('route_start', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Окончание маршрута
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.route_end || ''}
                                            onChange={(e) => handleChange('route_end', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Тип рейса
                                        </label>
                                        <select
                                            value={formData.trip_type || ''}
                                            onChange={(e) => handleChange('trip_type', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Выберите тип --</option>
                                            <option value="Прямой">Прямой</option>
                                            <option value="Круг">Круг</option>
                                            <option value="1/2 круга">1/2 круга</option>
                                            <option value="Полукруг">Полукруг</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Промежуточные точки (каждая с новой строки)
                                        </label>
                                        <textarea
                                            value={waypointsText}
                                            onChange={(e) => setWaypointsText(e.target.value)}
                                            rows={3}
                                            placeholder={"Точка 1\nТочка 2\nТочка 3"}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Исполнение */}
                        <div>
                            <button
                                type="button"
                                onClick={() => toggleSection('execution')}
                                className="w-full flex items-center border-t border-slate-700 pt-6 text-lg font-semibold text-white mb-4 hover:text-blue-400 transition-colors"
                            >
                                <span className="mr-2">{sectionsCollapsed.execution ? '+' : '-'}</span>
                                <span>Исполнение</span>
                            </button>

                            {!sectionsCollapsed.execution && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative" ref={executorInputRef}>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Исполнитель
                                        </label>
                                        <input
                                            type="text"
                                            value={executorSearch}
                                            onChange={(e) => handleExecutorSearchChange(e.target.value)}
                                            onFocus={() => {
                                                if (executorSearch.trim() === '') {
                                                    setFilteredExecutors(executors);
                                                    setShowExecutorDropdown(true);
                                                } else if (filteredExecutors.length > 0) {
                                                    setShowExecutorDropdown(true);
                                                }
                                            }}
                                            placeholder="Начните вводить название исполнителя..."
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {showExecutorDropdown && filteredExecutors.length > 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                                {filteredExecutors.map(executor => (
                                                    <button
                                                        key={executor.id}
                                                        type="button"
                                                        onClick={() => handleExecutorSelect(executor)}
                                                        className="w-full text-left px-4 py-2 hover:bg-slate-700 text-white transition-colors border-b border-slate-700 last:border-b-0"
                                                    >
                                                        <div className="text-sm">{executor.name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {showExecutorDropdown && executorSearch && filteredExecutors.length === 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl px-4 py-3 text-slate-400 text-sm">
                                                Исполнители не найдены
                                            </div>
                                        )}
                                    </div>

                                    <div></div>

                                    <div className="relative" ref={vehicleInputRef}>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Гос. номер (Машина)
                                        </label>
                                        <input
                                            type="text"
                                            value={vehicleSearch}
                                            onChange={(e) => handleVehicleSearchChange(e.target.value)}
                                            onFocus={() => {
                                                const executorFilteredVehicles = selectedExecutorId
                                                    ? vehicles.filter(v => v.executor_id === selectedExecutorId)
                                                    : vehicles;
                                                if (vehicleSearch.trim() === '') {
                                                    setFilteredVehicles(executorFilteredVehicles);
                                                    setShowVehicleDropdown(true);
                                                } else if (filteredVehicles.length > 0) {
                                                    setShowVehicleDropdown(true);
                                                }
                                            }}
                                            placeholder="Начните вводить гос. номер или модель..."
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {showVehicleDropdown && filteredVehicles.length > 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                                {filteredVehicles.map(vehicle => (
                                                    <button
                                                        key={vehicle.id}
                                                        type="button"
                                                        onClick={() => handleVehicleSelect(vehicle)}
                                                        className="w-full text-left px-4 py-2 hover:bg-slate-700 text-white transition-colors border-b border-slate-700 last:border-b-0"
                                                    >
                                                        <div className="text-sm font-mono font-medium">{vehicle.license_plate}</div>
                                                        <div className="text-xs text-slate-400 mt-1">{vehicle.model}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {showVehicleDropdown && vehicleSearch && filteredVehicles.length === 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl px-4 py-3 text-slate-400 text-sm">
                                                Автомобили не найдены
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative" ref={driverInputRef}>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Водитель
                                        </label>
                                        <input
                                            type="text"
                                            value={driverSearch}
                                            onChange={(e) => handleDriverSearchChange(e.target.value)}
                                            onFocus={() => {
                                                const executorFilteredDrivers = selectedExecutorId
                                                    ? drivers.filter(d => d.executor_id === selectedExecutorId)
                                                    : drivers;
                                                if (driverSearch.trim() === '') {
                                                    setFilteredDrivers(executorFilteredDrivers);
                                                    setShowDriverDropdown(true);
                                                } else if (filteredDrivers.length > 0) {
                                                    setShowDriverDropdown(true);
                                                }
                                            }}
                                            placeholder="Начните вводить имя или телефон..."
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {showDriverDropdown && filteredDrivers.length > 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                                {filteredDrivers.map(driver => (
                                                    <button
                                                        key={driver.id}
                                                        type="button"
                                                        onClick={() => handleDriverSelect(driver)}
                                                        className="w-full text-left px-4 py-2 hover:bg-slate-700 text-white transition-colors border-b border-slate-700 last:border-b-0"
                                                    >
                                                        <div className="text-sm">{driver.full_name}</div>
                                                        <div className="text-xs text-slate-400 mt-1">{driver.phone}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {showDriverDropdown && driverSearch && filteredDrivers.length === 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl px-4 py-3 text-slate-400 text-sm">
                                                Водители не найдены
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Номер водителя
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.driver_phone || ''}
                                            onChange={(e) => handleChange('driver_phone', e.target.value)}
                                            placeholder="+7 (999) 123-45-67"
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Цены */}
                        <div>
                            <button
                                type="button"
                                onClick={() => toggleSection('pricing')}
                                className="w-full flex items-center border-t border-slate-700 pt-6 text-lg font-semibold text-white mb-4 hover:text-blue-400 transition-colors"
                            >
                                <span className="mr-2">{sectionsCollapsed.pricing ? '+' : '-'}</span>
                                <span>Стоимость</span>
                            </button>

                            {!sectionsCollapsed.pricing && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Цена без НДС (₽)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.price_without_vat || ''}
                                            onChange={(e) => handleChange('price_without_vat', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Цена с НДС (₽)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.price_with_vat || ''}
                                            onChange={(e) => handleChange('price_with_vat', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* VAT Display */}
                                    {formData.price_with_vat && (
                                        <div className="col-span-2">
                                            <p className="text-sm text-green-400 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-600">
                                                Автоматически рассчитано: {formData.price_with_vat.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽ (+22% НДС)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Template-specific fields */}
                        {mode === 'template' && (
                            <div>
                                <button
                                    type="button"
                                    onClick={() => toggleSection('schedule')}
                                    className="w-full flex items-center border-t border-slate-700 pt-6 text-lg font-semibold text-white mb-4 hover:text-blue-400 transition-colors"
                                >
                                    <span className="mr-2">{sectionsCollapsed.schedule ? '+' : '-'}</span>
                                    <span>Расписание шаблона</span>
                                </button>

                                {!sectionsCollapsed.schedule && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Дни недели
                                            </label>
                                            <div className="flex gap-2">
                                                {WEEKDAYS.map(day => (
                                                    <button
                                                        key={day.value}
                                                        type="button"
                                                        onClick={() => toggleWeekday(day.value)}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${weekdays.includes(day.value)
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                            }`}
                                                    >
                                                        {day.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Дата окончания (опционально)
                                            </label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => handleEndDateChange(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                                            />
                                            <p className="text-xs text-slate-400 mt-1">
                                                При выборе даты окончания дни недели выставятся автоматически
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 px-6 py-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            {loading ? 'Сохранение...' : (
                                mode === 'template'
                                    ? (template ? 'Сохранить шаблон' : 'Создать шаблон')
                                    : (trip ? 'Сохранить рейс' : 'Создать рейс')
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Variant Selection Modal */}
            {showVariantModal && selectedDirection && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto mx-4">
                        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">
                                Выберите вариант маршрута
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowVariantModal(false)}
                                className="text-slate-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-slate-300 mb-4">
                                Направление: <span className="font-semibold text-white">{selectedDirection.name}</span>
                            </p>
                            <p className="text-sm text-slate-400 mb-6">
                                Найдено вариантов: {selectedDirection.variants.length}
                            </p>

                            <div className="space-y-3">
                                {selectedDirection.variants.map((variant, index) => (
                                    <button
                                        key={variant.key}
                                        type="button"
                                        onClick={() => applyVariant(variant)}
                                        className="w-full text-left p-4 bg-slate-900/50 hover:bg-slate-700/50 border border-slate-600 hover:border-blue-500 rounded-lg transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs text-slate-500">Вариант #{index + 1}</span>
                                            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                                                {variant.route_type}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <span className="text-sm text-slate-400 w-32">Клиент:</span>
                                                <span className="text-sm text-white">{variant.client}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-slate-400 w-32">Начало:</span>
                                                <span className="text-sm text-white">{variant.start_point}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-slate-400 w-32">Конец:</span>
                                                <span className="text-sm text-white">{variant.end_point}</span>
                                            </div>
                                            {variant.pickup_time && (
                                                <div className="flex items-center">
                                                    <span className="text-sm text-slate-400 w-32">Время посадки:</span>
                                                    <span className="text-sm text-white">{variant.pickup_time}</span>
                                                </div>
                                            )}
                                            {variant.departure_time && (
                                                <div className="flex items-center">
                                                    <span className="text-sm text-slate-400 w-32">Время отправл.:</span>
                                                    <span className="text-sm text-white">{variant.departure_time}</span>
                                                </div>
                                            )}
                                            {variant.price_excl_vat && (
                                                <div className="flex items-center">
                                                    <span className="text-sm text-slate-400 w-32">Цена (без НДС):</span>
                                                    <span className="text-sm text-white">{variant.price_excl_vat} ₽</span>
                                                </div>
                                            )}
                                            {variant.capacity && (
                                                <div className="flex items-center">
                                                    <span className="text-sm text-slate-400 w-32">Мест:</span>
                                                    <span className="text-sm text-white">{variant.capacity}</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
