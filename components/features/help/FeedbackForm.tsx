'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { clsx } from 'clsx';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { submitFeedbackAction } from '@/lib/actions';

const initialState = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        'px-4 py-2 rounded-md text-white font-semibold transition-colors flex items-center justify-center w-full sm:w-auto',
        {
          'bg-emerald-600 hover:bg-emerald-700': !pending,
          'bg-slate-400 cursor-not-allowed': pending,
        }
      )}
    >
      {pending ? (
        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> 发送中...</>
      ) : (
        <><Send className="w-5 h-5 mr-2" /> 发送反馈</>
      )}
    </button>
  );
}

export function FeedbackForm() {
  const [state, formAction] = useActionState(submitFeedbackAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset(); // Reset form on success
    }
  }, [state.success]);

  return (
    <div className="mt-4 pt-4 border-t border-slate-200">
      <h4 className="font-semibold text-slate-800">快速反馈</h4>
      <p className="text-sm text-slate-600 mt-1 mb-3">有任何建议或问题？请在这里告诉我。</p>
      <form ref={formRef} action={formAction} className="space-y-3">
        <div>
          <textarea
            name="feedback"
            rows={3}
            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="例如：希望可以增加天气预报功能..."
            required
          />
        </div>
        <SubmitButton />
      </form>
      {state.error && (
        <p className="text-sm text-red-600 mt-2">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600 mt-2 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1.5" />
          感谢您的反馈，已成功发送！
        </p>
      )}
    </div>
  );
}
