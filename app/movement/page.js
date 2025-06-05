import { Suspense } from 'react';
import Movement from './movement';

export default function Page() {
    return (
        <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
            <Movement />
        </Suspense>
    );
}
