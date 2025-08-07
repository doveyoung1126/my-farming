// components/layout/GlobalActions.tsx
'use client';

import { useState } from 'react';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { ActionModal } from '@/components/ui/ActionModal';

export function GlobalActions() {
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
      />
    </>
  );
}
