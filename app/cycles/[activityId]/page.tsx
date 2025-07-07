import { getCycleDetailsById } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function CycleDetailPage({ params }: { params: Promise<{ activityId: string }> }) {
    const { activityId } = await params
    const actId = parseInt(activityId, 10);
    if (isNaN(actId)) {
        notFound();
    }

    const cycle = await getCycleDetailsById(actId);

    if (!cycle) {
        notFound();
    }

    return (
        <div>
            <h1>Cycle Details</h1>
            <p>Cycle ID: {cycle.id}</p>
            <p>Plot: {cycle.plot.name}</p>
            <p>Start Date: {cycle.start.toLocaleDateString()}</p>
            <p>End Date: {cycle.end ? cycle.end.toLocaleDateString() : 'Ongoing'}</p>
            <p>Budget: {cycle.budget}</p>
            <h2>Activities</h2>
            <ul>
                {cycle.activities.map(activity => (
                    <li key={activity.id}>
                        {activity.date.toLocaleDateString()} - {activity.type}
                    </li>
                ))}
            </ul>
        </div>
    );
}