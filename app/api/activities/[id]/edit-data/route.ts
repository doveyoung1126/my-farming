
import { NextResponse } from 'next/server';
import {
  getActivityById,
  getPlots,
  getActivityTypes,
  getRecordCategoryTypes,
} from '@/lib/data';

// This route handler fetches all the necessary data for the EditActivityForm.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const activityId = parseInt(id, 10);

  if (isNaN(activityId)) {
    return NextResponse.json({ message: 'Invalid activity ID' }, { status: 400 });
  }

  try {
    // Fetch all data in parallel for maximum efficiency.
    const [activity, plots, activityTypes, recordCategoryTypes] = await Promise.all([
      getActivityById(activityId),
      getPlots(false), // Fetch only active (non-archived) plots
      getActivityTypes(),
      getRecordCategoryTypes(),
    ]);

    if (!activity) {
      return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
    }

    // Return the combined data as a JSON response.
    return NextResponse.json({
      activity,
      plots,
      activityTypes,
      recordCategoryTypes,
    });

  } catch (error) {
    // If any of the database queries fail, return a 500 error.
    console.error(`API Error: Failed to fetch edit data for activity ${activityId}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch required form data.' },
      { status: 500 }
    );
  }
}
