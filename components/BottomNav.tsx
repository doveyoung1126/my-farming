'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
    { href: '/dashboard', icon: '🏠', label: '概览', replace: true },
    { href: '/records', icon: '💰', label: '财务', replace: true },
    { href: '/activities', icon: '🌱', label: '农事', replace: true },
    { href: '/alerts', icon: '🔔', label: '提醒', replace: true },
    { href: '/settings', icon: '⚙️', label: '设置', replace: true }
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