'use client';

import { useState } from 'react';
import { Vehicle, Executor } from '@/lib/types';

interface VehicleFormProps {
    vehicle?: Vehicle;
    executors: Executor[];
    onSubmit: (data: Partial<Vehicle>) => void;
    onCancel: () => void;
}

export default function VehicleForm({ vehicle, executors, onSubmit, onCancel }: VehicleFormProps) {
    const [formData, setFormData] = useState({
        license_plate: vehicle?.license_plate || '',
        model: vehicle?.model || '',
        capacity: vehicle?.capacity || 0,
        owner: vehicle?.owner || '',
        executor_id: vehicle?.executor_id || undefined,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {vehicle ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* License Plate */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Гос. номер <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.license_plate}
                            onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 focus:outline-none"
                            placeholder="А123БВ777"
                        />
                    </div>

                    {/* Model */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Модель <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            placeholder="Mercedes-Benz Sprinter"
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
                            placeholder="Количество пассажиров"
                        />
                    </div>

                    {/* Owner */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Владелец
                        </label>
                        <input
                            type="text"
                            value={formData.owner}
                            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            placeholder="Компания / Партнёр"
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
                            {vehicle ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
