'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, templatesAPI, clientsAPI, driversAPI, vehiclesAPI, executorsAPI, contractProvidersAPI } from '@/lib/api';
import { Client, Driver, Vehicle, Executor, ContractProvider } from '@/lib/types';
import TripForm from '@/components/TripForm';

interface Template {
    id?: number;
    customer_id: number | null;
    customer_name?: string;
    route_name: string;
    start_point: string;
    end_point: string;
    route_type: string;
    pickup_time: string;
    departure_time: string;
    capacity: number | null;
    price_excl_vat: number | null;
    weekdays: string[];
    last_trip_date?: string | null;
    end_date?: string | null;
    region?: string;
    contract?: string;
    type?: string;
    time_of_day?: string;
    executor?: string;
    vehicle_id?: number | null;
    driver_id?: number | null;
    driver_phone?: string;
}

const WEEKDAYS = [
    { value: 'monday', label: 'Пн' },
    { value: 'tuesday', label: 'Вт' },
    { value: 'wednesday', label: 'Ср' },
    { value: 'thursday', label: 'Чт' },
    { value: 'friday', label: 'Пт' },
    { value: 'saturday', label: 'Сб' },
    { value: 'sunday', label: 'Вс' },
];

export default function RoutesPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [executors, setExecutors] = useState<Executor[]>([]);
    const [contractProviders, setContractProviders] = useState<ContractProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);
    const [user, setUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [generating, setGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.checkAuth();
            if (response.data.authenticated) {
                setUser(response.data.user);
                loadData();
            } else {
                router.push('/login');
            }
        } catch (error) {
            router.push('/login');
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [templatesRes, clientsRes, driversRes, vehiclesRes, executorsRes, contractProvidersRes] = await Promise.all([
                templatesAPI.getAll(activeTab === 'archived'),
                clientsAPI.getAll(),
                driversAPI.getAll(),
                vehiclesAPI.getAll(),
                executorsAPI.getAll(),
                contractProvidersAPI.getAll(),
            ]);
            setTemplates(templatesRes.data);
            setClients(clientsRes.data);
            setDrivers(driversRes.data);
            setVehicles(vehiclesRes.data);
            setExecutors(executorsRes.data);
            setContractProviders(contractProvidersRes.data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [activeTab, user]);

    const handleAddTemplate = () => {
        setEditingTemplate(null);
        setShowForm(true);
    };

    const handleEditTemplate = (template: Template) => {
        setEditingTemplate(template);
        setShowForm(true);
    };

    const handleDeleteTemplate = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот шаблон?')) return;

        try {
            await templatesAPI.delete(id);
            await loadData();
        } catch (error) {
            console.error('Ошибка удаления шаблона:', error);
            alert('Ошибка удаления шаблона');
        }
    };

    const handleDeleteTemplateTrips = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить все рейсы, созданные из этого шаблона? Это действие нельзя отменить.')) return;

        try {
            const response = await templatesAPI.deleteTrips(id);
            alert(`Удалено рейсов: ${response.data.deleted_count}`);
            await loadData();
        } catch (error) {
            console.error('Ошибка удаления рейсов:', error);
            alert('Ошибка удаления рейсов');
        }
    };

    const handleGenerateTrips = async () => {
        if (!confirm('Синхронизировать рейсы из активных шаблонов? Будут созданы рейсы согласно выбранным дням недели до даты окончания каждого шаблона.')) return;

        try {
            setGenerating(true);
            const response = await templatesAPI.generateTrips(30);
            const msg = `Синхронизация завершена!\n\nСоздано рейсов: ${response.data.created}\nПропущено (уже существуют): ${response.data.skipped}`;
            const archMsg = response.data.archived > 0 ? `\nАрхивировано шаблонов: ${response.data.archived}` : '';
            alert(msg + archMsg);
            await loadData();
        } catch (error) {
            console.error('Ошибка синхронизации рейсов:', error);
            alert('Ошибка синхронизации рейсов');
        } finally {
            setGenerating(false);
        }
    };

    const handleArchiveTemplate = async (id: number) => {
        if (!confirm('Переместить шаблон в архив?')) return;

        try {
            await templatesAPI.archive(id);
            await loadData();
        } catch (error) {
            console.error('Ошибка архивирования шаблона:', error);
            alert('Ошибка архивирования шаблона');
        }
    };

    const handleUnarchiveTemplate = async (id: number) => {
        if (!confirm('Восстановить шаблон из архива?')) return;

        try {
            await templatesAPI.unarchive(id);
            await loadData();
        } catch (error) {
            console.error('Ошибка восстановления шаблона:', error);
            alert('Ошибка восстановления шаблона');
        }
    };

    const canEdit = user?.role === 'admin' || user?.role === 'dispatcher';

    const filteredTemplates = templates.filter(template => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            template.route_name?.toLowerCase().includes(query) ||
            template.customer_name?.toLowerCase().includes(query) ||
            template.start_point?.toLowerCase().includes(query) ||
            template.end_point?.toLowerCase().includes(query) ||
            template.route_type?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">Шаблоны маршрутов ({templates.length})</h1>
                <div className="flex gap-3">
                    {canEdit && (
                        <>
                            <button
                                onClick={handleGenerateTrips}
                                disabled={generating}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-lg"
                            >
                                {generating ? '⏳ Синхронизация...' : '🔄 Синхронизировать рейсы'}
                            </button>
                            <button
                                onClick={handleAddTemplate}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                            >
                                + Добавить шаблон
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'active'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        Активные ({activeTab === 'active' ? templates.length : '...'})
                    </button>
                    <button
                        onClick={() => setActiveTab('archived')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'archived'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        Архив ({activeTab === 'archived' ? templates.length : '...'})
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="🔍 Поиск по названию, заказчику, точкам маршрута..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-sm">
                        <thead className="bg-slate-900/50">
                            <tr className="text-left text-xs text-slate-300">
                                <th className="px-3 py-2 font-medium w-[22%]">Название</th>
                                <th className="px-3 py-2 font-medium w-[17%]">Начало</th>
                                <th className="px-3 py-2 font-medium w-[17%]">Конец</th>
                                <th className="px-3 py-2 font-medium w-[9%]">Подача</th>
                                <th className="px-3 py-2 font-medium w-[9%]">Цена</th>
                                {canEdit && <th className="px-3 py-2 font-medium w-[26%]">Действия</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredTemplates.length === 0 ? (
                                <tr>
                                    <td colSpan={canEdit ? 6 : 5} className="px-4 py-8 text-center text-slate-500">
                                        {searchQuery ? 'Ничего не найдено.' : 'Нет шаблонов.'} {!searchQuery && canEdit ? 'Добавьте первый шаблон.' : ''}
                                    </td>
                                </tr>
                            ) : (
                                filteredTemplates.map((template) => (
                                    <tr key={template.id} className="text-slate-200 hover:bg-slate-700/30 transition-colors">
                                        <td className="px-3 py-2 truncate">{template.route_name}</td>
                                        <td className="px-3 py-2 truncate">{template.start_point || '-'}</td>
                                        <td className="px-3 py-2 truncate">{template.end_point || '-'}</td>
                                        <td className="px-3 py-2">{template.pickup_time || '-'}</td>
                                        <td className="px-3 py-2">
                                            {template.price_excl_vat ? `${template.price_excl_vat} ₽` : '-'}
                                        </td>
                                        {canEdit && (
                                            <td className="px-2 py-2 align-top">
                                                <div className="flex flex-wrap gap-1">
                                                    {activeTab === 'active' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditTemplate(template)}
                                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                                            >
                                                                Изменить
                                                            </button>
                                                            <button
                                                                onClick={() => template.id && handleDeleteTemplateTrips(template.id)}
                                                                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors"
                                                            >
                                                                Удалить рейсы
                                                            </button>
                                                            <button
                                                                onClick={() => template.id && handleArchiveTemplate(template.id)}
                                                                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                                                            >
                                                                В архив
                                                            </button>
                                                            <button
                                                                onClick={() => template.id && handleDeleteTemplate(template.id)}
                                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                                            >
                                                                Удалить
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => setViewingTemplate(template)}
                                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                                            >
                                                                Просмотр
                                                            </button>
                                                            <button
                                                                onClick={() => template.id && handleUnarchiveTemplate(template.id)}
                                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                                                            >
                                                                Восстановить
                                                            </button>
                                                            <button
                                                                onClick={() => template.id && handleDeleteTemplate(template.id)}
                                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                                            >
                                                                Удалить
                                                            </button>
                                                        </>
                                                    )}
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

            {/* Form Modal */}
            {showForm && (
                <TripForm
                    trip={null}
                    drivers={drivers}
                    vehicles={vehicles}
                    clients={clients}
                    executors={executors}
                    contractProviders={contractProviders}
                    onSubmit={() => {
                        setShowForm(false);
                        loadData();
                    }}
                    onCancel={() => setShowForm(false)}
                    mode="template"
                    template={editingTemplate}
                />
            )}

            {/* View Modal */}
            {viewingTemplate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700">
                            <h2 className="text-2xl font-bold text-white">
                                Просмотр шаблона
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Название маршрута
                                    </label>
                                    <p className="text-white">{viewingTemplate.route_name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Заказчик
                                    </label>
                                    <p className="text-white">{viewingTemplate.customer_name || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Начало маршрута
                                    </label>
                                    <p className="text-white">{viewingTemplate.start_point || '-'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Конец маршрута
                                    </label>
                                    <p className="text-white">{viewingTemplate.end_point || '-'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Тип маршрута
                                </label>
                                <p className="text-white">{viewingTemplate.route_type || '-'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Время подачи
                                    </label>
                                    <p className="text-white">{viewingTemplate.pickup_time || '-'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Время выезда
                                    </label>
                                    <p className="text-white">{viewingTemplate.departure_time || '-'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    Дни недели
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {viewingTemplate.weekdays && viewingTemplate.weekdays.length > 0 ? (
                                        viewingTemplate.weekdays.map(day => {
                                            const dayLabel = WEEKDAYS.find(d => d.value === day)?.label || day;
                                            return (
                                                <span key={day} className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                                                    {dayLabel}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <p className="text-white">-</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Вместимость
                                    </label>
                                    <p className="text-white">{viewingTemplate.capacity || '-'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Цена без НДС
                                    </label>
                                    <p className="text-white">{viewingTemplate.price_excl_vat ? `${viewingTemplate.price_excl_vat} ₽` : '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Последний рейс
                                    </label>
                                    <p className="text-white">{viewingTemplate.last_trip_date || '-'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Дата окончания
                                    </label>
                                    <p className="text-white">{viewingTemplate.end_date || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-700 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setViewingTemplate(null)}
                                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
