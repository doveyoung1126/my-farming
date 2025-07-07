// components/common/ActionModal.tsx
'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAction: (action: 'addActivity' | 'addFinancial' | 'addPlot') => void;
}

export function ActionModal({ isOpen, onClose, onSelectAction }: ActionModalProps) {
    // 控制模态框内容是否渲染，用于退出动画
    const [shouldRender, setShouldRender] = useState(false);
    // 控制模态框的进入/退出动画状态
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true); // 立即渲染内容
            // 延迟应用可见状态，让动画生效
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false); // 立即开始退出动画
            // 延迟移除内容，直到动画完成
            const timer = setTimeout(() => setShouldRender(false), 300); // 300ms 匹配 transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null; // 不渲染内容，如果它不应该显示

    return (
        <div
            className={`
                fixed inset-0 z-50 flex items-end justify-center
                transition-opacity duration-300 ease-out
                ${isVisible ? 'opacity-100 bg-gray-900/75' : 'opacity-0 pointer-events-none'}
            `}
            onClick={onClose} // 点击背景关闭模态框
        >
            <div
                className={`
                    bg-white rounded-t-xl w-full max-w-md p-4 shadow-lg
                    transform transition-transform duration-300 ease-out
                    ${isVisible ? 'translate-y-0' : 'translate-y-full'}
                `}
                onClick={(e) => e.stopPropagation()} // 阻止点击模态框内容时关闭模态框
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">选择操作</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                <div className="space-y-3">
                    <button 
                        onClick={() => onSelectAction('addActivity')}
                        className="w-full text-left p-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium transition-colors"
                    >
                        添加农事活动
                    </button>
                    <button 
                        onClick={() => onSelectAction('addFinancial')}
                        className="w-full text-left p-4 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-medium transition-colors"
                    >
                        添加财务记录
                    </button>
                    <button 
                        onClick={() => onSelectAction('addPlot')}
                        className="w-full text-left p-4 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-medium transition-colors"
                    >
                        添加地块
                    </button>
                </div>
            </div>
        </div>
    );
}