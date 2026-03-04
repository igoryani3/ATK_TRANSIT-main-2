'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard/calendar', label: 'Календарь', icon: '📅' },
        { href: '/dashboard/routes', label: 'Маршруты', icon: '🗺️' },
        { href: '/dashboard/calculator', label: 'Калькулятор', icon: '🧮' },
        { href: '/dashboard/sync', label: 'Синхронизация с Google Sheets', icon: '🔄' },
        { href: '/dashboard/references', label: 'Справочники', icon: '📚' },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname?.startsWith(href);
    };

    return (
        <div className="w-64 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-2xl font-bold text-white">ATK Transit</h1>
                <p className="text-sm text-slate-400 mt-1">CRM System</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg
                            transition-all duration-200
                            ${isActive(item.href)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }
                        `}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
                <div className="text-xs text-slate-500 text-center">
                    © 2026 ATK Transit
                </div>
            </div>
        </div>
    );
}
