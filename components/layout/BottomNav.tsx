'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { BarChart, HelpCircle, Home, LandPlot } from 'lucide-react';

const navItems = [
    { href: '/newdashboard', icon: Home, label: '总览' },
    { href: '/plots', icon: LandPlot, label: '地块' },
    { href: '/reports', icon: BarChart, label: '报告' },
    { href: '/help', icon: HelpCircle, label: '帮助' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-60">
            <div className="grid grid-cols-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/newdashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'flex flex-col items-center justify-center text-center py-2 transition-colors duration-200',
                                isActive
                                    ? 'text-emerald-600'
                                    : 'text-slate-500 hover:bg-slate-100'
                            )}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-xs mt-1">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}