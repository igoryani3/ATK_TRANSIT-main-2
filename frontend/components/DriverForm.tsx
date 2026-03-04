'use client';

import { useState } from 'react';
import { Driver, Vehicle, Executor } from '@/lib/types';

interface DriverFormProps {
    driver?: Driver;
    vehicles: Vehicle[];
    executors: Executor[];
    onSubmit: (data: Partial<Driver>) => void;
    onCancel: () => void;
}

export default function DriverForm({ driver, vehicles, executors, onSubmit, onCancel }: DriverFormProps) {
    const [formData, setFormData] = useState({
        full_name: driver?.full_name || '',
        phone: driver?.phone || '',
        documents: driver?.documents || '',
        current_vehicle_plate: driver?.current_vehicle_plate || '',
        executor_id: driver?.executor_id || undefined,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {driver ? 'Изменить текущий автомобиль' : 'Добавить водителя'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Show all fields only when creating new driver */}
                    {!driver && (
                        <>
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Полное имя <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Телефон <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Documents */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Документы
                                </label>
                                <textarea
                                    value={formData.documents}
                                    onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                                    placeholder="Водительские права, медицинская справка и т.д."
                                />
                            </div>

                            {/* Executor */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Исполнитель
                                </label>
                                <select
                                    value={formData.executor_id || ''}
                                    onChange={(e) => setFormData({ ...formData, executor_id: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">-- Не назначен --</option>
                                    {executors.map((executor) => (
                                        <option key={executor.id} value={executor.id}>
                                            {executor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Show driver name when editing */}
                    {driver && (
                        <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                            <p className="text-sm text-slate-400">Водитель</p>
                            <p className="text-white font-medium">{driver.full_name}</p>
                        </div>
                    )}

                    {/* Current Vehicle - always shown */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Текущий автомобиль
                        </label>
                        <select
                            value={formData.current_vehicle_plate}
                            onChange={(e) => setFormData({ ...formData, current_vehicle_plate: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">-- Не назначен --</option>
                            {vehicles.map((vehicle) => (
                                <option key={vehicle.id} value={vehicle.license_plate}>
                                    {vehicle.license_plate} ({vehicle.model})
                                </option>
                            ))}
                        </select>
                    </div>

                    {driver && (
                        <p className="text-xs text-slate-400 mt-2">
                            Для изменения других данных используйте кнопку &quot;Просмотр&quot;
                        </p>
                    )}

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
                            {driver ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
