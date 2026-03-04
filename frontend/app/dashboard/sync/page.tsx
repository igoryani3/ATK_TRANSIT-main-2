'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function SyncPage() {
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.checkAuth();
            if (!response.data.authenticated) {
                router.push('/login');
            }
        } catch (error) {
            router.push('/login');
        }
    };

    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">🔄</div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Синхронизация с Google Sheets
                </h1>
                <p className="text-xl text-slate-400">
                    Раздел в разработке
                </p>
            </div>
        </div>
    );
}
