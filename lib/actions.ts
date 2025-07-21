'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db'; // 直接使用 prisma，不再依赖 fetch

// --- Helper Function ---
function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
}

// ------------------------
// PLOT ACTIONS
// ------------------------

export async function createPlotAction(previousState: any, formData: FormData) {
  const payload = {
    name: formData.get('name') as string,
    area: parseFloat(formData.get('area') as string),
    crop: formData.get('crop') as string,
  };

  if (!payload.name || isNaN(payload.area) || payload.area <= 0) {
    return { success: false, error: '请提供地块名称和有效的正数面积。' };
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/plots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '添加地块失败');
    }

    revalidatePath('/plots');

    return { success: true, error: null };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePlotAction(formData: FormData) {
  const plotId = parseInt(formData.get('plotId') as string);
  if (isNaN(plotId)) {
    return { error: '地块 ID 缺失，无法更新。' };
  }

  const payload = {
    name: formData.get('name') as string,
    area: parseFloat(formData.get('area') as string),
    crop: formData.get('crop') as string, // crop 仍然由周期逻辑管理，但表单可能需要更新它
  };

  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/plots/${plotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '更新地块失败。');
    }

    revalidatePath('/plots');
    revalidatePath(`/plots/${plotId}`);
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: '地块名称已存在，请使用其他名称。' };
    }
    return { error: '更新地块失败: ' + error.message };
  }
}


// ------------------------
// ACTIVITY ACTIONS
// ------------------------

export async function createActivityAction(previousState: any, formData: FormData) {
  const plotId = formData.get('plotId') as string;
  const recordsData: any[] = JSON.parse(formData.get('records') as string || '[]');

  const payload = {
    activityTypeId: parseInt(formData.get('activityTypeId') as string),
    date: new Date(formData.get('date') as string),
    plotId: parseInt(plotId),
    crop: formData.get('crop') as string || null,
    budget: formData.get('budget') ? parseFloat(formData.get('budget') as string) : null,
    records: recordsData.map(r => ({
      ...r,
      amount: parseFloat(r.amount),
      recordTypeId: parseInt(r.recordTypeId),
    })),
  };

  if (!payload.activityTypeId || !payload.plotId || !payload.date) {
    return { success: false, error: '请填写所有必填的农事活动字段。' };
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '创建农事活动失败。');
    }

    revalidatePath('/reports');
    revalidatePath('/newdashboard');
    revalidatePath(`/plots/${payload.plotId}`);

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateActivityAction(activityId: number, formData: FormData) {
  const plotId = formData.get('plotId') as string;
  const recordsData: any[] = JSON.parse(formData.get('records') as string || '[]');
  const recordIdsToDelete: number[] = JSON.parse(formData.get('recordIdsToDelete') as string || '[]');

  const payload = {
    activityTypeId: parseInt(formData.get('activityTypeId') as string),
    date: new Date(formData.get('isoDate') as string),
    crop: formData.get('crop') as string || null,
    records: recordsData.map(r => ({
      id: r.id ? parseInt(r.id) : undefined,
      amount: parseFloat(r.amount),
      recordTypeId: parseInt(r.recordTypeId),
      description: r.description,
      date: new Date(r.date),
    })),
    recordIdsToDelete,
  };

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/activities/${activityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '更新农事活动失败。');
    }

    revalidatePath('/reports');
    revalidatePath('/newdashboard');
    if (plotId) {
      revalidatePath(`/plots/${plotId}`);
    }

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


// ------------------------
// FINANCIAL RECORD ACTIONS
// ------------------------
// (如果财务记录总是通过活动来管理，这些独立的 action 可能就不再需要了)
// (暂时保留，以防有独立于活动的财务记录)

export async function createFinancialRecordAction(previousState: any, formData: FormData) {
  const payload = {
    amount: parseFloat(formData.get('amount') as string),
    recordTypeId: parseInt(formData.get('recordTypeId') as string),
    date: new Date(formData.get('date') as string),
    description: formData.get('description') as string || null,
  };

  if (isNaN(payload.amount) || !payload.recordTypeId || !payload.date) {
    return { success: false, error: '请填写所有必填字段并确保格式正确。' };
  }

  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '创建财务记录失败。');
    }

    revalidatePath('/reports');

    return { success: true, error: null };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateFinancialRecordAction(formData: FormData) {
  const recordId = parseInt(formData.get('recordId') as string);
  if (isNaN(recordId)) {
    return { error: '财务记录 ID 缺失，无法更新。' };
  }

  const payload = {
    date: new Date(formData.get('isoDate') as string),
    amount: parseFloat(formData.get('amount') as string),
    recordTypeId: parseInt(formData.get('recordTypeId') as string),
    description: formData.get('description') as string,
  };

  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/records/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '更新财务记录失败。');
    }

    revalidatePath('/reports');
    return { success: true };
  } catch (error: any) {
    return { error: '更新财务记录失败: ' + error.message };
  }
}