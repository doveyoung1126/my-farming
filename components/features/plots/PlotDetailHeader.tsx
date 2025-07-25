// components/plots/PlotDetailHeader.tsx
'use client';

import { ArrowLeft, Edit, MoreVertical, Archive } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface Plot {
    isArchived: boolean;
    id: number;
    name: string;
    area: number;
    crop: string | null;
}
interface PlotDetailHeaderProps {
    plot: Plot,
    onArchive: () => void
}

export function PlotDetailHeader({
    plot,
    onArchive
}: PlotDetailHeaderProps) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center">
                <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-slate-100">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-800">{plot.name}</h1>
                        {plot.isArchived && (
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-semibold rounded-full">
                                已归档
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        面积: {plot.area} 亩 {plot.crop && `· 当前作物: ${plot.crop}`}
                    </p>
                </div>
            </div>
            <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-slate-100">
                    <MoreVertical className="w-5 h-5 text-slate-600" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1">
                        {plot.isArchived ? <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            disabled // 归档后不可编辑
                        >
                            <Edit className="w-4 h-4 mr-3" />
                            编辑
                        </button> :
                            <Link
                                href={{ query: { editPlot: plot.id.toString() } }}
                                scroll={false}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                aria-label="编辑地块"
                            >
                                <Edit className="w-4 h-4 mr-3" />
                                编辑
                            </Link>}

                        <button
                            onClick={() => { onArchive(); setIsMenuOpen(false); }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            <Archive className="w-4 h-4 mr-3" />
                            {plot.isArchived ? '恢复' : '归档'}
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
