import { Suspense } from 'react';
import AuthLoginPageClient from './AuthLoginPageClient';

export default function AuthLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-zinc-400">
          Loading...
        </div>
      }
    >
      <AuthLoginPageClient />
    </Suspense>
  );
}
