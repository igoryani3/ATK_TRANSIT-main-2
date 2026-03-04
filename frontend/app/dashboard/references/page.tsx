'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, driversAPI, vehiclesAPI, clientsAPI, templatesAPI, executorsAPI, contractProvidersAPI } from '@/lib/api';
import { Driver, Vehicle, Client, Template, Executor, ContractProvider } from '@/lib/types';
import DriverForm from '@/components/DriverForm';
import CustomerForm from '@/components/CustomerForm';
import TemplateForm from '@/components/TemplateForm';
import VehicleForm from '@/components/VehicleForm';
import ExecutorForm from '@/components/ExecutorForm';
import ContractProviderForm from '@/components/ContractProviderForm';

type Tab = 'drivers' | 'customers' | 'templates' | 'vehicles' | 'executors' | 'contracts';

export default function ReferencesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('drivers');
    const [loading, setLoading] = useState(true);

    // Data states
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [executors, setExecutors] = useState<Executor[]>([]);
    const [contractProviders, setContractProviders] = useState<ContractProvider[]>([]);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.checkAuth();
            if (response.data.authenticated) {
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
            const [driversRes, vehiclesRes, clientsRes, templatesRes, executorsRes, contractProvidersRes] = await Promise.all([
                driversAPI.getAll(),
                vehiclesAPI.getAll(),
                clientsAPI.getAll(),
                templatesAPI.getAll('all'),
                executorsAPI.getAll(),
                contractProvidersAPI.getAll(),
            ]);

            setDrivers(driversRes.data);
            setVehicles(vehiclesRes.data);
            setClients(clientsRes.data);
            setTemplates(templatesRes.data);
            setExecutors(executorsRes.data);
            setContractProviders(contractProvidersRes.data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'drivers' as Tab, label: 'Водители', icon: '👥', count: drivers.length },
        { id: 'customers' as Tab, label: 'Заказчики', icon: '🏢', count: clients.length },
        { id: 'templates' as Tab, label: 'Шаблоны маршрутов', icon: '📋', count: templates.length },
        { id: 'vehicles' as Tab, label: 'Автомобили', icon: '🚙', count: vehicles.length },
        { id: 'executors' as Tab, label: 'Исполнители', icon: '👔', count: executors.length },
        { id: 'contracts' as Tab, label: 'Договоры', icon: '📄', count: contractProviders.length },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-white text-xl">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="h-full">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">Справочники</h1>
                    <p className="text-sm text-slate-400">Управление справочной информацией</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-slate-800/30 border-b border-slate-700">
                <div className="px-6 flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-3 border-b-2 transition-all
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-white bg-blue-600/10'
                                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }
                            `}
                        >
                            <span>{tab.icon}</span>
                            <span className="font-medium">{tab.label}</span>
                            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'drivers' && <DriversTab drivers={drivers} vehicles={vehicles} executors={executors} onRefresh={loadData} />}
                {activeTab === 'customers' && <CustomersTab clients={clients} onRefresh={loadData} />}
                {activeTab === 'templates' && <TemplatesTab templates={templates} clients={clients} onRefresh={loadData} />}
                {activeTab === 'vehicles' && <VehiclesTab vehicles={vehicles} executors={executors} onRefresh={loadData} />}
                {activeTab === 'executors' && <ExecutorsTab executors={executors} onRefresh={loadData} />}
                {activeTab === 'contracts' && <ContractsTab contractProviders={contractProviders} onRefresh={loadData} />}
            </div>
        </div>
    );
}

// Drivers Tab Component
function DriversTab({ drivers, vehicles, executors, onRefresh }: { drivers: Driver[]; vehicles: Vehicle[]; executors: Executor[]; onRefresh: () => void }) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | undefined>();

    const handleSubmit = async (data: Partial<Driver>) => {
        try {
            if (editingDriver) {
                await driversAPI.update(editingDriver.id, data);
            } else {
                await driversAPI.create(data);
            }
            setShowForm(false);
            setEditingDriver(undefined);
            onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения водителя:', error);
            alert('Ошибка сохранения');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить водителя?')) return;
        try {
            await driversAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Водители ({drivers.length})</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    + Добавить водителя
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700">
                <table className="w-full">
                    <thead className="bg-slate-900/50">
                        <tr className="text-left text-sm text-slate-300">
                            <th className="px-4 py-3">Имя</th>
                            <th className="px-4 py-3">Телефон</th>
                            <th className="px-4 py-3">Текущий автомобиль</th>
                            <th className="px-4 py-3">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {drivers.map((driver) => (
                            <tr key={driver.id} className="text-slate-200 hover:bg-slate-700/30">
                                <td className="px-4 py-3">{driver.full_name}</td>
                                <td className="px-4 py-3">{driver.phone}</td>
                                <td className="px-4 py-3">{driver.current_vehicle_plate || '-'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.push(`/dashboard/drivers/${driver.id}`)}
                                            className="text-green-400 hover:text-green-300"
                                        >
                                            Просмотр
                                        </button>
                                        <button
                                            onClick={() => { setEditingDriver(driver); setShowForm(true); }}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            onClick={() => handleDelete(driver.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <DriverForm
                    driver={editingDriver}
                    vehicles={vehicles}
                    executors={executors}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingDriver(undefined); }}
                />
            )}
        </div>
    );
}

// Customers Tab Component
function CustomersTab({ clients, onRefresh }: { clients: Client[]; onRefresh: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>();

    const handleSubmit = async (data: Partial<Client>) => {
        try {
            if (editingClient) {
                await clientsAPI.update(editingClient.id, data);
            } else {
                await clientsAPI.create(data);
            }
            setShowForm(false);
            setEditingClient(undefined);
            onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения заказчика:', error);
            alert('Ошибка сохранения');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить заказчика?')) return;
        try {
            await clientsAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Заказчики ({clients.length})</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    + Добавить заказчика
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700">
                <table className="w-full">
                    <thead className="bg-slate-900/50">
                        <tr className="text-left text-sm text-slate-300">
                            <th className="px-4 py-3">Компания</th>
                            <th className="px-4 py-3">Контактная информация</th>
                            <th className="px-4 py-3">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {clients.map((client) => (
                            <tr key={client.id} className="text-slate-200 hover:bg-slate-700/30">
                                <td className="px-4 py-3 font-medium">{client.company_name}</td>
                                <td className="px-4 py-3">{client.contact_info || '-'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingClient(client); setShowForm(true); }}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            onClick={() => handleDelete(client.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <CustomerForm
                    customer={editingClient}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingClient(undefined); }}
                />
            )}
        </div>
    );
}

// Templates Tab Component
function TemplatesTab({ templates, clients, onRefresh }: { templates: Template[]; clients: Client[]; onRefresh: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | undefined>();

    const handleSubmit = async (data: Partial<Template>) => {
        try {
            if (editingTemplate) {
                await templatesAPI.update(editingTemplate.id!, data);
            } else {
                await templatesAPI.create(data);
            }
            setShowForm(false);
            setEditingTemplate(undefined);
            onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения шаблона:', error);
            alert('Ошибка сохранения');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить шаблон?')) return;
        try {
            await templatesAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Шаблоны маршрутов ({templates.length})</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    + Добавить шаблон
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700">
                <table className="w-full table-fixed">
                    <thead className="bg-slate-900/50">
                        <tr className="text-left text-sm text-slate-300">
                            <th className="px-4 py-3 w-[28%]">Маршрут</th>
                            <th className="px-4 py-3 w-[22%]">Заказчик</th>
                            <th className="px-4 py-3 w-[24%]">Начало → Конец</th>
                            <th className="px-4 py-3 w-[8%]">Вмест.</th>
                            <th className="px-4 py-3 w-[10%] text-left">Цена без НДС</th>
                            <th className="px-4 py-3 w-[8%]">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {templates.map((template) => (
                            <tr key={template.id} className="text-slate-200 hover:bg-slate-700/30">
                                <td className="px-4 py-3 font-medium truncate">{template.route_name}</td>
                                <td className="px-4 py-3 truncate">{template.customer_name || '-'}</td>
                                <td className="px-4 py-3 text-sm truncate">
                                    {template.start_point || '?'} → {template.end_point || '?'}
                                </td>
                                <td className="px-4 py-3">{template.capacity || '-'}</td>
                                <td className="px-4 py-3 text-left">{template.price_excl_vat ? `${template.price_excl_vat} ₽` : '-'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingTemplate(template); setShowForm(true); }}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id!)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <TemplateForm
                    template={editingTemplate}
                    clients={clients}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingTemplate(undefined); }}
                />
            )}
        </div>
    );
}

// Vehicles Tab Component
function VehiclesTab({ vehicles, executors, onRefresh }: { vehicles: Vehicle[]; executors: Executor[]; onRefresh: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();
    const [selectedOwner, setSelectedOwner] = useState<string>('all');

    // Get unique owners
    const uniqueOwners = Array.from(new Set(vehicles.map(v => v.owner).filter(Boolean))).sort();

    // Filter and sort vehicles
    const filteredVehicles = vehicles
        .filter(v => selectedOwner === 'all' || v.owner === selectedOwner)
        .sort((a, b) => {
            const ownerA = a.owner || '';
            const ownerB = b.owner || '';
            return ownerA.localeCompare(ownerB, 'ru');
        });

    const handleSubmit = async (data: Partial<Vehicle>) => {
        try {
            if (editingVehicle) {
                await vehiclesAPI.update(editingVehicle.id, data);
            } else {
                await vehiclesAPI.create(data);
            }
            setShowForm(false);
            setEditingVehicle(undefined);
            onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения автомобиля:', error);
            alert('Ошибка сохранения');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить автомобиль?')) return;
        try {
            await vehiclesAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">
                        Автомобили ({filteredVehicles.length}{selectedOwner !== 'all' ? ` из ${vehicles.length}` : ''})
                    </h2>
                    <select
                        value={selectedOwner}
                        onChange={(e) => setSelectedOwner(e.target.value)}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Все владельцы</option>
                        {uniqueOwners.map(owner => (
                            <option key={owner} value={owner}>{owner}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    + Добавить автомобиль
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700">
                <table className="w-full">
                    <thead className="bg-slate-900/50">
                        <tr className="text-left text-sm text-slate-300">
                            <th className="px-4 py-3">Гос. номер</th>
                            <th className="px-4 py-3">Модель</th>
                            <th className="px-4 py-3">Вместимость</th>
                            <th className="px-4 py-3">Владелец</th>
                            <th className="px-4 py-3">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredVehicles.map((vehicle) => (
                            <tr key={vehicle.id} className="text-slate-200 hover:bg-slate-700/30">
                                <td className="px-4 py-3 font-mono font-medium">{vehicle.license_plate}</td>
                                <td className="px-4 py-3">{vehicle.model}</td>
                                <td className="px-4 py-3">{vehicle.capacity || '-'}</td>
                                <td className="px-4 py-3">{vehicle.owner || '-'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingVehicle(vehicle); setShowForm(true); }}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vehicle.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <VehicleForm
                    vehicle={editingVehicle}
                    executors={executors}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingVehicle(undefined); }}
                />
            )}
        </div>
    );
}

// Executors Tab Component
function ExecutorsTab({ executors, onRefresh }: { executors: Executor[]; onRefresh: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [editingExecutor, setEditingExecutor] = useState<Executor | undefined>();

    const handleSubmit = async (data: Partial<Executor>) => {
        try {
            if (editingExecutor) {
                await executorsAPI.update(editingExecutor.id, data);
            } else {
                await executorsAPI.create(data);
            }
            setShowForm(false);
            setEditingExecutor(undefined);
            onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения исполнителя:', error);
            alert('Ошибка сохранения');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить исполнителя?')) return;
        try {
            await executorsAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Исполнители ({executors.length})</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    + Добавить исполнителя
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700">
                <table className="w-full">
                    <thead className="bg-slate-900/50">
                        <tr className="text-left text-sm text-slate-300">
                            <th className="px-4 py-3">Название</th>
                            <th className="px-4 py-3">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {executors.map((executor) => (
                            <tr key={executor.id} className="text-slate-200 hover:bg-slate-700/30">
                                <td className="px-4 py-3">{executor.name}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingExecutor(executor); setShowForm(true); }}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            onClick={() => handleDelete(executor.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <ExecutorForm
                    executor={editingExecutor}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingExecutor(undefined); }}
                />
            )}
        </div>
    );
}

// Contracts Tab Component
function ContractsTab({ contractProviders, onRefresh }: { contractProviders: ContractProvider[]; onRefresh: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [editingProvider, setEditingProvider] = useState<ContractProvider | undefined>();

    const handleSubmit = async (data: Partial<ContractProvider>) => {
        try {
            if (editingProvider) {
                await contractProvidersAPI.update(editingProvider.id, data);
            } else {
                await contractProvidersAPI.create(data);
            }
            setShowForm(false);
            setEditingProvider(undefined);
            onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения договора:', error);
            alert('Ошибка сохранения');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить договор?')) return;
        try {
            await contractProvidersAPI.delete(id);
            onRefresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Договоры ({contractProviders.length})</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    + Добавить договор
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700">
                <table className="w-full">
                    <thead className="bg-slate-900/50">
                        <tr className="text-left text-sm text-slate-300">
                            <th className="px-4 py-3">Название</th>
                            <th className="px-4 py-3">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {contractProviders.map((provider) => (
                            <tr key={provider.id} className="text-slate-200 hover:bg-slate-700/30">
                                <td className="px-4 py-3">{provider.name}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingProvider(provider); setShowForm(true); }}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            onClick={() => handleDelete(provider.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <ContractProviderForm
                    provider={editingProvider}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingProvider(undefined); }}
                />
            )}
        </div>
    );
}
