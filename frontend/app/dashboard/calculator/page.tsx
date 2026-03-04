'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function CalculatorPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.checkAuth();
            if (response.data.authenticated) {
                setUser(response.data.user);
            } else {
                router.push('/login');
            }
        } catch (error) {
            router.push('/login');
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-white text-xl">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Калькулятор</h1>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-12 text-center">
                    <div className="text-6xl mb-6">🧮</div>
                    <h2 className="text-2xl font-semibold text-white mb-4">
                        Раздел в разработке
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Функционал калькулятора будет доступен в ближайшее время
                    </p>
                </div>
            </div>
        </div>
    );
}
