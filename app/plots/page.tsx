// app/plots/page.tsx
import { getPlots } from "@/lib/data";
import { PlotsClient } from "@/components/features/plots/PlotsClient";
import { PlotsHeader } from "@/components/layout/PlotsHeader"; // 引入新的 Header
import { Suspense } from "react";

export default async function PlotsPage(
    props: {
        searchParams?: Promise<{
            showArchived?: string;
        }>;
    }
) {
    const searchParams = await props.searchParams;
    const showArchived = searchParams?.showArchived === 'true';
    const plots = await getPlots(showArchived);

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-16">
            <Suspense>
                <PlotsHeader showArchived={showArchived} /> {/* 使用新的 Header 组件 */}
            </Suspense>
            <main className="flex-1 overflow-y-auto">
                <PlotsClient plots={plots} showArchived={showArchived} />
            </main>
        </div>
    );
}