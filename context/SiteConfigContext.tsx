
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteConfig, Product, BlogPost, SiteAssets, BrandStory, AdminUser } from '../types';
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
  adminPassword: 'admin', // Legacy - kept for backward compatibility
  passwordHint: 'Default is admin',
  adminUsers: [
    {
      id: 'admin-default',
      name: 'Admin',
      email: 'admin',
      password: 'admin',
      role: 'owner',
      createdAt: new Date().toISOString()
    }
  ]
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
  addBlogPost: (post: BlogPost) => Promise<void>;
  updateBlogPost: (post: BlogPost) => Promise<void>;
  deleteBlogPost: (id: string) => void;
  updateStory: (story: BrandStory) => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  verifyAdminPassword: (input: string) => boolean;
  changeAdminPassword: (newPass: string, newHint?: string) => void;
  addAdminUser: (user: AdminUser) => void;
  removeAdminUser: (userId: string) => void;
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

  // Track when we're saving to prevent fetch from overwriting
  const [isSaving, setIsSaving] = useState(false);

  // Use localStorage for last save time so it persists across page refreshes!
  const LAST_SAVE_KEY = 'moscow_mix_last_save_time';
  const SAVE_COOLDOWN_MS = 10000; // 10 seconds to allow Firebase propagation

  const getLastSaveTime = (): number => {
    try {
      const saved = localStorage.getItem(LAST_SAVE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  };

  const setLastSaveTime = (time: number) => {
    try {
      localStorage.setItem(LAST_SAVE_KEY, time.toString());
    } catch {
      console.warn('Could not save timestamp to localStorage');
    }
  };

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

  // 3. Fetch from Firebase (Sync with Cloud) - Firebase is ALWAYS the source of truth
  const fetchData = async () => {
    // Don't fetch if we're in the middle of saving (prevents race condition)
    if (isSaving) {
      console.log('Firebase sync: Skipping - save in progress');
      return;
    }

    // Don't fetch if we saved recently - use localStorage so this survives page refreshes!
    const lastSaveTime = getLastSaveTime();
    const timeSinceLastSave = Date.now() - lastSaveTime;
    if (timeSinceLastSave < SAVE_COOLDOWN_MS && lastSaveTime > 0) {
      console.log('Firebase sync: Skipping - recent save detected', timeSinceLastSave, 'ms ago. Using localStorage data.');
      return;
    }

    setIsLoading(true);
    try {
      const docRef = doc(db, "moscow_mix", "live_site");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const firebaseData = docSnap.data() as SiteConfig;

        // Get current local state for comparison
        const localPosts = config.blogPosts || [];
        const firebasePosts = firebaseData.blogPosts || [];

        console.log('Firebase sync: Comparing data', {
          localPosts: localPosts.length,
          firebasePosts: firebasePosts.length,
          timeSinceLastSave: Date.now() - getLastSaveTime()
        });

        // CRITICAL: If local has MORE posts than Firebase, our save hasn't propagated yet
        // Don't overwrite local data with stale Firebase data!
        if (localPosts.length > firebasePosts.length) {
          console.log('Firebase sync: LOCAL has MORE posts than Firebase - keeping local data (save not propagated yet)');
          setIsLoading(false);
          return;
        }

        // Also check if local has posts that Firebase doesn't have (by ID)
        const firebasePostIds = new Set(firebasePosts.map(p => p.id));
        const localOnlyPosts = localPosts.filter(p => !firebasePostIds.has(p.id));
        if (localOnlyPosts.length > 0) {
          console.log('Firebase sync: Local has posts not in Firebase yet - keeping local data', localOnlyPosts.map(p => p.title));
          setIsLoading(false);
          return;
        }

        console.log('Firebase sync: Using Firebase as source of truth');

        // ALWAYS use Firebase data as the source of truth
        // This ensures all devices see the same content
        setConfig({
          heroHeadline: firebaseData.heroHeadline || DEFAULT_CONFIG.heroHeadline,
          heroSubheadline: firebaseData.heroSubheadline || DEFAULT_CONFIG.heroSubheadline,
          assets: { ...DEFAULT_CONFIG.assets, ...(firebaseData.assets || {}) },
          story: { ...DEFAULT_CONFIG.story, ...(firebaseData.story || {}) },
          products: firebaseData.products && firebaseData.products.length > 0 ? firebaseData.products : DEFAULT_CONFIG.products,
          blogPosts: firebaseData.blogPosts && firebaseData.blogPosts.length > 0 ? firebaseData.blogPosts : DEFAULT_CONFIG.blogPosts,
          adminPassword: firebaseData.adminPassword || 'admin',
          passwordHint: firebaseData.passwordHint || 'Default is admin',
          adminUsers: firebaseData.adminUsers && firebaseData.adminUsers.length > 0 ? firebaseData.adminUsers : DEFAULT_CONFIG.adminUsers
        });
      } else {
        // First time run: Upload default data to Firebase so it exists next time
        await setDoc(docRef, DEFAULT_CONFIG);
      }
    } catch (error) {
      console.error('Error fetching data from Firebase:', error);
      // On error, keep using whatever data we have (localStorage fallback)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HELPER: Save Full Config to Firebase ---
  const saveToFirebase = async (newConfig: SiteConfig): Promise<void> => {
    setIsSaving(true);
    setLastSaveTime(Date.now()); // Persist to localStorage so it survives page refresh

    const startTime = Date.now();
    console.log('Firebase save: Starting...', { blogPostCount: newConfig.blogPosts?.length });

    try {
      const docRef = doc(db, "moscow_mix", "live_site");
      await setDoc(docRef, newConfig);

      const saveTime = Date.now() - startTime;
      console.log('Firebase save: setDoc completed in', saveTime, 'ms');

      // VERIFICATION: Re-read to confirm data persisted
      const verifySnap = await getDoc(docRef);
      if (verifySnap.exists()) {
        const verifyData = verifySnap.data() as SiteConfig;
        const savedPostCount = verifyData.blogPosts?.length || 0;
        const expectedPostCount = newConfig.blogPosts?.length || 0;

        if (savedPostCount === expectedPostCount) {
          console.log('Firebase save: VERIFIED - Post count matches:', savedPostCount);
        } else {
          console.error('Firebase save: MISMATCH! Expected', expectedPostCount, 'posts but Firebase has', savedPostCount);
          throw new Error(`Save verification failed: expected ${expectedPostCount} posts, got ${savedPostCount}`);
        }
      } else {
        console.error('Firebase save: Document does not exist after save!');
        throw new Error('Save verification failed: document not found');
      }

    } catch (e) {
      console.error("Firebase Save Error:", e);
      // Re-throw so callers know the save failed
      throw e;
    } finally {
      setIsSaving(false);
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

  const addBlogPost = async (post: BlogPost): Promise<void> => {
    const newPost = { ...post, author: post.author || 'Michael B.' };
    const newConfig = { ...config, blogPosts: [newPost, ...config.blogPosts] };
    setConfig(newConfig);
    await saveToFirebase(newConfig);
    console.log('addBlogPost: Save complete, post persisted:', post.title);
  };

  const updateBlogPost = async (post: BlogPost): Promise<void> => {
    const newConfig = {
      ...config,
      blogPosts: config.blogPosts.map(p => p.id === post.id ? post : p)
    };
    setConfig(newConfig);
    await saveToFirebase(newConfig);
    console.log('updateBlogPost: Save complete, post updated:', post.title);
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

  const addAdminUser = (user: AdminUser) => {
    const existingUsers = config.adminUsers || [];
    const newConfig = {
      ...config,
      adminUsers: [...existingUsers, user]
    };
    setConfig(newConfig);
    saveToFirebase(newConfig);
  };

  const removeAdminUser = (userId: string) => {
    const existingUsers = config.adminUsers || [];
    const newConfig = {
      ...config,
      adminUsers: existingUsers.filter(u => u.id !== userId)
    };
    setConfig(newConfig);
    saveToFirebase(newConfig);
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
      isSaving,
      verifyAdminPassword,
      changeAdminPassword,
      addAdminUser,
      removeAdminUser
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