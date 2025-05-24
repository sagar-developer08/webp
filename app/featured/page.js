import { Suspense } from 'react';
import Featured from "./featured"

export default function Page() {
    return (
        <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
            <Featured />
        </Suspense>
    );
}
