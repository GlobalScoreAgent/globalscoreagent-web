import type { Metadata } from 'next';
import { authCopy } from '@/content/auth/copy';

export const metadata: Metadata = {
  title: authCopy.seo.title.es,
  description: authCopy.seo.description.es,
};

export default function AuthLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
