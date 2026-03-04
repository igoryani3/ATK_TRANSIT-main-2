'use client';

import { useState } from 'react';
import { Template, Client } from '@/lib/types';

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

interface TemplateFormProps {
    template?: Template;
    clients: Client[];
    onSubmit: (data: Partial<Template>) => void;
    onCancel: () => void;
}

export default function TemplateForm({ template, clients, onSubmit, onCancel }: TemplateFormProps) {
    const [formData, setFormData] = useState({
        customer_id: template?.customer_id || 0,
        route_name: template?.route_name || '',
        start_point: template?.start_point || '',
        end_point: template?.end_point || '',
        route_type: template?.route_type || '',
        pickup_time: template?.pickup_time || '',
        departure_time: template?.departure_time || '',
        capacity: template?.capacity || 0,
        price_excl_vat: template?.price_excl_vat || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl border border-slate-700 my-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {template ? 'Редактировать шаблон' : 'Добавить шаблон маршрута'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Customer */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Заказчик <span className="text-red-400">*</span>
                            </label>
                            <select
                                required
                                value={formData.customer_id}
                                onChange={(e) => setFormData({ ...formData, customer_id: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            >
                                <option value={0}>-- Выберите заказчика --</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.company_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Route Name */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Название маршрута <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.route_name}
                                onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                placeholder="Например: Москва - Санкт-Петербург"
                            />
                        </div>

                        {/* Start Point */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Начальная точка
                            </label>
                            <input
                                type="text"
                                value={formData.start_point}
                                onChange={(e) => setFormData({ ...formData, start_point: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* End Point */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Конечная точка
                            </label>
                            <input
                                type="text"
                                value={formData.end_point}
                                onChange={(e) => setFormData({ ...formData, end_point: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Route Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Тип маршрута
                            </label>
                            <input
                                type="text"
                                value={formData.route_type}
                                onChange={(e) => setFormData({ ...formData, route_type: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                placeholder="Прямой, 1/2 круга и т.д."
                            />
                        </div>

                        {/* Pickup Time */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Время подачи
                            </label>
                            <input
                                type="time"
                                value={formData.pickup_time || ''}
                                onChange={(e) => {
                                    const newPickupTime = e.target.value;
                                    const newDepartureTime = addTenMinutes(newPickupTime);
                                    setFormData({ ...formData, pickup_time: newPickupTime, departure_time: newDepartureTime });
                                }}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
                            />
                        </div>

                        {/* Departure Time */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Время отправления
                            </label>
                            <input
                                type="time"
                                value={formData.departure_time || ''}
                                onChange={(e) => {
                                    const newDepartureTime = e.target.value;
                                    const newPickupTime = subtractTenMinutes(newDepartureTime);
                                    setFormData({ ...formData, departure_time: newDepartureTime, pickup_time: newPickupTime });
                                }}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
                            />
                        </div>

                        {/* Capacity */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Вместимость
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Цена без НДС (₽)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price_excl_vat}
                                onChange={(e) => setFormData({ ...formData, price_excl_vat: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* VAT Display */}
                        {formData.price_excl_vat > 0 && (
                            <div className="col-span-2">
                                <p className="text-sm text-green-400 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
                                    С НДС: {(formData.price_excl_vat * 1.22).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽ (+22%)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            {template ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
