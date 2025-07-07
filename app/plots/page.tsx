// app/plots/page.tsx
import { getPlots } from "@/lib/data";
import { PlotsClient } from "@/components/plots/PlotsClient";

export default async function PlotsPage() {
    const plots = await getPlots();

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-16">
            <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-800">我的地块</h1>
                <p className="text-sm text-gray-500 mt-1">管理和查看您的所有农田地块。</p>
            </header>

            <main className="flex-1 overflow-y-auto">
                <PlotsClient plots={plots} />
            </main>
        </div>
    );
}