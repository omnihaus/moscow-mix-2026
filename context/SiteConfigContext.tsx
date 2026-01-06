
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
  forceSyncToCloud: () => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
  isSaving: boolean;
  verifyAdminPassword: (input: string) => boolean;
  changeAdminPassword: (newPass: string, newHint?: string) => void;
  addAdminUser: (user: AdminUser) => void;
  removeAdminUser: (userId: string) => void;
}

// Helper: Recursively remove undefined values from an object
// Firestore doesn't accept undefined - it will throw an error
const removeUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item));
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (value !== undefined) {
          cleaned[key] = removeUndefined(value);
        }
      }
    }
    return cleaned;
  }
  return obj;
};

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
        const timeSinceLastSave = Date.now() - getLastSaveTime();

        console.log('Firebase sync: Comparing data', {
          localPosts: localPosts.length,
          firebasePosts: firebasePosts.length,
          timeSinceLastSave,
          isWithinCooldown: timeSinceLastSave < SAVE_COOLDOWN_MS
        });

        // ONLY protect local data if we're within the cooldown window (recently saved)
        // This prevents the race condition where Firebase returns stale data right after a save
        // But allows fresh visitors (no recent save) to always get Firebase data
        if (timeSinceLastSave < SAVE_COOLDOWN_MS && getLastSaveTime() > 0) {
          // We recently saved - check if Firebase has our data yet
          if (localPosts.length > firebasePosts.length) {
            console.log('Firebase sync: Within cooldown, local has more posts - keeping local data');
            setIsLoading(false);
            return;
          }

          // Check if local has posts Firebase doesn't have yet
          const firebasePostIds = new Set(firebasePosts.map(p => p.id));
          const localOnlyPosts = localPosts.filter(p => !firebasePostIds.has(p.id));
          if (localOnlyPosts.length > 0) {
            console.log('Firebase sync: Within cooldown, local has unpropagated posts - keeping local data', localOnlyPosts.map(p => p.title));
            setIsLoading(false);
            return;
          }
        }

        // Use Firebase data as the source of truth
        console.log('Firebase sync: Using Firebase as source of truth');

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

  // Auto-publish scheduled posts when their scheduled time has passed
  const checkAndPublishScheduledPosts = async () => {
    const now = new Date();
    const postsToPublish = config.blogPosts.filter(post =>
      post.status === 'scheduled' &&
      post.scheduledDate &&
      new Date(post.scheduledDate) <= now
    );

    if (postsToPublish.length > 0) {
      console.log('Auto-publish: Found', postsToPublish.length, 'scheduled posts ready to publish:', postsToPublish.map(p => p.title));

      const updatedPosts = config.blogPosts.map(post => {
        if (postsToPublish.some(p => p.id === post.id)) {
          return { ...post, status: 'published' as const };
        }
        return post;
      });

      const newConfig = { ...config, blogPosts: updatedPosts };

      try {
        await saveToFirebase(newConfig);
        setConfig(newConfig);
        console.log('Auto-publish: Successfully published', postsToPublish.length, 'posts');
      } catch (error) {
        console.error('Auto-publish: Failed to update posts', error);
      }
    }
  };

  // Check for scheduled posts to publish on load and periodically
  useEffect(() => {
    // Initial check after a short delay to ensure data is loaded
    const initialCheck = setTimeout(() => {
      checkAndPublishScheduledPosts();
    }, 3000);

    // Check every minute for scheduled posts
    const interval = setInterval(() => {
      checkAndPublishScheduledPosts();
    }, 60000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [config.blogPosts]);

  // --- HELPER: Save Full Config to Firebase ---
  const saveToFirebase = async (newConfig: SiteConfig): Promise<void> => {
    setIsSaving(true);
    setLastSaveTime(Date.now()); // Persist to localStorage so it survives page refresh

    const startTime = Date.now();
    console.log('Firebase save: Starting...', { blogPostCount: newConfig.blogPosts?.length });

    try {
      const docRef = doc(db, "moscow_mix", "live_site");
      // Remove undefined values - Firestore doesn't accept them
      const sanitizedConfig = removeUndefined(newConfig);
      await setDoc(docRef, sanitizedConfig);

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

  // BLOG POST FUNCTIONS - Save-First Architecture
  // We save to Firebase FIRST, then update local state ONLY if save succeeds
  // This prevents ghost posts that appear locally but aren't persisted

  const addBlogPost = async (post: BlogPost): Promise<void> => {
    const newPost = { ...post, author: post.author || 'Michael B.' };
    const newConfig = { ...config, blogPosts: [newPost, ...config.blogPosts] };

    console.log('addBlogPost: Saving to Firebase FIRST...', { title: post.title, totalPosts: newConfig.blogPosts.length });

    // SAVE TO FIREBASE FIRST - before updating local state
    setIsSaving(true);
    setLastSaveTime(Date.now());

    try {
      const docRef = doc(db, "moscow_mix", "live_site");
      // Remove undefined values - Firestore doesn't accept them
      const sanitizedConfig = removeUndefined(newConfig);
      await setDoc(docRef, sanitizedConfig);

      console.log('addBlogPost: Firebase save completed successfully');

      // ONLY update local state after Firebase confirms
      setConfig(newConfig);

      // Also update localStorage as backup
      localStorage.setItem('moscow_mix_data_v1', JSON.stringify(newConfig));

      console.log('addBlogPost: Local state updated, post persisted:', post.title);
    } catch (error) {
      console.error('addBlogPost: Firebase save FAILED', error);
      // DO NOT update local state - the save failed!
      throw error; // Re-throw so caller can show error to user
    } finally {
      setIsSaving(false);
    }
  };

  const updateBlogPost = async (post: BlogPost): Promise<void> => {
    const newConfig = {
      ...config,
      blogPosts: config.blogPosts.map(p => p.id === post.id ? post : p)
    };

    console.log('updateBlogPost: Saving to Firebase FIRST...', { title: post.title });

    // SAVE TO FIREBASE FIRST - before updating local state
    setIsSaving(true);
    setLastSaveTime(Date.now());

    try {
      const docRef = doc(db, "moscow_mix", "live_site");
      // Remove undefined values - Firestore doesn't accept them
      const sanitizedConfig = removeUndefined(newConfig);
      await setDoc(docRef, sanitizedConfig);

      console.log('updateBlogPost: Firebase save completed successfully');

      // ONLY update local state after Firebase confirms
      setConfig(newConfig);

      // Also update localStorage as backup
      localStorage.setItem('moscow_mix_data_v1', JSON.stringify(newConfig));

      console.log('updateBlogPost: Local state updated, post updated:', post.title);
    } catch (error) {
      console.error('updateBlogPost: Firebase save FAILED', error);
      // DO NOT update local state - the save failed!
      throw error; // Re-throw so caller can show error to user
    } finally {
      setIsSaving(false);
    }
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

  // EMERGENCY: Force sync current config to Firebase (bypasses all checks)
  const forceSyncToCloud = async (): Promise<{ success: boolean; message: string }> => {
    console.log('FORCE SYNC: Pushing ALL current data to Firebase...');
    console.log('Current data:', {
      blogPosts: config.blogPosts?.length || 0,
      products: config.products?.length || 0,
      adminUsers: config.adminUsers?.length || 0
    });

    try {
      const docRef = doc(db, "moscow_mix", "live_site");
      await setDoc(docRef, config);

      // Verify the save
      const verifySnap = await getDoc(docRef);
      if (verifySnap.exists()) {
        const verifyData = verifySnap.data() as SiteConfig;
        const savedPostCount = verifyData.blogPosts?.length || 0;
        const expectedPostCount = config.blogPosts?.length || 0;

        if (savedPostCount === expectedPostCount) {
          const message = `SUCCESS! Synced ${expectedPostCount} posts, ${config.products?.length || 0} products to Firebase.`;
          console.log('FORCE SYNC:', message);
          return { success: true, message };
        } else {
          const message = `PARTIAL: Expected ${expectedPostCount} posts but Firebase shows ${savedPostCount}`;
          console.error('FORCE SYNC:', message);
          return { success: false, message };
        }
      } else {
        return { success: false, message: 'Document not found after save!' };
      }
    } catch (error) {
      const message = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('FORCE SYNC:', message);
      return { success: false, message };
    }
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
      forceSyncToCloud,
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