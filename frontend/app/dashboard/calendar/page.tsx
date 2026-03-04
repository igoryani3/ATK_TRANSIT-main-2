'use client';

import { useEffect, useState } from 'react';
import { authAPI, tripsAPI, driversAPI, vehiclesAPI, clientsAPI, executorsAPI, contractProvidersAPI } from '@/lib/api';
import { Trip, Driver, Vehicle, Client, Executor, ContractProvider } from '@/lib/types';
import TripForm from '@/components/TripForm';
import { useRouter } from 'next/navigation';

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

export default function CalendarPage() {
    const router = useRouter();
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [monthSummary, setMonthSummary] = useState<Record<string, number>>({});
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [dayTrips, setDayTrips] = useState<Trip[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [executors, setExecutors] = useState<Executor[]>([]);
    const [contractProviders, setContractProviders] = useState<ContractProvider[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [user, setUser] = useState<any>(null);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [highlightedDates, setHighlightedDates] = useState<Set<string>>(new Set());

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.checkAuth();
            if (response.data.authenticated) {
                setUser(response.data.user);
                loadReferenceData();
            } else {
                router.push('/login');
            }
        } catch (error) {
            router.push('/login');
        }
    };

    const loadReferenceData = async () => {
        try {
            const [driversRes, vehiclesRes, clientsRes, executorsRes, contractProvidersRes] = await Promise.all([
                driversAPI.getAll(),
                vehiclesAPI.getAll(),
                clientsAPI.getAll(),
                executorsAPI.getAll(),
                contractProvidersAPI.getAll(),
            ]);

            setDrivers(driversRes.data);
            setVehicles(vehiclesRes.data);
            setClients(clientsRes.data);
            setExecutors(executorsRes.data);
            setContractProviders(contractProvidersRes.data);
        } catch (error) {
            console.error('Ошибка загрузки справочников:', error);
        }
    };

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
                const res = await tripsAPI.getMonthSummary(monthStr);
                setMonthSummary(res.data);
            } catch (e) {
                console.error('Failed to load month summary', e);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
        // Clear selection when month changes
        setSelectedTrip(null);
        setHighlightedDates(new Set());
    }, [year, month]);

    useEffect(() => {
        if (!selectedDate) {
            setDayTrips([]);
            return;
        }
        const fetchDay = async () => {
            setLoading(true);
            try {
                const res = await tripsAPI.getByDate(selectedDate);
                setDayTrips(res.data);
            } catch (e) {
                console.error('Failed to load trips for date', e);
            } finally {
                setLoading(false);
            }
        };
        fetchDay();
    }, [selectedDate]);

    const handleAddTrip = () => {
        setEditingTrip(null);
        setShowForm(true);
    };

    const handleEditTrip = (trip: Trip) => {
        setEditingTrip(trip);
        setShowForm(true);
    };

    const handleDeleteTrip = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот рейс?')) return;

        try {
            await tripsAPI.delete(id);
            // Reload both summary and day trips
            const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
            const [summaryRes, dayRes] = await Promise.all([
                tripsAPI.getMonthSummary(monthStr),
                selectedDate ? tripsAPI.getByDate(selectedDate) : Promise.resolve({ data: [] })
            ]);
            setMonthSummary(summaryRes.data);
            setDayTrips(dayRes.data);
        } catch (error) {
            console.error('Ошибка удаления рейса:', error);
            alert('Ошибка удаления рейса');
        }
    };

    const handleFormSubmit = async () => {
        setShowForm(false);
        setEditingTrip(null);
        // Reload data
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
        const [summaryRes, dayRes] = await Promise.all([
            tripsAPI.getMonthSummary(monthStr),
            selectedDate ? tripsAPI.getByDate(selectedDate) : Promise.resolve({ data: [] })
        ]);
        setMonthSummary(summaryRes.data);
        setDayTrips(dayRes.data);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingTrip(null);
    };

    const handleTripSelect = async (trip: Trip) => {
        if (selectedTrip?.id === trip.id) {
            // Deselect if clicking the same trip
            setSelectedTrip(null);
            setHighlightedDates(new Set());
            return;
        }

        setSelectedTrip(trip);

        // Find all trips with matching route characteristics
        try {
            const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
            const response = await tripsAPI.getMonthSummary(monthStr);

            // Get all trips for the month
            const allTripsResponse = await tripsAPI.getAll();
            const allTrips = allTripsResponse.data;

            // Filter trips that match the selected trip's route
            const matchingDates = new Set<string>();
            allTrips.forEach((t: Trip) => {
                if (
                    t.direction === trip.direction &&
                    t.route_start === trip.route_start &&
                    t.route_end === trip.route_end &&
                    t.submission_time === trip.submission_time &&
                    t.trip_date
                ) {
                    const tripDate = new Date(t.trip_date);
                    if (tripDate.getFullYear() === year && tripDate.getMonth() === month) {
                        matchingDates.add(t.trip_date);
                    }
                }
            });

            setHighlightedDates(matchingDates);
        } catch (error) {
            console.error('Ошибка поиска совпадающих рейсов:', error);
        }
    };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

    const handlePrevMonth = () => {
        if (month === 0) {
            setYear(year - 1);
            setMonth(11);
        } else {
            setMonth(month - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 11) {
            setYear(year + 1);
            setMonth(0);
        } else {
            setMonth(month + 1);
        }
    };

    const canEdit = user?.role === 'admin' || user?.role === 'dispatcher';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white">
            <h1 className="text-3xl font-bold mb-4">Календарь рейсов</h1>
            <div className="flex items-center justify-center mb-4 space-x-4">
                <button onClick={handlePrevMonth} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded">
                    ← Пред.
                </button>
                <span className="text-xl font-medium">
                    {new Date(year, month).toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleNextMonth} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded">
                    След. →
                </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                    <div key={d} className="font-semibold text-slate-300">{d}</div>
                ))}
                {Array.from({ length: firstDayWeekday }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const count = monthSummary[dateStr] ?? 0;
                    const isToday = dateStr === today.toISOString().slice(0, 10);
                    const isSelected = dateStr === selectedDate;
                    const isHighlighted = highlightedDates.has(dateStr);

                    let className = 'p-2 rounded transition-colors ';
                    if (isSelected) {
                        className += 'bg-blue-600 hover:bg-blue-700';
                    } else if (isHighlighted) {
                        className += 'bg-purple-600/60 hover:bg-purple-600/80 ring-2 ring-purple-400/30';
                    } else if (isToday) {
                        className += 'bg-slate-800 outline outline-2 outline-white/40 outline-offset-2 hover:bg-slate-700';
                    } else {
                        className += 'bg-slate-800 hover:bg-slate-700';
                    }

                    return (
                        <button
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={className}
                        >
                            <div className="flex justify-between items-center">
                                <span>{day}</span>
                                {count > 0 && (
                                    <span className="text-xs bg-green-600 rounded-full px-1">{count}</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            {selectedDate && (
                <div className="mt-6">
                    <div className="mb-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">
                            Рейсы на {selectedDate} ({dayTrips.length})
                        </h2>
                        {canEdit && (
                            <button
                                onClick={handleAddTrip}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                            >
                                + Добавить рейс
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 text-center text-slate-400">
                            Загрузка...
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-900/50">
                                        <tr className="text-left text-sm text-slate-300">
                                            <th className="px-4 py-3 font-medium">Название</th>
                                            <th className="px-4 py-3 font-medium">Начало</th>
                                            <th className="px-4 py-3 font-medium">Конец</th>
                                            <th className="px-4 py-3 font-medium">Подача</th>
                                            <th className="px-4 py-3 font-medium">Цена</th>
                                            {canEdit && <th className="px-4 py-3 font-medium">Действия</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {dayTrips.length === 0 ? (
                                            <tr>
                                                <td colSpan={canEdit ? 6 : 5} className="px-4 py-8 text-center text-slate-500">
                                                    Нет рейсов в этот день. {canEdit ? 'Добавьте первый рейс.' : ''}
                                                </td>
                                            </tr>
                                        ) : (
                                            dayTrips.map((trip) => (
                                                <tr
                                                    key={trip.id}
                                                    onClick={() => handleTripSelect(trip)}
                                                    className={`text-slate-200 transition-colors cursor-pointer ${
                                                        selectedTrip?.id === trip.id
                                                            ? 'bg-purple-600/15 hover:bg-purple-600/25'
                                                            : 'hover:bg-slate-700/30'
                                                    }`}
                                                >
                                                    <td className="px-4 py-3">{trip.direction || '-'}</td>
                                                    <td className="px-4 py-3">{trip.route_start || '-'}</td>
                                                    <td className="px-4 py-3">{trip.route_end || '-'}</td>
                                                    <td className="px-4 py-3">{trip.submission_time || '-'}</td>
                                                    <td className="px-4 py-3">{trip.price_without_vat ? `${trip.price_without_vat} ₽` : '-'}</td>
                                                    {canEdit && (
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    onClick={() => handleEditTrip(trip)}
                                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                                                >
                                                                    Изменить
                                                                </button>
                                                                <button
                                                                    onClick={() => trip.id && handleDeleteTrip(trip.id)}
                                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                                                >
                                                                    Удалить
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Trip Form Modal */}
            {showForm && (
                <TripForm
                    trip={editingTrip}
                    drivers={drivers}
                    vehicles={vehicles}
                    clients={clients}
                    executors={executors}
                    contractProviders={contractProviders}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}
        </div>
    );
}
