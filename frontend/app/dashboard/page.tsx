'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/calendar');
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
            <div className="text-white text-xl">Перенаправление...</div>
        </div>
    );
}
