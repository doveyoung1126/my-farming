// app/plots/[id]/page.tsx
import { getPlotDetails } from "@/lib/data";
import { notFound } from "next/navigation";
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

    const { plot, cycles } = plotDetails;

    return (
        <div className="h-full flex flex-col bg-slate-50 pb-16">
            <PlotDetailClient plot={plot} cycles={cycles} />
        </div>
    );
}