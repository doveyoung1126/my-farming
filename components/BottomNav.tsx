'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
    { href: '/newdashboard', icon: '🏠', label: '总览', replace: true },
    { href: '/plots', icon: '🏞️', label: '地块', replace: true }, // 新增地块导航项
    { href: '/reports', icon: '📊', label: '分析报告', replace: true },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-top">
            <div className="grid grid-cols-5 gap-1 p-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        replace={item.replace}
                        className={clsx(
                            'flex flex-col items-center p-2 rounded-lg transition-colors',
                            pathname.startsWith(item.href)
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                        )}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs mt-0.5">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}