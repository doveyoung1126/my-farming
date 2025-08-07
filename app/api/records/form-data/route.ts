
import { NextResponse } from 'next/server';
import { getRecordCategoryTypes } from '@/lib/data';

// This route handler fetches all the necessary data for the AddFinancialRecordForm.
export async function GET() {
  try {
    const recordCategoryTypes = await getRecordCategoryTypes();

    // Return the data as a JSON response.
    return NextResponse.json({ recordCategoryTypes });

  } catch (error) {
    // If the database query fails, return a 500 error.
    console.error('API Error: Failed to fetch form data for records:', error);
    return NextResponse.json(
      { message: 'Failed to fetch required form data.' },
      { status: 500 }
    );
  }
}
