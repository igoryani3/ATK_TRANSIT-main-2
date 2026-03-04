'use client';

import { useState } from 'react';
import { Client } from '@/lib/types';

interface CustomerFormProps {
    customer?: Client;
    onSubmit: (data: Partial<Client>) => void;
    onCancel: () => void;
}

export default function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
    const [formData, setFormData] = useState({
        company_name: customer?.company_name || '',
        contact_info: customer?.contact_info || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">
                    {customer ? 'Редактировать заказчика' : 'Добавить заказчика'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Название компании <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.company_name}
                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            placeholder="ООО &quot;Пример&quot;"
                        />
                    </div>

                    {/* Contact Info */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Контактная информация
                        </label>
                        <textarea
                            value={formData.contact_info}
                            onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                            placeholder="Телефон, email, адрес и т.д."
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
                            {customer ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
