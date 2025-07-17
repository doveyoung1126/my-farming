// components/features/plots/forms/EditPlotForm.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { PrismaPlots } from '@/lib/types';
import { updatePlotAction } from '@/lib/actions'; // 1. 导入 Server Action
import { useRef, useState } from 'react';

interface EditPlotFormProps {
    plot: PrismaPlots;
    onClose: () => void; // 接收一个关闭函数
}

export function EditPlotForm({ plot, onClose }: EditPlotFormProps) {

    const { pending } = useFormStatus()

    // 2. 创建一个独立的提交按钮组件，以使用 useFormStatus
    function SubmitButton() {
        // const { pending } = useFormStatus();

        return (
            <button
                type="submit"
                className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                disabled={pending}
            >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                保存更改
            </button>
        );
    }
    // 3. 移除所有表单字段的 useState
    // const [name, setName] = useState(plot.name);
    // ...

    // 4. 移除 isLoading 和 handleSubmit 函数
    // const [isLoading, setIsLoading] = useState(false)
    // const [error, setError] = useState<string | null>(null)
    // const handleSubmit = async (...) => { ... }

    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Server Action 可以直接在 form 的 action 中调用
    const formAction = async (formData: FormData) => {
        const result = await updatePlotAction(formData);
        if (result?.error) {
            setError(result.error);
        } else {
            setError(null);
            onClose(); // 成功后调用关闭函数
        }
    };

    return (
        // 5. 将 onSubmit 改为 action
        <form ref={formRef} action={formAction} className="space-y-4 p-4">
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

            {/* 6. 添加隐藏字段来传递 ID */}
            <input type="hidden" name="plotId" value={plot.id} />

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">地块名称 <span className="text-red-500">*</span></label>
                {/* 7. 将 value/onChange 改为 name/defaultValue */}
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={plot.name}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                />
            </div>

            <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700">面积 (亩) <span className="text-red-500">*</span></label>
                <input
                    type="number"
                    id="area"
                    name="area"
                    defaultValue={plot.area.toString()} // 注意：Server Action 中字段名为 size
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.1"
                    required
                />
            </div>

            <div>
                <label htmlFor="crop" className="block text-sm font-medium text-gray-700">当前作物 (可选)</label>
                <input
                    type="text"
                    id="crop"
                    name="crop"
                    defaultValue={plot.crop || ''} // 注意：Server Action 中字段名为 description
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
            </div>

            {/* 8. 使用新的提交按钮组件 */}
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onClose} // 取消按钮直接调用 onClose
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={pending}
                >
                    取消
                </button>
                <SubmitButton />
            </div>
        </form>
    );
}
