
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ShopCategory from './pages/ShopCategory';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import About from './pages/About';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import AdminPanel from './pages/Admin/AdminPanel';
import { SiteConfigProvider } from './context/SiteConfigContext';

// ScrollToTop Component
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <SiteConfigProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="font-sans antialiased text-stone-100 bg-stone-950 selection:bg-copper-500 selection:text-white">
          <Routes>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop/copper" element={<ShopCategory category="copper" />} />
                  <Route path="/shop/fire" element={<ShopCategory category="fire" />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/journal" element={<BlogList />} />
                  <Route path="/journal/:id" element={<BlogPost />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </HashRouter>
    </SiteConfigProvider>
  );
}
