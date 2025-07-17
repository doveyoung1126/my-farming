// components/plots/PlotsHeader.tsx
'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function PlotsHeader({ showArchived }: { showArchived: boolean }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleToggleArchived = () => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (!showArchived) {
            current.set("showArchived", "true");
        } else {
            current.delete("showArchived");
        }
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.replace(`${pathname}${query}`);
    };

    return (
        <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">我的地块</h1>
                    <p className="text-sm text-gray-500 mt-1">管理和查看您的所有农田地块。</p>
                </div>
                <div className="flex items-center">
                    <label htmlFor="show-archived" className="mr-2 text-sm font-medium text-slate-600 whitespace-nowrap">
                        显示归档
                    </label>
                    <button
                        onClick={handleToggleArchived}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${showArchived ? 'bg-emerald-600' : 'bg-slate-300'}`}
                        id="show-archived"
                    >
                        <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${showArchived ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>
            </div>
        </header>
    );
}
