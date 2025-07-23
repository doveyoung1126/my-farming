'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface AccordionItem {
  question: string;
  answer: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => handleClick(index)}
            className="w-full flex justify-between items-center p-4 text-left font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <span>{item.question}</span>
            <ChevronDown
              className={clsx('w-5 h-5 transition-transform duration-300', {
                'rotate-180': openIndex === index,
              })}
            />
          </button>
          <div
            className={clsx('transition-all duration-300 ease-in-out overflow-hidden', {
              'max-h-[1000px] p-4': openIndex === index,
              'max-h-0': openIndex !== index,
            })}
          >
            <div className="prose prose-slate max-w-none">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
