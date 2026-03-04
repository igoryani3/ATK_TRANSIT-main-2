'use client';

import { useState } from 'react';
import { Executor } from '@/lib/types';

interface ExecutorFormProps {
    executor?: Executor;
    onSubmit: (data: Partial<Executor>) => void;
    onCancel: () => void;
}

export default function ExecutorForm({ executor, onSubmit, onCancel }: ExecutorFormProps) {
    const [formData, setFormData] = useState({
        name: executor?.name || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {executor ? 'Редактировать исполнителя' : 'Добавить исполнителя'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Executor Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Название исполнителя <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            placeholder="ИП Иванов Иван"
                        />
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
                            {executor ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
