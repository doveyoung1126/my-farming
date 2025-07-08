// app/plots/page.tsx
import { getPlots } from "@/lib/data";
import { PlotsClient } from "@/components/plots/PlotsClient";
import { PlotsHeader } from "@/components/plots/PlotsHeader"; // 引入新的 Header

export default async function PlotsPage({
    searchParams,
}: {
    searchParams?: {
        showArchived?: string;
    };
}) {
    const showArchived = searchParams?.showArchived === 'true';
    const plots = await getPlots(showArchived);

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-16">
            <PlotsHeader showArchived={showArchived} /> {/* 使用新的 Header 组件 */}
            <main className="flex-1 overflow-y-auto">
                <PlotsClient plots={plots} showArchived={showArchived} />
            </main>
        </div>
    );
}