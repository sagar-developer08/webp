import { Suspense } from 'react';
import Faqs from "./faqs"

export default function Page() {
    return (
        <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
            <Faqs />
        </Suspense>
    );
}
