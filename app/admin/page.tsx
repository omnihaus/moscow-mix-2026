'use client';

import AdminPanel from '@/views/Admin/AdminPanel';
import { SiteConfigProvider } from '@/context/SiteConfigContext';

export default function AdminPage() {
  return (
    <SiteConfigProvider syncFromFirebase>
      <AdminPanel />
    </SiteConfigProvider>
  );
}
