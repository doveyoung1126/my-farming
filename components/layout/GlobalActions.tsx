// components/layout/GlobalActions.tsx
'use client';

import { useState } from 'react';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { ActionModal } from '@/components/ui/ActionModal';
import { preload, useSWRConfig } from 'swr'

export function GlobalActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetcher } = useSWRConfig()

  return (
    <>
      <FloatingActionButton
        onClick={() => {
          setIsModalOpen(true)
          if (fetcher) {
            preload('/api/activities/form-data', fetcher)
            preload('/api/records/form-data', fetcher)
          }
        }}
        aria-label="快捷添加记录"
      />
      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
