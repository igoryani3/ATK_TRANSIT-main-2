'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authAPI, driversAPI } from '@/lib/api';
import { Driver } from '@/lib/types';

export default function DriverDetailPage() {
    const router = useRouter();
    const params = useParams();
    const driverId = params?.id as string;
    const [driver, setDriver] = useState<Driver | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Driver>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.checkAuth();
            if (response.data.authenticated) {
                loadDriver();
            } else {
                router.push('/login');
            }
        } catch (error) {
            router.push('/login');
        }
    };

    const loadDriver = async () => {
        try {
            setLoading(true);
            const response = await driversAPI.getById(Number(driverId));
            setDriver(response.data);
            setFormData(response.data);
        } catch (error) {
            console.error('Ошибка загрузки водителя:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await driversAPI.update(Number(driverId), formData);
            await loadDriver();
            setEditMode(false);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(driver || {});
        setEditMode(false);
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('ru-RU');
        } catch {
            return '-';
        }
    };

    const getDocumentStatus = (available: boolean | undefined) => {
        return available ? (
            <span className="text-green-400">✓ Есть</span>
        ) : (
            <span className="text-red-400">✗ Нет</span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-white text-xl">Загрузка...</div>
            </div>
        );
    }

    if (!driver) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-white text-xl">Водитель не найден</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard/references')}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            ← Назад
                        </button>
                        <h1 className="text-3xl font-bold text-white">{driver.full_name}</h1>
                    </div>
                    <div className="flex gap-2">
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Редактировать
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    {saving ? 'Сохранение...' : 'Сохранить'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    Отмена
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Личная информация</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">ФИО</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={formData.full_name || ''}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-white">{driver.full_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Дата рождения</label>
                                {editMode ? (
                                    <input
                                        type="date"
                                        value={formData.birth_date || ''}
                                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                                    />
                                ) : (
                                    <p className="text-white">{formatDate(driver.birth_date)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Телефон</label>
                                {editMode ? (
                                    <input
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-white font-mono">{driver.phone || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Резервный телефон</label>
                                {editMode ? (
                                    <input
                                        type="tel"
                                        value={formData.backup_phone || ''}
                                        onChange={(e) => setFormData({ ...formData, backup_phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-white font-mono">{driver.backup_phone || '-'}</p>
                                )}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm text-slate-400 mb-1">Трудоустройство</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={formData.employment_status || ''}
                                        onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-white">{driver.employment_status || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Driver's License */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Водительское удостоверение</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Серия, номер</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={formData.license_series_number || ''}
                                        onChange={(e) => setFormData({ ...formData, license_series_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-white font-mono">{driver.license_series_number || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Наличие</label>
                                {editMode ? (
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.license_available || false}
                                            onChange={(e) => setFormData({ ...formData, license_available: e.target.checked })}
                                            className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                                        />
                                        <span className="text-white">Есть в наличии</span>
                                    </label>
                                ) : (
                                    <p>{getDocumentStatus(driver.license_available)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Дата выдачи</label>
                                {editMode ? (
                                    <input
                                        type="date"
                                        value={formData.license_issue_date || ''}
                                        onChange={(e) => setFormData({ ...formData, license_issue_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                                    />
                                ) : (
                                    <p className="text-white">{formatDate(driver.license_issue_date)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Дата окончания</label>
                                {editMode ? (
                                    <input
                                        type="date"
                                        value={formData.license_expiry_date || ''}
                                        onChange={(e) => setFormData({ ...formData, license_expiry_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                                    />
                                ) : (
                                    <p className="text-white">{formatDate(driver.license_expiry_date)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Passport */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Паспорт</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Серия, номер</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={formData.passport_series_number || ''}
                                        onChange={(e) => setFormData({ ...formData, passport_series_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-white font-mono">{driver.passport_series_number || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Наличие</label>
                                {editMode ? (
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.passport_available || false}
                                            onChange={(e) => setFormData({ ...formData, passport_available: e.target.checked })}
                                            className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                                        />
                                        <span className="text-white">Есть в наличии</span>
                                    </label>
                                ) : (
                                    <p>{getDocumentStatus(driver.passport_available)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Дата выдачи</label>
                                {editMode ? (
                                    <input
                                        type="date"
                                        value={formData.passport_issue_date || ''}
                                        onChange={(e) => setFormData({ ...formData, passport_issue_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                                    />
                                ) : (
                                    <p className="text-white">{formatDate(driver.passport_issue_date)}</p>
                                )}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm text-slate-400 mb-1">Кем выдан</label>
                                {editMode ? (
                                    <textarea
                                        value={formData.passport_issued_by || ''}
                                        onChange={(e) => setFormData({ ...formData, passport_issued_by: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-white">{driver.passport_issued_by || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SNILS */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">СНИЛС</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Номер</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={formData.snils_number || ''}
                                        onChange={(e) => setFormData({ ...formData, snils_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-white font-mono">{driver.snils_number || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Наличие</label>
                                {editMode ? (
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.snils_available || false}
                                            onChange={(e) => setFormData({ ...formData, snils_available: e.target.checked })}
                                            className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                                        />
                                        <span className="text-white">Есть в наличии</span>
                                    </label>
                                ) : (
                                    <p>{getDocumentStatus(driver.snils_available)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tachograph Card */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Карта водителя (Тахограф)</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Номер</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={formData.tachograph_number || ''}
                                        onChange={(e) => setFormData({ ...formData, tachograph_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-white font-mono">{driver.tachograph_number || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Наличие</label>
                                {editMode ? (
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.tachograph_available || false}
                                            onChange={(e) => setFormData({ ...formData, tachograph_available: e.target.checked })}
                                            className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                                        />
                                        <span className="text-white">Есть в наличии</span>
                                    </label>
                                ) : (
                                    <p>{getDocumentStatus(driver.tachograph_available)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Дата выдачи</label>
                                {editMode ? (
                                    <input
                                        type="date"
                                        value={formData.tachograph_issue_date || ''}
                                        onChange={(e) => setFormData({ ...formData, tachograph_issue_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                                    />
                                ) : (
                                    <p className="text-white">{formatDate(driver.tachograph_issue_date)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Дата окончания</label>
                                {editMode ? (
                                    <input
                                        type="date"
                                        value={formData.tachograph_expiry_date || ''}
                                        onChange={(e) => setFormData({ ...formData, tachograph_expiry_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                                    />
                                ) : (
                                    <p className="text-white">{formatDate(driver.tachograph_expiry_date)}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
