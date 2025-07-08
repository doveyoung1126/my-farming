// components/plots/PlotsClient.tsx
'use client';

import { PrismaPlots } from "@/lib/types";
import Link from "next/link";
import { LandPlot, Square, Archive } from 'lucide-react';

export function PlotsClient({ plots, showArchived }: { plots: PrismaPlots[], showArchived: boolean }) {

    if (plots.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-slate-500">{showArchived ? "没有找到已归档的地块。" : "还没有添加任何地块。"}</p>
                {!showArchived && <p className="text-slate-500 mt-2">点击下方按钮添加您的第一个地块吧！</p>}
            </div>
        );
    }

    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plots.map(plot => (
                <Link
                    key={plot.id}
                    href={`/plots/${plot.id}`}
                    className={`block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-200 ${plot.isArchived ? 'opacity-60 hover:opacity-80' : ''}`}
                >
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                                <LandPlot className="w-6 h-6 text-emerald-600 mr-3" />
                                <h3 className="font-bold text-lg text-slate-800">{plot.name}</h3>
                            </div>
                            {plot.isArchived && (
                                <Archive className="w-5 h-5 text-slate-500" />
                            )}
                        </div>
                        <div className="flex justify-between items-center text-sm text-slate-600">
                            <div className="flex items-center">
                                <Square className="w-4 h-4 text-slate-400 mr-1" />
                                <span>面积: {plot.area} 亩</span>
                            </div>
                            {plot.crop && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${plot.isArchived ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-800'}`}>
                                    作物: {plot.crop}
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
