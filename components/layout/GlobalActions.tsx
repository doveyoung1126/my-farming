// components/layout/GlobalActions.tsx
'use client';

import { useState } from 'react';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { ActionModal } from '@/components/ui/ActionModal';
import { ActivityType, Plot, RecordCategoryType } from '@/lib/types';

interface GlobalActionsProps {
  plots: Plot[];
  activityTypes: ActivityType[];
  recordCategoryTypes: RecordCategoryType[];
}

export function GlobalActions({ plots, activityTypes, recordCategoryTypes }: GlobalActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <FloatingActionButton 
        onClick={() => setIsModalOpen(true)} 
        aria-label="打开快捷操作"
      />
      <ActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        plots={plots}
        activityTypes={activityTypes}
        recordCategoryTypes={recordCategoryTypes}
      />
    </>
  );
}
