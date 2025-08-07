
import { NextResponse } from 'next/server';
import {
  getPlots,
  getActivityTypes,
  getRecordCategoryTypes,
} from '@/lib/data';

// This route handler fetches all the necessary data for the AddActivityForm.
export async function GET() {
  try {
    // Fetch all data in parallel for maximum efficiency.
    const [plots, activityTypes, recordCategoryTypes] = await Promise.all([
      getPlots(false), // Fetch only active (non-archived) plots
      getActivityTypes(),
      getRecordCategoryTypes(),
    ]);

    // Return the combined data as a JSON response.
    return NextResponse.json({
      plots,
      activityTypes,
      recordCategoryTypes,
    });

  } catch (error) {
    // If any of the database queries fail, return a 500 error.
    console.error('API Error: Failed to fetch form data for activities:', error);
    return NextResponse.json(
      { message: 'Failed to fetch required form data.' },
      { status: 500 }
    );
  }
}
