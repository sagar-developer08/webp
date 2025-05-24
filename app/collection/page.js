import { Suspense } from 'react';
import Collection from './collection';

export default function Page() {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <Collection />
    </Suspense>
  );
}
