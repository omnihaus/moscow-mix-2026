
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteConfig, Product, BlogPost, SiteAssets, BrandStory } from '../types';
import { PRODUCTS, ASSETS, BLOG_POSTS, DEFAULT_STORY } from '../constants';
import { db } from '../firebase.ts';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const DEFAULT_CONFIG: SiteConfig = {
  heroHeadline: "Where Craft Meets <br/> Elemental Power",
  heroSubheadline: "Authentic copper drinkware and natural fire starters—crafted with purity and purpose.",
  assets: ASSETS,
  products: PRODUCTS,
  blogPosts: BLOG_POSTS,
  story: DEFAULT_STORY,
  adminPassword: 'admin',
  passwordHint: 'Default is admin'
};

interface SiteConfigContextType {
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  updateHeroText: (headline: string, subheadline: string) => void;
  updateAssets: (newAssets: Partial<SiteAssets>) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  reorderProduct: (id: string, direction: 'up' | 'down') => void;
  addBlogPost: (post: BlogPost) => void;
  updateBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (id: string) => void;
  updateStory: (story: BrandStory) => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  verifyAdminPassword: (input: string) => boolean;
  changeAdminPassword: (newPass: string, newHint?: string) => void;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider = ({ children }: { children?: ReactNode }) => {
  // 1. Initialize from Local Storage (Fast Load)
  const [config, setConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem('moscow_mix_data_v1');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // 2. Smart Auto-Save to Local Storage
  useEffect(() => {
    try {
      localStorage.setItem('moscow_mix_data_v1', JSON.stringify(config));
    } catch (e) {
      console.warn("Local storage full. Creating lite backup.");
      // Create a "lite" version without heavy blog content to prevent crash
      const liteConfig = {
        ...config,
        blogPosts: config.blogPosts.map(p => ({ ...p, content: "Content in Cloud" }))
      };
      try {
        localStorage.setItem('moscow_mix_data_v1', JSON.stringify(liteConfig));
      } catch (err) {
        console.error("Critical storage error", err);
      }
    }
  }, [config]);

  // 3. Fetch from Firebase (Sync with Cloud)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, "moscow_mix", "live_site");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const firebaseData = docSnap.data() as SiteConfig;

        // Smart merge: Don't overwrite local with stale Firebase data
        // Compare by checking if local has posts that Firebase doesn't
        const localPostIds = new Set(config.blogPosts.map(p => p.id));
        const firebasePostIds = new Set((firebaseData.blogPosts || []).map(p => p.id));

        // Check if local has posts that Firebase doesn't (means local is newer)
        const localHasNewerPosts = config.blogPosts.some(p => !firebasePostIds.has(p.id));

        // Use local blogPosts if local has newer content, otherwise use Firebase
        const blogPostsToUse = localHasNewerPosts
          ? config.blogPosts
          : (firebaseData.blogPosts && firebaseData.blogPosts.length > 0 ? firebaseData.blogPosts : DEFAULT_CONFIG.blogPosts);

        console.log('Firebase sync:', {
          localPosts: config.blogPosts.length,
          firebasePosts: (firebaseData.blogPosts || []).length,
          localHasNewerPosts,
          using: localHasNewerPosts ? 'local' : 'firebase'
        });

        // Merge Cloud data with Default structure to ensure no missing fields
        setConfig({
          heroHeadline: firebaseData.heroHeadline || DEFAULT_CONFIG.heroHeadline,
          heroSubheadline: firebaseData.heroSubheadline || DEFAULT_CONFIG.heroSubheadline,
          assets: { ...DEFAULT_CONFIG.assets, ...(firebaseData.assets || {}) },
          story: { ...DEFAULT_CONFIG.story, ...(firebaseData.story || {}) },
          products: firebaseData.products && firebaseData.products.length > 0 ? firebaseData.products : DEFAULT_CONFIG.products,
          blogPosts: blogPostsToUse,
          adminPassword: firebaseData.adminPassword || 'admin',
          passwordHint: firebaseData.passwordHint || 'Default is admin'
        });
      } else {
        // First time run: Upload default data to Firebase so it exists next time
        await setDoc(docRef, DEFAULT_CONFIG);
      }
    } catch (error) {
      console.error('Error fetching data from Firebase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HELPER: Save Full Config to Firebase ---
  const saveToFirebase = async (newConfig: SiteConfig) => {
    try {
      await setDoc(doc(db, "moscow_mix", "live_site"), newConfig);
    } catch (e) {
      console.error("Firebase Save Error:", e);
    }
  };

  // --- ACTIONS ---

  const updateHeroText = (headline: string, subheadline: string) => {
    const newConfig = { ...config, heroHeadline: headline, heroSubheadline: subheadline };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const updateAssets = (newAssets: Partial<SiteAssets>) => {
    const updatedAssets = { ...config.assets, ...newAssets };
    const newConfig = { ...config, assets: updatedAssets };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const addProduct = (product: Product) => {
    const newConfig = { ...config, products: [product, ...config.products] };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const updateProduct = (product: Product) => {
    const newConfig = {
      ...config,
      products: config.products.map(p => p.id === product.id ? product : p)
    };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const deleteProduct = (id: string) => {
    const newConfig = { ...config, products: config.products.filter(p => p.id !== id) };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const reorderProduct = (id: string, direction: 'up' | 'down') => {
    const index = config.products.findIndex(p => p.id === id);
    if (index === -1) return;

    // Prevent out of bounds
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === config.products.length - 1) return;

    const newProducts = [...config.products];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap elements
    [newProducts[index], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[index]];

    const newConfig = { ...config, products: newProducts };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const addBlogPost = (post: BlogPost) => {
    const newPost = { ...post, author: post.author || 'Michael B.' };
    const newConfig = { ...config, blogPosts: [newPost, ...config.blogPosts] };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const updateBlogPost = (post: BlogPost) => {
    const newConfig = {
      ...config,
      blogPosts: config.blogPosts.map(p => p.id === post.id ? post : p)
    };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const deleteBlogPost = (id: string) => {
    const newConfig = {
      ...config,
      blogPosts: config.blogPosts.filter(p => p.id !== id)
    };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const updateStory = (story: BrandStory) => {
    const newConfig = { ...config, story };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const changeAdminPassword = (newPass: string, newHint?: string) => {
    const newConfig = {
      ...config,
      adminPassword: newPass,
      passwordHint: newHint || config.passwordHint
    };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const verifyAdminPassword = (input: string) => {
    // Check the config state (which is synced with Cloud)
    return input === (config.adminPassword || 'admin');
  };

  return (
    <SiteConfigContext.Provider value={{
      config,
      setConfig,
      updateHeroText,
      updateAssets,
      addProduct,
      updateProduct,
      deleteProduct,
      reorderProduct,
      addBlogPost,
      updateBlogPost,
      deleteBlogPost,
      updateStory,
      refreshData: fetchData,
      isLoading,
      verifyAdminPassword,
      changeAdminPassword
    }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};