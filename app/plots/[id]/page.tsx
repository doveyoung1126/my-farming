// app/plots/[id]/page.tsx
import { getPlotDetails } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PlotDetailClient } from "@/components/plots/PlotDetailClient";

export default async function PlotDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const plotId = parseInt(id, 10);
    if (isNaN(plotId)) {
        notFound();
    }

    const plotDetails = await getPlotDetails(plotId);

    if (!plotDetails) {
        notFound();
    }

    const { plot, activities, cycles, summary } = plotDetails;

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-16">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center">
                <Link href="/plots" className="mr-4 p-2 rounded-full hover:bg-slate-100" replace>
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{plot.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        面积: {plot.area} 亩 {plot.crop && `· 当前作物: ${plot.crop}`}
                    </p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                {/* 地块汇总数据 */}
                <div className="p-4">
                    <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-lg overflow-hidden shadow">
                        <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总收入</p><p className="text-base font-bold text-green-600">¥{summary.cycleIncome.toLocaleString()}</p></div>
                        <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">总支出</p><p className="text-base font-bold text-red-600">¥{Math.abs(summary.cycleExpense).toLocaleString()}</p></div>
                        <div className="bg-white p-3 text-center"><p className="text-xs text-slate-500 mb-1">净利润</p><p className={`text-base font-bold ${(summary.cycleProfit) >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>¥{summary.cycleProfit.toLocaleString()}</p></div>
                    </div>
                </div>

                <PlotDetailClient cycles={cycles} />
            </main>
        </div>
    );
}