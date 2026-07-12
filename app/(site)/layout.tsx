import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { SiteConfigProvider } from '@/context/SiteConfigContext';
import { getSiteConfig, toPublicShellConfig } from '@/lib/site-data';

export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const config = toPublicShellConfig(await getSiteConfig());

  return (
    <SiteConfigProvider initialConfig={config}>
      <div className="font-sans antialiased text-stone-100 bg-stone-950 selection:bg-copper-500 selection:text-white">
        <Navbar />
        {children}
        <Footer />
      </div>
    </SiteConfigProvider>
  );
}
