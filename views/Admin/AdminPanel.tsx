'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Product, BlogPost, ProductCategory, AdminUser } from '../../types';
import { storage } from '../../firebase';
// FIXED: Import storage functions ONLY from firebase/storage
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from 'next/link';
import {
  Lock, Layout, Type, Image as ImageIcon, ShoppingBag,
  BookOpen, LogOut, Plus, Trash2, Edit2, Upload,
  Sparkles, Save, Bold, Italic, Quote, Link as LinkIcon,
  Settings, ExternalLink, X, Heading1, Heading2, Eraser,
  ArrowUp, ArrowDown, Check, X as XIcon, List, FileText, Video, Eye, EyeOff,
  Calendar, Clock, Users, User, Mail, Key, Cloud, RefreshCw
} from 'lucide-react';

const AdminPanel = () => {
  const { config, updateHeroText, updateAssets, addProduct, updateProduct, deleteProduct, reorderProduct, addBlogPost, updateBlogPost, deleteBlogPost, updateStory, verifyAdminPassword, changeAdminPassword, addAdminUser, removeAdminUser, forceSyncToCloud } = useSiteConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'products' | 'journal' | 'story' | 'assets' | 'settings' | 'team'>('hero');
  const [aiAccessCode, setAiAccessCode] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [openAiConfigured, setOpenAiConfigured] = useState<boolean | null>(null);

  // Password Change State
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [newHint, setNewHint] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Local state for Hero editing
  const [heroHead, setHeroHead] = useState(config.heroHeadline);
  const [heroSub, setHeroSub] = useState(config.heroSubheadline);

  // AI Configuration
  const [imageGenModel] = useState('gpt-image-2');

  // Refs
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedCode = localStorage.getItem('admin_ai_access_code');
    if (savedCode) setAiAccessCode(savedCode);
    fetch('/api/admin/ai').then(r => r.json()).then(data => setOpenAiConfigured(Boolean(data.configured))).catch(() => setOpenAiConfigured(false));
  }, []);

  const callOpenAI = async (prompt: string, operation: 'text' | 'image' | 'ideas' = 'text', images: string[] = []) => {
    const accessCode = localStorage.getItem('admin_ai_access_code') || aiAccessCode;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessCode) headers['x-admin-ai-secret'] = accessCode;
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), operation === 'image' ? 270_000 : 120_000);
      try {
        const response = await fetch('/api/admin/ai', {
          method: 'POST',
          headers,
          credentials: 'same-origin',
          signal: controller.signal,
          body: JSON.stringify({ operation, prompt, images }),
        });
        const responseText = await response.text();
        let data: any;
        try {
          data = JSON.parse(responseText);
        } catch {
          if (response.status === 413 || responseText.toLowerCase().includes('entity too large')) {
            throw new Error('The product reference images were too large. Please upload them again; the updated uploader will resize them automatically.');
          }
          throw new Error(responseText || `The AI service returned an unexpected response (${response.status}).`);
        }
        if (!response.ok) {
          if (response.status === 401) throw new Error('Your secure Admin session expired. Please log out and sign in again.');
          const error = new Error(data.error || 'OpenAI generation failed.') as Error & { retryable?: boolean };
          error.retryable = response.status === 429 || response.status >= 500;
          if (!error.retryable) throw error;
          if (attempt === maxAttempts) throw error;
        } else {
          return operation === 'image' ? data.image : data.text;
        }
      } catch (error) {
        const isAbort = error instanceof DOMException && error.name === 'AbortError';
        if (attempt === maxAttempts || (error as Error & { retryable?: boolean })?.retryable === false || (error instanceof Error && /session expired|reference images were too large/i.test(error.message))) {
          if (isAbort) throw new Error('The image service exceeded its four-and-a-half-minute safety limit. Your written draft is preserved; retry only the images.');
          throw error;
        }
        await new Promise(resolve => window.setTimeout(resolve, 1500 * attempt));
      } finally {
        window.clearTimeout(timeout);
      }
    }

    throw new Error('OpenAI generation failed after two attempts.');
  };

  const establishAdminSession = async () => {
    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: passwordInput }),
    });
    const data = await response.json();
    if (!response.ok || !data.authenticated) throw new Error(data.error || 'Unable to create a secure Admin session.');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get admin users (with fallback to empty array)
    const adminUsers = config.adminUsers || [];

    // Check against adminUsers first
    const matchedUser = adminUsers.find(
      user => user.email.toLowerCase() === loginEmail.toLowerCase() && user.password === passwordInput
    );

    if (matchedUser) {
      try {
        await establishAdminSession();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Unable to create a secure Admin session.');
        return;
      }
      setIsAuthenticated(true);
      setCurrentUser(matchedUser);
      // Writers go directly to Journal tab
      if (matchedUser.role === 'writer') {
        setActiveTab('journal');
      }
      return;
    }

    // Fallback: Check legacy single password (for backward compatibility)
    if (loginEmail.toLowerCase() === 'admin' && verifyAdminPassword(passwordInput)) {
      try {
        await establishAdminSession();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Unable to create a secure Admin session.');
        return;
      }
      setIsAuthenticated(true);
      setCurrentUser({
        id: 'legacy-admin',
        name: 'Admin',
        email: 'admin',
        password: '',
        role: 'owner',
        createdAt: ''
      });
      return;
    }

    alert('Invalid email or password');
  };

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' }).catch(() => undefined);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPasswordInput('');
  };

  const handleSaveApiKey = async () => {
    if (!aiAccessCode.trim()) {
      alert("Please enter the AI access code from Vercel.");
      return;
    }
    const code = aiAccessCode.trim();
    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-ai-secret': code },
        body: JSON.stringify({ operation: 'verify' }),
      });
      const data = await response.json();
      if (!response.ok || !data.valid) {
        localStorage.removeItem('admin_ai_access_code');
        throw new Error(data.error || 'The access code does not match Vercel.');
      }
      localStorage.setItem('admin_ai_access_code', code);
      setAiAccessCode(code);
      alert("AI access verified and saved successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to verify the access code.';
      alert(`AI access was not saved: ${message}`);
    }
  };

  const handleSaveCredentials = () => {
    if (!newPass.trim()) return alert("Password cannot be empty");
    changeAdminPassword(newPass, newHint);
    setIsChangingPass(false);
    setNewPass('');
    setNewHint('');
    alert("Credentials updated successfully.");
  };

  // --- FIREBASE UPLOAD HELPERS ---
  const uploadToFirebase = async (file: File, folder: string = 'uploads'): Promise<string> => {
    try {
      const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      const ref = storageRef(storage, fileName);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      return url;
    } catch (error) {
      console.error("Firebase Upload failed", error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      // We don't alert here anymore to allow the fallback to work silently without nagging
      console.warn("Upload failed:", msg);
      return "";
    }
  };

  const uploadBase64ToFirebase = async (base64Data: string, folder: string): Promise<string | null> => {
    try {
      // Convert base64 to Blob
      const res = await fetch(base64Data);
      const blob = await res.blob() as any; // Cast to any to bypass strict TS Blob check if needed, or just Blob
      // Fix: The error is likely due to TS lib issues with Blob definition in this environment.
      // Using 'any' cast is safe here as fetch.blob() returns a valid Blob for File constructor.
      const file = new File([blob], `ai-gen-${Date.now()}.jpg`, { type: "image/jpeg" });
      return await uploadToFirebase(file, folder);
    } catch (e) {
      console.error("Base64 Upload Error", e);
      return null;
    }
  };

  // --- HANDLERS ---
  const handleHeroSave = () => {
    updateHeroText(heroHead, heroSub);
    alert('Hero updated!');
  };

  const handleAssetUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadToFirebase(e.target.files[0], 'assets');
      if (url) {
        updateAssets({ [key]: url });
      }
    }
    e.target.value = '';
  };

  // --- PRODUCT LOGIC ---
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', category: ProductCategory.COPPER, price: 0, availability: 'InStock', description: '', amazonUrl: '', features: []
  });
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [isGeneratingFeatures, setIsGeneratingFeatures] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setNewProduct(prev => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index)
    }));
  };

  const handleGenerateFeatures = async () => {
    if (!newProduct.name || !newProduct.description) return alert("Enter Product Name and Description first");

    setIsGeneratingFeatures(true);
    try {
      const prompt = `
            Analyze this product and generate 5 premium, benefit-driven feature bullet points (max 6 words each).
            Product: ${newProduct.name}
            Category: ${newProduct.category}
            Description: ${newProduct.description}
            
            Return ONLY a raw JSON array of strings. Example: ["Hand-hammered finish", "100% pure copper"]
          `;

      const text = await callOpenAI(prompt);

      if (text) {
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const features = JSON.parse(jsonString);
        if (Array.isArray(features)) {
          setNewProduct(prev => ({ ...prev, features }));
        }
      }
    } catch (e) {
      console.error("Feature Gen Error", e);
      alert("Failed to generate features.");
    } finally {
      setIsGeneratingFeatures(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!newProduct.name) return alert("Enter Product Name first");

    setIsGeneratingDesc(true);
    try {
      const prompt = `
            Write a premium, short, and compelling product description (2-3 sentences) for:
            Product Name: ${newProduct.name}
            Category: ${newProduct.category}
            Brand Voice: Elegant, elemental, heritage, luxury.
            
            Return ONLY the raw description text. No quotes.
          `;

      const text = await callOpenAI(prompt);

      if (text) {
        setNewProduct(prev => ({ ...prev, description: text.trim() }));
      }
    } catch (e) {
      console.error("Desc Gen Error", e);
      alert("Failed to generate description.");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description) return alert("Fill in required fields");

    const prodId = newProduct.id || newProduct.name!.toLowerCase().replace(/\s/g, '-');

    const product: Product = {
      id: prodId,
      name: newProduct.name!,
      subtitle: newProduct.subtitle || 'Premium Quality',
      price: newProduct.price,
      availability: newProduct.availability || 'InStock',
      description: newProduct.description!,
      features: newProduct.features || [],
      category: newProduct.category as ProductCategory,
      images: newProduct.images || [],
      rating: newProduct.rating || 5,
      reviews: newProduct.reviews || 0,
      isBestSeller: newProduct.isBestSeller,
      isNew: newProduct.isNew,
      amazonUrl: newProduct.amazonUrl
    };

    const existingIndex = config.products.findIndex(p => p.id === prodId);
    if (existingIndex >= 0 || isEditingProduct) {
      updateProduct(product);
      alert("Product Updated Successfully");
    } else {
      addProduct(product);
      alert("Product Added Successfully");
    }

    setNewProduct({ name: '', category: ProductCategory.COPPER, price: 0, availability: 'InStock', description: '', amazonUrl: '', features: [] });
    setIsEditingProduct(false);
  };

  const handleEditProduct = (p: Product) => {
    setNewProduct(p);
    setIsEditingProduct(true);
    const form = document.getElementById('product-form');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadToFirebase(e.target.files[0], 'products');
      if (url) {
        setNewProduct(prev => ({ ...prev, images: [url] }));
      }
    }
    e.target.value = '';
  };

  // --- JOURNAL LOGIC ---
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogCover, setBlogCover] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogTags, setBlogTags] = useState('');
  const [blogMeta, setBlogMeta] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('');
  // AEO Direct Answer Block state
  const [aeoQuestion, setAeoQuestion] = useState('');
  const [aeoAnswer, setAeoAnswer] = useState('');
  const [aeoListItems, setAeoListItems] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  interface PendingImagePlan {
    draftContent: string;
    coverPrompt: string;
    inlineJobs: Array<{ fullMatch: string; originalPrompt: string; prompt: string }>;
    conciseAltText: string;
  }
  const [pendingImagePlan, setPendingImagePlan] = useState<PendingImagePlan | null>(null);

  const [targetProduct, setTargetProduct] = useState('');
  const [targetProductBase64s, setTargetProductBase64s] = useState<string[]>([]);
  const [targetProductImagePreviews, setTargetProductImagePreviews] = useState<string[]>([]);

  const [blogContentDirection, setBlogContentDirection] = useState('');

  const [coverImgDir, setCoverImgDir] = useState('');
  const [inlineImg1Dir, setInlineImg1Dir] = useState('');
  const [inlineImg2Dir, setInlineImg2Dir] = useState('');

  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Scheduling state
  const [postStatus, setPostStatus] = useState<'draft' | 'scheduled' | 'published'>('published');
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Post Idea Generator State
  interface PostIdea {
    title: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    searchIntent: 'informational' | 'commercial' | 'transactional' | 'lifestyle';
    contentPillar: 'care' | 'cocktails' | 'entertaining' | 'gifting' | 'design' | 'wellness' | 'comparisons';
    contentDirection: string;
    targetProduct: string;
    coverImageDirection: string;
    inlineImage1Direction: string;
    inlineImage2Direction: string;
  }
  const [postIdeas, setPostIdeas] = useState<PostIdea[]>([]);
  const [ideaTitleHistory, setIdeaTitleHistory] = useState<string[]>([]);
  const [ideaKeywordHistory, setIdeaKeywordHistory] = useState<string[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);

  useEffect(() => {
    try {
      setIdeaTitleHistory(JSON.parse(localStorage.getItem('moscow_mix_idea_title_history') || '[]'));
      setIdeaKeywordHistory(JSON.parse(localStorage.getItem('moscow_mix_idea_keyword_history') || '[]'));
    } catch {
      localStorage.removeItem('moscow_mix_idea_title_history');
      localStorage.removeItem('moscow_mix_idea_keyword_history');
    }
  }, []);

  const normalizeIdeaText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const ideaSimilarity = (left: string, right: string) => {
    const ignored = new Set(['a', 'an', 'and', 'are', 'best', 'for', 'how', 'in', 'of', 'the', 'to', 'with', 'why', 'your']);
    const leftWords = new Set(normalizeIdeaText(left).split(' ').filter(word => word && !ignored.has(word)));
    const rightWords = new Set(normalizeIdeaText(right).split(' ').filter(word => word && !ignored.has(word)));
    if (!leftWords.size || !rightWords.size) return 0;
    const intersection = [...leftWords].filter(word => rightWords.has(word)).length;
    const union = new Set([...leftWords, ...rightWords]).size;
    return intersection / union;
  };

  const parseIdeaResponse = (text: string): PostIdea[] => {
    try {
      return JSON.parse(text);
    } catch {
      let json = text;
      if (text.includes('```json')) json = text.split('```json')[1]?.split('```')[0] || text;
      else if (text.includes('```')) json = text.split('```')[1]?.split('```')[0] || text;
      const match = json.match(/\[[\s\S]*\]/);
      return JSON.parse((match?.[0] || json).trim());
    }
  };

  // Generate six copper-only ideas and keep refreshing away from prior angles.
  const generatePostIdeas = async () => {
    setIsLoadingIdeas(true);
    try {
      const copperProducts = config.products.filter(product => product.category === ProductCategory.COPPER);
      if (!copperProducts.length) throw new Error('No copper products are available in the product catalog.');
      const catalogProducts = copperProducts.map(product => `- ${product.name}: ${product.description}`).join('\n');
      const catalogNames = new Map(copperProducts.map(product => [normalizeIdeaText(product.name), product.name]));
      const existingPostTitles = config.blogPosts.map(post => post.title);
      const excludedTitles = [...existingPostTitles, ...ideaTitleHistory];
      const accepted: PostIdea[] = [];
      const excludedKeywords = [...ideaKeywordHistory];

      for (let round = 0; round < 2 && accepted.length < 6; round += 1) {
        const needed = 6 - accepted.length;
        const text = await callOpenAI(`You are the SEO content strategist for Moscow Mix, a premium pure-copper drinkware and barware brand.

Create ${needed} fresh journal ideas. COPPER PRODUCTS ONLY. Never propose fire starters, campfires, fireplaces, kindling, wood wool, outdoor fire, or any non-copper product.

ACTUAL MOSCOW MIX COPPER CATALOG (targetProduct must copy one name exactly):
${catalogProducts}

GOOGLE-STYLE SEARCH-DEMAND SEED CLUSTERS:
- Short-tail products: copper mugs, Moscow Mule mugs, pure copper mugs, copper water bottle, copper pitcher, copper jug, copper barware, copper drinkware
- Questions and care: how to clean copper mugs, are copper mugs safe, why Moscow Mules use copper mugs, copper mug tarnish, copper patina, how to clean a copper water bottle
- Comparisons: copper mugs vs stainless steel mugs, copper water bottle vs stainless steel, copper pitcher vs glass pitcher
- Purchase and gifting: best copper mugs, copper gifts, wedding gifts, anniversary gifts, housewarming gifts, bar cart accessories
- Experiences and events: Moscow Mule recipe, cocktail party ideas, wedding bar ideas, summer cocktails, holiday drinks, home entertaining, tablescape ideas
- Lifestyle and aesthetics: copper kitchen decor, home bar design, elevated hosting, drink presentation, daily hydration ritual

Use these as query families, not as claims of exact volume. Never invent volume numbers. Blend one natural primary keyword with useful long-tail questions and clear buyer intent. Health/wellness ideas must not claim that copper treats, cures, detoxifies, or prevents disease; distinguish tradition from established evidence.

NEVER repeat or lightly rewrite these existing or previously shown titles:
${[...excludedTitles, ...accepted.map(idea => idea.title)].map(title => `- ${title}`).join('\n') || '- None'}

NEVER reuse these primary keywords in this refresh:
${[...excludedKeywords, ...accepted.map(idea => idea.primaryKeyword)].map(keyword => `- ${keyword}`).join('\n') || '- None'}

Across this one set, spread ideas across at least five different pillars: care, cocktails, entertaining, gifting, design, wellness, comparisons. Use distinct search intent, audience, occasion, title structure, and article angle for every card. An idea is not new if only the season, number, adjective, or word order changed.

Return ONLY a JSON array with ${needed} objects, each containing exactly:
{
  "title": "natural SEO title, normally 45-70 characters",
  "primaryKeyword": "one realistic search phrase",
  "secondaryKeywords": ["2-4 closely related long-tail phrases"],
  "searchIntent": "informational|commercial|transactional|lifestyle",
  "contentPillar": "care|cocktails|entertaining|gifting|design|wellness|comparisons",
  "contentDirection": "2-3 specific sentences explaining the audience, question and useful answer",
  "targetProduct": "exact catalog product name",
  "coverImageDirection": "premium editorial scene; the exact product is naturally used in the activity, never displayed separately",
  "inlineImage1Direction": "different premium scene; the exact product is naturally used for its intended purpose",
  "inlineImage2Direction": "third distinct scene; the exact product is integrated naturally, never displayed as a prop"
}`, 'ideas');

        const candidates = parseIdeaResponse(text);
        if (!Array.isArray(candidates)) continue;
        for (const candidate of candidates) {
          if (!candidate?.title || !candidate?.primaryKeyword || !candidate?.targetProduct) continue;
          const exactProduct = catalogNames.get(normalizeIdeaText(candidate.targetProduct));
          if (!exactProduct) continue;
          const comparedTitles = [...excludedTitles, ...accepted.map(idea => idea.title)];
          if (comparedTitles.some(title => normalizeIdeaText(title) === normalizeIdeaText(candidate.title) || ideaSimilarity(title, candidate.title) >= 0.52)) continue;
          const comparedKeywords = [...excludedKeywords, ...accepted.map(idea => idea.primaryKeyword)];
          if (comparedKeywords.some(keyword => normalizeIdeaText(keyword) === normalizeIdeaText(candidate.primaryKeyword))) continue;
          accepted.push({
            ...candidate,
            targetProduct: exactProduct,
            secondaryKeywords: Array.isArray(candidate.secondaryKeywords) ? candidate.secondaryKeywords.slice(0, 4) : [],
          });
          if (accepted.length === 6) break;
        }
      }

      if (accepted.length !== 6) throw new Error('The generator could not produce six sufficiently different copper ideas. Please click New Ideas once more.');
      setPostIdeas(accepted);
      const nextTitles = [...ideaTitleHistory, ...accepted.map(idea => idea.title)].slice(-150);
      const nextKeywords = [...ideaKeywordHistory, ...accepted.map(idea => idea.primaryKeyword)].slice(-150);
      setIdeaTitleHistory(nextTitles);
      setIdeaKeywordHistory(nextKeywords);
      localStorage.setItem('moscow_mix_idea_title_history', JSON.stringify(nextTitles));
      localStorage.setItem('moscow_mix_idea_keyword_history', JSON.stringify(nextKeywords));
    } catch (error) {
      console.error('Error generating ideas:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate ideas: ${message}`);
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  // When user clicks an idea, populate all the form fields
  const selectPostIdea = (idea: PostIdea) => {
    setBlogTitle(idea.title);
    setBlogContentDirection(idea.contentDirection);
    setTargetProduct(idea.targetProduct);
    setCoverImgDir(idea.coverImageDirection);
    setInlineImg1Dir(idea.inlineImage1Direction);
    setInlineImg2Dir(idea.inlineImage2Direction);
    setPostIdeas([]); // Clear ideas after selection

    // Scroll to the title field
    const titleInput = document.querySelector('input[placeholder="Enter compelling title..."]');
    if (titleInput) {
      titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    contentEditableRef.current?.focus();
  };

  const handleEditorLink = () => {
    const url = prompt("Enter link URL:");
    if (url) execCmd('createLink', url);
  };

  const handleInlineImageClick = () => {
    inlineImageInputRef.current?.click();
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = await uploadToFirebase(file, 'blog-content');
      if (url) {
        const imgHtml = `<div class="image-block"><img src="${url}" alt="Moscow Mix journal image" /></div><br/>`;
        execCmd('insertHTML', imgHtml);
      }
    }
    e.target.value = '';
  };

  const handleSavePost = async () => {
    if (!blogTitle) return alert("Title required");

    // Validate scheduled date if scheduling
    if (postStatus === 'scheduled' && !scheduledDateTime) {
      return alert("Please select a date and time for scheduling");
    }

    const id = editingPostId || blogTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newSlug = blogSlug || blogTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // ===== SLUG CONFLICT VALIDATION =====
    // Check if this slug is already used by another post
    const existingPostWithSlug = config.blogPosts.find(post => {
      const postSlug = post.slug || post.id;
      // Skip the current post when editing
      if (editingPostId && post.id === editingPostId) return false;
      // Check for slug match
      return postSlug === newSlug;
    });

    if (existingPostWithSlug) {
      const confirmOverwrite = window.confirm(
        `⚠️ SLUG CONFLICT DETECTED!\n\n` +
        `The slug "${newSlug}" is already used by:\n` +
        `"${existingPostWithSlug.title}"\n\n` +
        `Please either:\n` +
        `• Edit the slug field to use a different URL\n` +
        `• Delete the existing post first\n\n` +
        `Click OK to go back and fix this.`
      );
      return; // Always return - don't allow duplicate slugs
    }
    // ===== END SLUG VALIDATION =====

    // Determine the display date based on status
    let displayDate: string;
    if (postStatus === 'scheduled' && scheduledDateTime) {
      displayDate = new Date(scheduledDateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else {
      displayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    const newPost: BlogPost = {
      id: id,
      title: blogTitle,
      excerpt: blogExcerpt || "Read more about this topic in our latest journal entry.",
      content: contentEditableRef.current?.innerHTML || blogContent,
      coverImage: blogCover || config.assets.heroVideoPoster,
      date: displayDate,
      author: blogAuthor || "Michael B.",
      readTime: "5 min read",
      slug: newSlug,
      tags: blogTags.split(',').map(t => t.trim()),
      metaDescription: blogMeta,
      // Scheduling fields
      status: postStatus,
      scheduledDate: postStatus === 'scheduled' ? scheduledDateTime : undefined,
      publishedAt: postStatus === 'published' ? new Date().toISOString() : undefined,
      // AEO Direct Answer Block
      aeoQuestion: aeoQuestion || undefined,
      aeoAnswer: aeoAnswer || undefined,
      aeoListItems: aeoListItems ? aeoListItems.split('\n').filter(item => item.trim()) : undefined
    };

    const statusMessages: Record<typeof postStatus, string> = {
      'draft': 'Draft Saved',
      'scheduled': `Post Scheduled for ${displayDate}`,
      'published': 'Post Published Successfully'
    };

    try {
      if (editingPostId) {
        await updateBlogPost(newPost);
        alert(statusMessages[postStatus].replace('Published', 'Updated'));
      } else {
        await addBlogPost(newPost);
        alert(statusMessages[postStatus]);
      }
      resetJournalForm();
    } catch (error) {
      console.error('Error saving post:', error);

      // Provide helpful error message based on error type
      let errorMessage = 'Failed to save post. ';
      const errorStr = error instanceof Error ? error.message : String(error);

      if (errorStr.includes('size') || errorStr.includes('too large') || errorStr.includes('1MB')) {
        errorMessage += 'The post may be too large (images too big). Try reducing image sizes.';
      } else if (errorStr.includes('permission') || errorStr.includes('denied')) {
        errorMessage += 'Permission denied. Check Firebase rules.';
      } else if (errorStr.includes('network') || errorStr.includes('offline')) {
        errorMessage += 'Network error. Check your internet connection.';
      } else if (errorStr.includes('quota')) {
        errorMessage += 'Firebase quota exceeded. Please try again later.';
      } else {
        errorMessage += `Error: ${errorStr.substring(0, 100)}`;
      }

      alert(errorMessage);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setBlogTitle(post.title);
    setBlogExcerpt(post.excerpt);
    setBlogContent(post.content);
    if (contentEditableRef.current) contentEditableRef.current.innerHTML = post.content;
    setBlogCover(post.coverImage);
    setBlogSlug(post.slug || '');
    setBlogTags(post.tags?.join(', ') || '');
    setBlogMeta(post.metaDescription || '');
    setBlogAuthor(post.author);

    // Load scheduling state
    setPostStatus(post.status || 'published');
    setScheduledDateTime(post.scheduledDate || '');

    // Load AEO fields
    setAeoQuestion(post.aeoQuestion || '');
    setAeoAnswer(post.aeoAnswer || '');
    setAeoListItems(post.aeoListItems?.join('\n') || '');

    setTargetProduct('');
    setTargetProductBase64s([]);
    setTargetProductImagePreviews([]);
    setBlogContentDirection('');
    setCoverImgDir('');
    setInlineImg1Dir('');
    setInlineImg2Dir('');
    setPendingImagePlan(null);

    const container = document.getElementById('journal-editor');
    if (container) container.scrollIntoView({ behavior: 'smooth' });
  };

  const resetJournalForm = () => {
    setEditingPostId(null);
    setBlogTitle('');
    setBlogExcerpt('');
    setBlogContent('');
    if (contentEditableRef.current) contentEditableRef.current.innerHTML = '';
    setBlogCover('');
    setBlogSlug('');
    setBlogTags('');
    setBlogMeta('');
    setTargetProduct('');
    setTargetProductBase64s([]);
    setTargetProductImagePreviews([]);
    setBlogContentDirection('');
    setCoverImgDir('');
    setInlineImg1Dir('');
    setInlineImg2Dir('');
    setPendingImagePlan(null);
    // Reset scheduling state
    setPostStatus('published');
    setScheduledDateTime('');
    // Reset AEO fields
    setAeoQuestion('');
    setAeoAnswer('');
    setAeoListItems('');
  };

  const handleDeletePost = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure?")) {
      deleteBlogPost(id);
      if (editingPostId === id) resetJournalForm();
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadToFirebase(e.target.files[0], 'blog-covers');
      if (url) setBlogCover(url);
    }
    e.target.value = '';
  };

  const handleTargetImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files).slice(0, 3);
    const readPromises = files.map(file => {
      return new Promise<{ preview: string, base64: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const image = new Image();
          image.onload = () => {
            const maxEdge = 1024;
            const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
            const context = canvas.getContext('2d');
            if (!context) return reject(new Error('Unable to prepare the reference image.'));
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            const optimized = canvas.toDataURL('image/jpeg', 0.84);
            resolve({ preview: optimized, base64: optimized });
          };
          image.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
          image.src = result;
        };
        reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
        reader.readAsDataURL(file);
      });
    });

    try {
      const results = await Promise.all(readPromises);
      setTargetProductImagePreviews(prev => [...prev, ...results.map(r => r.preview)]);
      setTargetProductBase64s(prev => [...prev, ...results.map(r => r.base64)]);
    } catch (error) {
      console.error("Error reading files:", error);
      alert("Failed to process images. Try again.");
    }

    e.target.value = '';
  };

  const removeTargetImage = (index: number) => {
    setTargetProductImagePreviews(prev => prev.filter((_, i) => i !== index));
    setTargetProductBase64s(prev => prev.filter((_, i) => i !== index));
  };

  // OpenAI image generation is routed through our private server endpoint.
  const generateImageFromPrompt = async (
    prompt: string,
    _modelType?: string,
    referenceImages?: string[]
  ): Promise<string> => {
    const image = await callOpenAI(
      `${prompt}. Photorealistic premium editorial photography for Moscow Mix. The uploaded image is an exact product identity reference only: integrate a faithful recreation of that product naturally into the lifestyle moment, never paste, overlay, frame, enlarge, isolate, or display the reference photo itself. The product must be used for its actual purpose in the scene and be at believable scale with matching perspective, lighting and contact shadows. If a person is present, they may naturally use the real handle, cap, or body with one anatomically correct hand. Natural human anatomy and facial proportions. No generic substitute vessel, text, packaging copy, invented logos, surreal objects, duplicate limbs, fused fingers, or distorted faces.`,
      'image',
      referenceImages || []
    );
    if (!image || typeof image !== 'string') throw new Error('OpenAI returned an empty image.');
    return image;
  };

  const parseJsonObject = (value: string) => {
    const cleaned = value.replace(/```json/g, '').replace(/```/g, '').trim();
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    return JSON.parse(objectMatch?.[0] || cleaned);
  };

  const generateValidatedImage = async (prompt: string, label: string, priorImages: string[] = []): Promise<string> => {
    let qualityFeedback = '';
    const maxGenerationAttempts = 3;
    for (let generationAttempt = 1; generationAttempt <= maxGenerationAttempts; generationAttempt += 1) {
      setGenerationStatus(`${label}: creating high-quality image${generationAttempt > 1 ? ' (quality retry)' : ''}...`);
      const rescueDirection = generationAttempt === maxGenerationAttempts
        ? ' FINAL RELIABLE COMPOSITION: Use a simple, elegant editorial product-in-use scene with no visible people, faces, hands, or limbs. Keep the setting and camera angle clearly different from earlier images. Show the exact reference product at realistic scale, naturally filled, served, or placed in its intended use context with coherent lighting, perspective, and contact shadows.'
        : '';
      const image = await generateImageFromPrompt(
        `${prompt} UNIQUE COMPOSITION LOCK: This is the ${label.toLowerCase()} in a three-image journal story. It must be visually distinct from the other images: use a different camera angle, framing, action, setting detail, body pose, and product placement. Never recreate or reuse another image from this post.${rescueDirection}${qualityFeedback ? ` CORRECT THESE PRIOR QUALITY FAILURES: ${qualityFeedback}` : ''}`,
        imageGenModel,
        targetProductBase64s
      );

      if (priorImages.includes(image)) {
        qualityFeedback = 'This is an exact duplicate of an earlier journal image. Create a completely different composition, camera angle, action, and setting.';
        continue;
      }

      setGenerationStatus(`${label}: checking product accuracy, quality and uniqueness...`);
      const referenceCount = Math.min(targetProductBase64s.length, 3);
      const qaText = await callOpenAI(`You are a strict ecommerce image quality inspector. The first ${referenceCount} image(s) are authoritative photographs of the genuine Moscow Mix target product. The next ${priorImages.length} image(s), if present, are already approved images from the same journal post. The final image is a proposed ${label.toLowerCase()}.

Reject the proposed image unless ALL are true:
1. The exact same product category, silhouette, proportions, cap/handle/rim/base, texture, finish, count and construction details are clearly preserved. A generic or merely similar copper product fails.
2. No extra, substituted, merged, enlarged, distorted or invented copper item appears.
3. Every visible person has realistic facial anatomy, eyes, mouth, hands, fingers, limbs and body proportions. No fused, missing, duplicate or object-like anatomy.
4. The product is naturally integrated and used for its actual purpose in the scene. It is not a pasted cut-out, isolated display, pedestal object, oversized foreground prop, or a reference-photo overlay. If a person interacts with it, their hand uses the true handle, cap, or body naturally and has correct anatomy. A generic glass or substitute product may not be used in place of the referenced Moscow Mix product.
5. The result looks like polished premium editorial photography, is sharp, coherent and commercially usable.
6. The proposed image is clearly different from every already approved journal image: it must not reuse the same scene, pose, crop, camera angle, product placement, action, or near-identical composition. A changed color grade or tiny crop does not make it unique.

Return only JSON:
{"pass":true,"productIdentityScore":0,"humanAnatomyScore":0,"editorialQualityScore":0,"uniqueComposition":true,"reasons":["specific issue"]}
Use scores from 0-100. When no person is visible, set humanAnatomyScore to 100. Reserve scores below 85 for clear, material defects—not minor stylistic differences. pass may be true only when productIdentityScore >= 88, humanAnatomyScore >= 90, editorialQualityScore >= 84, uniqueComposition is true, and there are no material defects.`, 'text', [...targetProductBase64s.slice(0, 3), ...priorImages, image]);
      const qa = parseJsonObject(qaText);
      // Use the measurable quality scores as the decision. The inspector's
      // boolean was occasionally false even when every required score passed,
      // which caused good image sets to fail unnecessarily.
      const passed = Number(qa.productIdentityScore) >= 88
        && Number(qa.humanAnatomyScore) >= 90
        && Number(qa.editorialQualityScore) >= 84
        && qa?.uniqueComposition === true;
      if (passed) return image;
      qualityFeedback = Array.isArray(qa?.reasons) && qa.reasons.length
        ? qa.reasons.join('; ')
        : 'The image did not preserve the exact product, professional human anatomy, or a distinct composition from the other images.';
    }
    throw new Error(`${label} could not produce a usable, distinct image after three automatic attempts. Your written draft is preserved.`);
  };

  const createAndApplyImageSet = async (plan: PendingImagePlan) => {
    if (targetProductBase64s.length === 0) throw new Error('The product reference photo is no longer available. Upload it again before retrying images.');
    if (plan.inlineJobs.length !== 2) throw new Error('The written draft did not contain both required image positions.');

    const prompts = [plan.coverPrompt, ...plan.inlineJobs.map(job => job.prompt)];
    const labels = ['Cover image', 'Inline image 1', 'Inline image 2'];
    // Generate sequentially so every later image can be compared against the
    // earlier approved images. Parallel generation allowed identical outputs
    // to slip through even when the textual prompts were different.
    const generated: string[] = [];
    for (const [index, prompt] of prompts.entries()) {
      generated.push(await generateValidatedImage(prompt, labels[index], generated));
    }

    setGenerationStatus('All three passed. Saving the complete image set...');
    const uploaded = await Promise.all([
      uploadBase64ToFirebase(generated[0], 'blog-covers'),
      uploadBase64ToFirebase(generated[1], 'blog-content'),
      uploadBase64ToFirebase(generated[2], 'blog-content'),
    ]);
    if (uploaded.some(url => !url)) throw new Error('One of the approved images could not be saved. The draft is preserved; retry the image set.');

    let completedContent = plan.draftContent;
    plan.inlineJobs.forEach((job, index) => {
      const imgTag = `<div class="image-block"><img src="${uploaded[index + 1]}" alt="${plan.conciseAltText}" /></div>`;
      completedContent = completedContent.replace(job.fullMatch, imgTag);
    });
    setBlogCover(uploaded[0] || '');
    setBlogContent(completedContent);
    if (contentEditableRef.current) contentEditableRef.current.innerHTML = completedContent;
    setPendingImagePlan(null);
  };

  const retryPendingImages = async () => {
    if (!pendingImagePlan) return;
    setIsGenerating(true);
    try {
      await createAndApplyImageSet(pendingImagePlan);
    } catch (error) {
      console.error('Image set retry failed', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Images were not applied: ${message}\n\nYour written draft is still preserved. You can retry the three images without rewriting it.`);
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const generateFullPost = async () => {
    if (!blogTitle) {
      alert("Please enter a Title first");
      return;
    }
    if (targetProductBase64s.length === 0) {
      alert("Please upload at least one Moscow Mix product photo. The AI uses it to keep every generated product accurate to what you sell.");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Analyzing product images & Writing content...');

    try {
      const productsContext = config.products
        .filter(product => product.category === ProductCategory.COPPER)
        .map(product => `${product.name} (ID: ${product.id})`)
        .join(', ');
      // Across each four-post sequence: 9 of 12 people are European, and 3 are
      // contemporary Chinese or Japanese adults. Cover and first inline image
      // remain European; the second inline image provides the rotating mix.
      const titleHash = Array.from(blogTitle).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const inlineTwoCasting = titleHash % 4 === 0
        ? 'Cast a European adult in contemporary, understated lifestyle clothing.'
        : 'Cast a contemporary Chinese or Japanese adult in modern, understated lifestyle clothing.';

      const prompt = `
        You are an expert luxury lifestyle editor for 'Moscow Mix' - a premium pure-copper drinkware and barware brand.
        
        TASK:
        1. FIRST, analyze the attached authentic Moscow Mix product image(s). Extract an EXTREMELY DETAILED "VISUAL DNA" description so the reference-based image workflow can preserve product identity:
           
           **HANDLE DETAILS (MOST IMPORTANT)**:
           - Handle material (copper, brass, stainless steel?)
           - Handle color (same as body? gold? brass?)
           - Handle shape (curved/flowing, angular/geometric, C-shaped, D-shaped?)
           - Handle attachment points (welded? riveted?)
           - Handle thickness and width
           
           **BODY DETAILS**:
           - Material texture (hammered copper with small/large dents? smooth? brushed?)
           - Body shape (barrel-shaped, cylindrical, tapered?)
           - Surface finish (polished, matte, patinated?)
           - Color palette (rose gold, classic copper, antique copper?)
           
           **OTHER FEATURES**:
           - Rim style (smooth, rolled, lipped?)
           - Any logos, engravings, or stamps
           - Base style (flat, footed?)
           
        2. Create a "PRODUCT DESCRIPTION STRING" that can be injected into image prompts. Format: "hammered copper mug with [exact handle description], [exact body description], [exact color]"
        
        3. DEEPLY ANALYZE THE CONTENT THEME:
           Before writing, think deeply about:
           - What is the CORE MESSAGE of "${blogTitle}"?
           - What EMOTIONS should readers feel?
           - What LIFESTYLE does this article promote?
           - How can images REINFORCE the narrative?
           - How can we SUBTLY PROMOTE the exact Moscow Mix copper product shown in the references?
        
        4. THEN, write a professional, SEO-optimized blog post (1500-1800 words) based on the title: "${blogTitle}".
        
        CONTEXT:
        - Brand: Moscow Mix - High-end pure copper drinkware and barware.
        - Target Product to Weave In: "${targetProduct || 'Our premium Copper Collection'}".
        - Available Products for linking: ${productsContext}.
        ${blogContentDirection ? `- SPECIFIC DIRECTION FROM EDITOR: "${blogContentDirection}"` : ""}
        
        REQUIREMENTS:
        1. LINKS: 
           - Include EXACTLY 2 internal links to the product IDs provided above. 
           - **CRITICAL**: Use standard relative paths for internal links. Example: <a href="/product/copper-mule-16oz" style="color: #3b82f6;">Product Name</a>. 
           - Include 2-3 external links to HIGH-AUTHORITY relevant domains (e.g., Wikipedia for historical context, authoritative cocktail/culinary sites, scientific journals for material properties).
           - External links must open in new tab: <a href="https://example.com" target="_blank" rel="noopener noreferrer" style="color: #3b82f6;">Link Text</a>
        2. FORMAT:
           - Use semantic HTML (<h2>, 3-4 sentences per paragraph, <h3> for subsections).
           - Do NOT use markdown. Return raw HTML.
         3. IMAGES - **CRITICAL REQUIREMENTS**:
            - You MUST insert exactly 2 image placeholders within the HTML content at logical section breaks.
            - Use this EXACT format: <div class="image-placeholder" data-prompt="Detailed visual description"></div>
            
            **MANDATORY IMAGE REQUIREMENTS FOR MOSCOW MIX:**
            
            Analyze the product images provided and create accurate prompts. Match the product appearance EXACTLY.
            
            **COVER IMAGE (MANDATORY):**
            - MUST feature a REAL PERSON (man or woman, diverse representation encouraged)
            - Cast a European adult in contemporary, understated lifestyle clothing. Avoid cultural stereotypes.
            - Person should EMBODY the lifestyle/emotion of the article
            - The exact Moscow Mix product must be naturally integrated into the main activity at realistic scale, with appropriate physical use and believable lighting, perspective, and contact shadows
            - The product must be integrated into the actual activity, not placed separately as a display object; a person may naturally use it by its true handle, cap, or body
            - Setting should VISUALLY SUMMARIZE the article's message
            - Think: "What single image makes someone want to read this article?"
            ${coverImgDir ? `- SPECIFIC DIRECTION: "${coverImgDir}"` : ''}
            
            **INLINE IMAGE 1 (MANDATORY - MUST INCLUDE HAPPY PERSON):**
            - MUST feature a HAPPY person (genuine smile, relaxed, enjoying the moment)
            - Cast a European adult in contemporary, understated lifestyle clothing. Avoid cultural stereotypes.
            - Person should be genuinely engaged with the exact product in the activity where appropriate (for example, mixing or serving a drink in the Moscow Mix mug), never using a generic glass while the target product is sidelined
            - Should feel like authentic lifestyle photography, not staged
            ${inlineImg1Dir ? `- SPECIFIC DIRECTION: "${inlineImg1Dir}"` : '- Must be contextually relevant to the surrounding paragraph content.'}
            
            **INLINE IMAGE 2:**
            - Can be product-focused or include people
            - ${inlineTwoCasting} Avoid cultural stereotypes.
            - Should be contextually relevant to surrounding paragraph content
            - Should subtly reinforce Moscow Mix brand lifestyle
            ${inlineImg2Dir ? `- SPECIFIC DIRECTION: "${inlineImg2Dir}"` : ''}
            
         4. OUTPUT:
            - Return ONLY a valid JSON object.
           {
             "visualDNA": "Your detailed visual DNA analysis here",
             "productDescriptionString": "hammered copper Moscow Mule mug with curved flowing copper handle matching the body color, barrel-shaped body with small hammered dents, polished rose-gold copper finish",
             "contentThemeAnalysis": "Brief analysis of the article's core message, emotions, and how images will reinforce it",
             "excerpt": "Engaging summary (150 chars)",
             "content": "Full HTML body...",
             "slug": "SEO-OPTIMIZED URL SLUG - FOLLOW THESE RULES EXACTLY:
                1. Use the PRIMARY KEYWORD from the title FIRST (e.g., 'moscow-mule-recipe' not 'how-to-make-moscow-mule')
                2. Keep it SHORT: 3-5 words max, under 60 characters total
                3. Use ONLY lowercase letters and hyphens (no underscores, numbers, or special chars)
                4. REMOVE all stop words (the, a, an, is, are, how, to, for, with, and, or, of, in, on)
                5. Make it EVERGREEN - avoid dates or temporary references
                6. Be DESCRIPTIVE but CONCISE (e.g., 'copper-mug-care-guide' not 'how-to-clean-copper')
                7. Include BRAND terms only if highly relevant (e.g., 'moscow-mule' is good, 'moscow-mix' is not)
                8. AEO-FRIENDLY: Optimize for voice search queries (natural language patterns)
                EXAMPLE GOOD SLUGS: 'moscow-mule-recipe', 'copper-mug-care-guide', 'copper-water-bottle', 'copper-pitcher-drinks'
                EXAMPLE BAD SLUGS: 'how-to-make-perfect-moscow-mule-at-home', 'the-best-way-to-care-for-copper', '2024-tips'",
             "tags": ["tag1", "tag2"],
             "metaDescription": "SEO meta description",
             "coverImagePrompt": "The EXACT PRODUCT DESCRIPTION STRING used naturally in the central activity, with a [ethnicity] [man/woman] in their [age]s using its real handle, cap, or body in a physically believable way; never a pedestal display or pasted product cut-out; warm natural lighting, photorealistic magazine editorial quality",
             "inlineImagePrompts": [
               "The EXACT PRODUCT DESCRIPTION STRING naturally used in the scene by a happy [man/woman] with realistic hands, [lifestyle setting]; the product is the authentic vessel or object used for the activity, never a separate display prop, photorealistic candid editorial photography",
               "Second inline image prompt with product and context"
             ],
             "aeoQuestion": "The primary question this article answers, phrased exactly as users would search. Example: 'What is the best way to clean copper mugs?' Start with What/How/Why.",
             "aeoAnswer": "A 40-60 word direct answer. Start with the subject noun (e.g., 'Copper mugs...'), never pronouns. Must stand completely alone if extracted from the article.",
             "aeoListItems": ["Key step or point 1", "Key step or point 2", "Key step or point 3"]
           }
      `;

      const text = await callOpenAI(prompt, 'text', targetProductBase64s);

      if (!text) throw new Error("No text generated");

      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonString);

      setBlogExcerpt(data.excerpt);
      setBlogSlug(data.slug);
      setBlogTags(data.tags.join(', '));
      setBlogMeta(data.metaDescription);

      // Set AEO fields from AI generation
      if (data.aeoQuestion) setAeoQuestion(data.aeoQuestion);
      if (data.aeoAnswer) setAeoAnswer(data.aeoAnswer);
      if (data.aeoListItems && Array.isArray(data.aeoListItems)) {
        setAeoListItems(data.aeoListItems.join('\n'));
      }

      // Preserve the complete written draft before any slower image work begins.
      const draftContent = String(data.content || '');
      setBlogContent(draftContent);
      if (contentEditableRef.current) contentEditableRef.current.innerHTML = draftContent;

      setGenerationStatus('Preparing the cover and two article images...');
      const coverPrompt = `${data.coverImagePrompt || `A professional magazine-quality photo for a blog post about ${blogTitle}. ${blogContentDirection || ''}.`} CASTING REQUIREMENT: Cast a European adult in contemporary, understated lifestyle clothing. The authentic Moscow Mix reference product must be naturally used in the real activity, at believable scale, with correct lighting and perspective. Do not use a generic glass or separate display pedestal. Avoid cultural stereotypes.`;

      // Improved regex to handle various attribute orderings if necessary, but standardizing on the one we generated
      const placeholderRegex = /<div class="image-placeholder" data-prompt="([^"]+)"><\/div>/g;

      // transform to array to avoid iterator issues during async replacement
      const matches = Array.from(draftContent.matchAll(placeholderRegex));

      const inlineJobs = matches.slice(0, 2).map((match, index) => {
        const originalPrompt = match[1];
        const casting = index === 0
          ? 'CASTING REQUIREMENT: Cast a European adult in contemporary, understated lifestyle clothing. Avoid cultural stereotypes.'
          : `CASTING REQUIREMENT: ${inlineTwoCasting} Avoid cultural stereotypes.`;
        return { fullMatch: match[0], originalPrompt, prompt: `${originalPrompt} ${casting} The authentic Moscow Mix reference product must be naturally used in the real activity, at believable scale, with correct lighting and perspective. Do not use a generic substitute vessel or separate display pedestal.` };
      });

      const conciseAltText = [targetProduct || 'Moscow Mix product', blogTitle]
        .join(' ')
        .replace(/[^a-zA-Z0-9\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .slice(0, 10)
        .join(' ');
      const imagePlan: PendingImagePlan = { draftContent, coverPrompt, inlineJobs, conciseAltText };
      setPendingImagePlan(imagePlan);
      await createAndApplyImageSet(imagePlan);

    } catch (error) {
      console.error('AI journal generation failed', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`AI generation stopped: ${errorMessage}\n\nThe written draft and image plan are preserved whenever writing completed. Use “Retry 3 Images” instead of rewriting the post.`);
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const [storyHead, setStoryHead] = useState(config.story.headline);
  const [storyNarrative, setStoryNarrative] = useState(config.story.narrative);

  const handleStorySave = () => {
    updateStory({ ...config.story, headline: storyHead, narrative: storyNarrative });
    alert("Story Updated");
  };

  const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadToFirebase(e.target.files[0], 'story');
      if (url) updateStory({ ...config.story, heroImage: url });
    }
    e.target.value = '';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-stone-900 p-8 border border-stone-800 rounded-lg">
          <div className="flex justify-center mb-6">
            <Lock className="text-copper-500" size={48} />
          </div>
          <h1 className="text-2xl font-serif text-white text-center mb-8">Admin Access</h1>

          {/* Email/Username Field */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Email or Username"
              className="w-full bg-stone-950 border border-stone-800 p-4 pl-12 text-white focus:border-copper-500 outline-none"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              autoComplete="username"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
          </div>

          {/* Password Field */}
          <div className="relative mb-6">
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-stone-950 border border-stone-800 p-4 pl-12 text-white focus:border-copper-500 outline-none"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoComplete="current-password"
            />
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
          </div>

          <button className="w-full bg-copper-600 hover:bg-copper-500 text-white font-bold py-4 uppercase tracking-widest transition-colors">Login</button>

          <button type="button" onClick={() => setShowHint(!showHint)} className="w-full text-center text-xs text-stone-500 hover:text-copper-400 mt-4 underline">
            {showHint ? "Hide Hint" : "Forgot Password? Show Hint"}
          </button>

          {showHint && (
            <div className="mt-2 p-3 bg-stone-800 rounded border border-stone-700 text-center animate-fade-in">
              <p className="text-stone-400 text-xs">Default: <span className="text-white font-bold tracking-wide">admin / admin</span></p>
            </div>
          )}
        </form>
      </div>
    );
  }

  const ASSET_LABELS: Record<string, string> = {
    heroVideoPoster: "Hero Background (Home)",
    fireStarterHero: "Fire Collection Header",
    copperHero: "Copper Collection Header",
    brandMark: "Brand Mark (Home: Story Section)",
    lifestyleRitual: "Lifestyle Image (Home: Ritual Section)",
    textureWood: "Wood Texture",
    textureCopper: "Copper Texture",
    lifestyleCabin: "Cabin Lifestyle",
    lifestyleKitchen: "Kitchen Lifestyle",
    videoCopperMug: "Copper Mug Video (30s)",
    videoCopperBottle: "Copper Bottle Video (30s)",
    videoCopperJug: "Copper Jug Video (30s)",
    logo: "Main Logo"
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans">
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-stone-950/90 backdrop-blur-sm flex flex-col items-center justify-center">
          <Sparkles className="text-copper-400 animate-spin mb-4" size={48} />
          <h2 className="text-2xl font-serif text-white">AI is crafting your post...</h2>
          <p className="text-stone-400 mt-2 font-mono text-sm">{generationStatus}</p>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col">
          <div className="p-6 border-b border-stone-800">
            <h2 className="font-serif text-xl text-white">Moscow Mix</h2>
            <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {/* Writers only see Journal */}
            {currentUser?.role !== 'writer' && (
              <button onClick={() => setActiveTab('hero')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'hero' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
                <Layout size={18} /> Hero & Logo
              </button>
            )}
            {currentUser?.role !== 'writer' && (
              <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'products' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
                <ShoppingBag size={18} /> Products
              </button>
            )}
            <button onClick={() => setActiveTab('journal')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'journal' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
              <BookOpen size={18} /> Journal
            </button>
            {currentUser?.role !== 'writer' && (
              <button onClick={() => setActiveTab('story')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'story' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
                <Type size={18} /> Our Story
              </button>
            )}
            {currentUser?.role !== 'writer' && (
              <button onClick={() => setActiveTab('assets')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'assets' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
                <ImageIcon size={18} /> Global Assets
              </button>
            )}
            {currentUser?.role !== 'writer' && (
              <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'settings' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
                <Settings size={18} /> Settings
              </button>
            )}
            {currentUser?.role !== 'writer' && (
              <button onClick={() => setActiveTab('team')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'team' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
                <Users size={18} /> Team
              </button>
            )}
          </nav>

          <div className="p-4">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-copper-900/30 text-copper-400 border border-copper-900/50 hover:bg-copper-900/50 hover:text-white rounded-md transition-colors mb-2"
            >
              <ExternalLink size={18} /> View Live Site
            </Link>
          </div>

          <div className="p-4 border-t border-stone-800">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-500 hover:text-red-400 transition-colors">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-stone-950 p-8">
          {activeTab === 'hero' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <h1 className="text-3xl font-serif text-white mb-8">Hero Configuration</h1>
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Logo Upload</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-16 bg-stone-900 border border-stone-800 flex items-center justify-center">
                    {config.assets.logo ? <img src={config.assets.logo} className="max-h-12 max-w-full" /> : <span className="text-xs text-stone-600">No Logo</span>}
                  </div>
                  <label className="cursor-pointer bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                    <Upload size={14} /> Upload New
                    <input type="file" className="hidden" onChange={(e) => handleAssetUpload('logo', e)} accept="image/*" />
                  </label>
                  <span className="text-xs text-stone-500 italic">Recommended: 500x200px Transparent PNG</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Headline (HTML Supported)</label>
                <textarea className="w-full bg-stone-900 border border-stone-800 p-4 text-white focus:border-copper-500 outline-none font-serif text-xl" rows={3} value={heroHead} onChange={(e) => setHeroHead(e.target.value)} />
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Subheadline</label>
                <textarea className="w-full bg-stone-900 border border-stone-800 p-4 text-stone-300 focus:border-copper-500 outline-none" rows={3} value={heroSub} onChange={(e) => setHeroSub(e.target.value)} />
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Hero Background Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-48 h-24 bg-stone-900 border border-stone-800 overflow-hidden">
                    <img src={config.assets.heroVideoPoster} className="w-full h-full object-cover" />
                  </div>
                  <label className="cursor-pointer bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                    <Upload size={14} /> Change Image
                    <input type="file" className="hidden" onChange={(e) => handleAssetUpload('heroVideoPoster', e)} accept="image/*" />
                  </label>
                  <span className="text-xs text-stone-500 italic">Rec: 1920x1080px JPG</span>
                </div>
              </div>
              <button onClick={handleHeroSave} className="bg-copper-600 hover:bg-copper-500 text-white px-8 py-3 uppercase tracking-widest text-sm font-bold flex items-center gap-2"><Save size={16} /> Save Changes</button>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
              <div className="flex justify-between items-end border-b border-stone-800 pb-6"><h1 className="text-3xl font-serif text-white">Product Manager</h1></div>
              <div id="product-form" className="bg-stone-900 p-8 border border-stone-800 rounded-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-serif text-xl">{isEditingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  {isEditingProduct && (<button onClick={() => { setIsEditingProduct(false); setNewProduct({ name: '', category: ProductCategory.COPPER, price: 0, availability: 'InStock', description: '', amazonUrl: '', features: [] }); }} className="text-stone-500 hover:text-white text-xs uppercase tracking-widest">Cancel Edit</button>)}
                </div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <input type="text" placeholder="Product Name" className="bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                  <select className="bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value as ProductCategory })} >
                    <option value={ProductCategory.COPPER}>Copper Drinkware</option>
                    <option value={ProductCategory.FIRE}>Fire Starters</option>
                  </select>
                </div>

                <div className="mb-6 relative">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Description</label>
                    <button
                      onClick={handleGenerateDescription}
                      disabled={isGeneratingDesc}
                      className="text-xs text-copper-400 hover:text-white flex items-center gap-1 border border-copper-900/50 bg-copper-900/20 px-3 py-1 rounded transition-colors"
                    >
                      {isGeneratingDesc ? <span className="animate-pulse">Writing...</span> : <><Sparkles size={12} /> Auto-Write Description</>}
                    </button>
                  </div>
                  <textarea placeholder="Description" rows={3} className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                </div>

                {/* FEATURES MANAGEMENT */}
                <div className="mb-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-bold flex items-center gap-2"><List size={14} /> Key Features & Benefits</label>
                    <button
                      onClick={handleGenerateFeatures}
                      disabled={isGeneratingFeatures}
                      className="text-xs text-copper-400 hover:text-white flex items-center gap-1 border border-copper-900/50 bg-copper-900/20 px-3 py-1 rounded transition-colors"
                    >
                      {isGeneratingFeatures ? <span className="animate-pulse">Generating...</span> : <><Sparkles size={12} /> Auto-Generate Features</>}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newProduct.features?.map((feat, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-stone-950 border border-stone-800 p-2 text-sm text-stone-300 focus:border-copper-500 outline-none"
                          value={feat}
                          onChange={(e) => {
                            const updated = [...(newProduct.features || [])];
                            updated[idx] = e.target.value;
                            setNewProduct(prev => ({ ...prev, features: updated }));
                          }}
                        />
                        <button onClick={() => handleRemoveFeature(idx)} className="p-2 bg-stone-800 hover:bg-red-900/50 text-stone-500 hover:text-red-400"><XIcon size={14} /></button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a feature (e.g. 'Naturally Antimicrobial')"
                        className="flex-1 bg-stone-950 border border-stone-800 p-2 text-sm text-stone-500 focus:text-white focus:border-copper-500 outline-none"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                      />
                      <button onClick={handleAddFeature} className="p-2 bg-stone-800 hover:bg-stone-700 text-white"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>

                <div className="mb-6"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold block mb-2">Amazon Product URL</label><input type="url" placeholder="https://amazon.com/dp/..." className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none" value={newProduct.amazonUrl} onChange={e => setNewProduct({ ...newProduct, amazonUrl: e.target.value })} /></div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-bold block mb-2">Current Price (USD)</label>
                    <input type="number" min="0" step="0.01" placeholder="34.95" className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none" value={newProduct.price || ''} onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || undefined })} />
                    <span className="text-stone-600 text-xs mt-1 block">Only enter a price you keep current. It will appear on the product page and in Google product data.</span>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-bold block mb-2">Availability</label>
                    <select className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none" value={newProduct.availability || 'InStock'} onChange={e => setNewProduct({ ...newProduct, availability: e.target.value as 'InStock' | 'OutOfStock' })}>
                      <option value="InStock">In stock</option>
                      <option value="OutOfStock">Out of stock</option>
                    </select>
                  </div>
                </div>

                {/* Rating & Reviews Fields */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-bold block mb-2">Rating (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      placeholder="4.8"
                      className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none"
                      value={newProduct.rating || ''}
                      onChange={e => setNewProduct({ ...newProduct, rating: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-bold block mb-2">Reviews Count</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="1250"
                      className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none"
                      value={newProduct.reviews || ''}
                      onChange={e => setNewProduct({ ...newProduct, reviews: parseInt(e.target.value) || 0 })}
                    />
                    <span className="text-stone-600 text-xs mt-1 block">From Amazon product page</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <label className="cursor-pointer bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                    <Upload size={14} /> {newProduct.images?.[0] ? 'Replace Image' : 'Upload Main Image'}
                    <input type="file" className="hidden" onChange={handleProductImageUpload} accept="image/*" />
                  </label>
                  <span className="text-stone-500 text-xs italic">Rec: 800x1000px Portrait</span>
                  {newProduct.images?.[0] && <img src={newProduct.images[0]} className="h-16 w-16 object-contain border border-stone-700" />}
                </div>
                <button onClick={handleAddProduct} className="bg-white text-stone-950 hover:bg-copper-500 hover:text-white px-6 py-3 uppercase tracking-widest text-xs font-bold">{isEditingProduct ? 'Update Product' : 'Add Product'}</button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {config.products.map((p, index) => (
                  <div key={p.id} className="flex items-center gap-4 bg-stone-900 p-4 border border-stone-800">
                    <img src={p.images[0]} className="w-16 h-20 object-contain bg-stone-950" />
                    <div className="flex-1">
                      <h4 className="text-white font-serif">{p.name}</h4>
                      <p className="text-stone-500 text-xs">{p.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => reorderProduct(p.id, 'up')}
                        disabled={index === 0}
                        className={`text-stone-500 p-2 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-white transition-colors'}`}
                        title="Move Up"
                      >
                        <ArrowUp size={18} />
                      </button>
                      <button
                        onClick={() => reorderProduct(p.id, 'down')}
                        disabled={index === config.products.length - 1}
                        className={`text-stone-500 p-2 ${index === config.products.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-white transition-colors'}`}
                        title="Move Down"
                      >
                        <ArrowDown size={18} />
                      </button>
                      <button onClick={() => handleEditProduct(p)} className="text-stone-500 hover:text-white transition-colors p-2" title="Edit Product"><Edit2 size={18} /></button>
                      <button onClick={() => deleteProduct(p.id)} className="text-stone-500 hover:text-red-500 transition-colors p-2" title="Delete Product"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'journal' && (
            <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
              <div className="flex justify-between items-end border-b border-stone-800 pb-6"><h1 className="text-3xl font-serif text-white">Journal Manager</h1></div>
              <div id="journal-editor" className="bg-stone-900 p-8 border border-stone-800 rounded-lg space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-serif text-xl">{editingPostId ? 'Edit Post' : 'Create New Post'}</h3>
                  {editingPostId && (<button onClick={resetJournalForm} className="text-stone-500 hover:text-white text-xs uppercase tracking-widest">Cancel Edit</button>)}
                </div>

                {/* Post Idea Generator */}
                {!editingPostId && (
                  <div className="bg-gradient-to-r from-amber-950/30 to-stone-900 border border-amber-800/30 rounded-lg p-5 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-amber-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                          <Sparkles size={16} /> AI Post Ideas
                        </h4>
                        <p className="text-stone-400 text-xs mt-1">Get 6 distinct, copper-only ideas built around search intent</p>
                      </div>
                      <button
                        onClick={generatePostIdeas}
                        disabled={isLoadingIdeas}
                        className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-white px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2 rounded"
                      >
                        {isLoadingIdeas ? (
                          <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Generating...</>
                        ) : postIdeas.length > 0 ? (
                          <><RefreshCw size={14} /> New Ideas</>
                        ) : (
                          <><Sparkles size={14} /> Generate Ideas</>
                        )}
                      </button>
                    </div>

                    {/* Idea Cards */}
                    {postIdeas.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {postIdeas.map((idea, index) => (
                          <div
                            key={index}
                            onClick={() => selectPostIdea(idea)}
                            className="bg-stone-800/50 hover:bg-stone-700/50 border border-stone-700 hover:border-amber-500 rounded-lg p-4 cursor-pointer transition-all group"
                          >
                            <h5 className="text-white font-semibold text-sm mb-2 group-hover:text-amber-400 line-clamp-2">{idea.title}</h5>
                            <p className="text-stone-400 text-xs mb-3 line-clamp-2">{idea.contentDirection}</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              <span className="bg-stone-950/70 text-stone-300 px-2 py-0.5 rounded text-[10px]">{idea.primaryKeyword}</span>
                              <span className="bg-stone-950/70 text-stone-400 px-2 py-0.5 rounded text-[10px] capitalize">{idea.searchIntent}</span>
                              <span className="bg-stone-950/70 text-stone-400 px-2 py-0.5 rounded text-[10px] capitalize">{idea.contentPillar}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded text-[10px] font-medium">{idea.targetProduct}</span>
                            </div>
                            <p className="text-amber-500 text-[10px] mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Click to use this idea →</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Title</label><input type="text" className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none" value={blogTitle} onChange={e => setBlogTitle(e.target.value)} /></div>
                  <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Target Product Name (for AI)</label><input type="text" placeholder="e.g. Copper Mugs" className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none" value={targetProduct} onChange={e => setTargetProduct(e.target.value)} /></div>
                </div>

                {/* Content Direction Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Content Direction (Optional)</label>
                    <textarea placeholder="e.g. Focus on the history of the Moscow Mule..." className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none h-20" value={blogContentDirection} onChange={e => setBlogContentDirection(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Image Generator</label>
                    <div className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-300">OpenAI GPT Image</div>
                  </div>
                </div>

                {/* AI Image Directions */}
                <div className="space-y-4 border border-stone-800 p-4 rounded bg-stone-950/50">
                  <h4 className="text-xs uppercase tracking-widest text-copper-500 font-bold mb-2">AI Image Direction (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Cover Image</label>
                      <input type="text" placeholder="e.g. Cinematic close-up of mugs in snow" className="w-full bg-stone-900 border border-stone-800 p-2 text-white text-xs focus:border-copper-500 outline-none" value={coverImgDir} onChange={e => setCoverImgDir(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Inline Image 1</label>
                      <input type="text" placeholder="e.g. Copper mug on a bar beside a smiling host" className="w-full bg-stone-900 border border-stone-800 p-2 text-white text-xs focus:border-copper-500 outline-none" value={inlineImg1Dir} onChange={e => setInlineImg1Dir(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Inline Image 2</label>
                      <input type="text" placeholder="e.g. Copper bottle on a sunlit kitchen counter" className="w-full bg-stone-900 border border-stone-800 p-2 text-white text-xs focus:border-copper-500 outline-none" value={inlineImg2Dir} onChange={e => setInlineImg2Dir(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Moscow Mix Product Reference Images (Required)</label>
                    <p className="text-xs text-stone-600">Upload the clearest front or three-quarter product photo first—it becomes the authoritative identity reference. Add side and detail views next. AI generation is blocked without a genuine Moscow Mix product reference.</p>
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer bg-stone-800 hover:bg-stone-700 text-white px-4 py-3 w-full text-center text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                        <Upload size={14} /> Upload Images
                        <input type="file" multiple className="hidden" onChange={handleTargetImageUpload} accept="image/*" />
                      </label>

                      {/* Image Preview Grid */}
                      {targetProductImagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {targetProductImagePreviews.map((preview, index) => (
                            <div key={index} className="aspect-square bg-stone-950 border border-stone-800 relative group">
                              <img src={preview} className="w-full h-full object-contain" />
                              <button onClick={() => removeTargetImage(index)} className="absolute top-1 right-1 bg-red-900/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    {pendingImagePlan ? (
                      <button type="button" onClick={retryPendingImages} disabled={isGenerating} className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 text-white px-6 py-3 uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2"><RefreshCw size={16} /> Retry 3 Images</button>
                    ) : (
                      <button type="button" onClick={generateFullPost} disabled={isGenerating} className="w-full bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 disabled:from-stone-800 disabled:to-stone-800 text-white px-6 py-3 uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2"><Sparkles size={16} /> Auto-Write & Design</button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 border-t border-stone-800 pt-6">
                  <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Author</label><input type="text" placeholder="Michael B." className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none text-sm" value={blogAuthor} onChange={e => setBlogAuthor(e.target.value)} /></div>
                  <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Slug (URL)</label><input type="text" placeholder="my-blog-post" className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-400 focus:border-copper-500 outline-none text-sm font-mono" value={blogSlug} onChange={e => setBlogSlug(e.target.value)} /></div>
                  <div className="col-span-2 space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Meta Description</label><input type="text" className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none text-sm" value={blogMeta} onChange={e => setBlogMeta(e.target.value)} /></div>
                  <div className="col-span-2 space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Tags (comma separated)</label><input type="text" placeholder="Copper, Lifestyle, Entertaining" className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none text-sm" value={blogTags} onChange={e => setBlogTags(e.target.value)} /></div>
                  {/* AEO Direct Answer Block Section */}
                  <div className="col-span-2 border-t border-stone-800 pt-6 mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs uppercase tracking-widest text-copper-400 font-bold">✨ AEO Direct Answer Block</span>
                      <span className="text-[10px] text-stone-500">(Answer Engine Optimization)</span>
                    </div>
                    <p className="text-xs text-stone-500 mb-4">Add a direct Q&A at the top of your post to help AI engines like ChatGPT and Google AI Overview extract and cite your content.</p>
                    <div className="space-y-4">
                      <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Question (H2 Heading)</label><input type="text" placeholder="What is the best way to clean copper mugs?" className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none text-sm" value={aeoQuestion} onChange={e => setAeoQuestion(e.target.value)} /><span className="text-[10px] text-stone-500">Phrase as the question your readers are searching for</span></div>
                      <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Direct Answer (40-60 words)</label><textarea placeholder="Start with the subject, not pronouns. E.g., 'Copper mugs should be cleaned with...' not 'They should be...'" className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none text-sm min-h-[80px]" value={aeoAnswer} onChange={e => setAeoAnswer(e.target.value)} /><span className="text-[10px] text-stone-500">Words: {aeoAnswer.split(/\s+/).filter(w => w).length}/60 • Must stand alone without context</span></div>
                      <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Key Points / Steps (optional, one per line)</label><textarea placeholder="Use warm water and mild soap\nDry immediately with soft cloth\nApply food-safe copper polish monthly" className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none text-sm min-h-[80px] font-mono text-xs" value={aeoListItems} onChange={e => setAeoListItems(e.target.value)} /><span className="text-[10px] text-stone-500">AIs love structured lists. Enter each step or point on a new line.</span></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Cover Image</label>
                  <div className="flex gap-4">
                    <div className="w-40 h-24 bg-stone-900 border border-stone-800 overflow-hidden">{blogCover && <img src={blogCover} className="w-full h-full object-cover" />}</div>
                    <label className="cursor-pointer bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 h-10 text-xs uppercase tracking-widest font-bold flex items-center gap-2"><Upload size={14} /> Upload Cover<input type="file" className="hidden" onChange={handleCoverUpload} accept="image/*" /></label>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Content (Visual Editor)</label>
                  <div className="border border-stone-800 rounded bg-stone-950">
                    <div className="flex gap-2 p-2 border-b border-stone-800 bg-stone-900 sticky top-0 z-10 items-center flex-wrap">
                      <button type="button" onClick={() => execCmd('bold')} className="p-2 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors" title="Bold"><Bold size={16} /></button>
                      <button type="button" onClick={() => execCmd('italic')} className="p-2 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors" title="Italic"><Italic size={16} /></button>
                      <div className="w-px h-6 bg-stone-800 mx-2"></div>
                      <button type="button" onClick={() => execCmd('formatBlock', 'H2')} className="p-2 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors flex items-center" title="Heading 2"><Heading1 size={16} /></button>
                      <button type="button" onClick={() => execCmd('formatBlock', 'H3')} className="p-2 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors flex items-center" title="Heading 3"><Heading2 size={16} /></button>
                      <button type="button" onClick={() => execCmd('formatBlock', 'blockquote')} className="p-2 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors" title="Quote"><Quote size={16} /></button>
                      <div className="w-px h-6 bg-stone-800 mx-2"></div>
                      <button type="button" onClick={handleEditorLink} className="p-2 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors" title="Link"><LinkIcon size={16} /></button>
                      <button type="button" onClick={handleInlineImageClick} className="p-2 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors" title="Insert Image"><ImageIcon size={16} /></button>
                      {/* Hidden input for inline images */}
                      <input
                        type="file"
                        ref={inlineImageInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleInlineImageUpload}
                      />
                      <div className="flex-1"></div>
                      <button type="button" onClick={() => execCmd('removeFormat')} className="p-2 hover:bg-stone-800 text-stone-500 hover:text-white transition-colors" title="Clear Formatting"><Eraser size={16} /></button>
                    </div>
                    <div
                      ref={contentEditableRef}
                      contentEditable
                      className="min-h-[500px] p-8 text-stone-300 font-sans text-lg focus:outline-none prose prose-invert max-w-none focus:bg-stone-900/50 transition-colors"
                      onBlur={(e) => setBlogContent(e.currentTarget.innerHTML)}
                    ></div>
                  </div>
                </div>

                {/* Scheduling Section */}
                <div className="border border-stone-800 p-4 rounded bg-stone-950/50 space-y-4">
                  <h4 className="text-xs uppercase tracking-widest text-stone-500 font-bold flex items-center gap-2">
                    <Calendar size={14} /> Post Scheduling
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postStatus"
                        value="draft"
                        checked={postStatus === 'draft'}
                        onChange={() => setPostStatus('draft')}
                        className="accent-amber-500"
                      />
                      <span className="text-sm text-stone-300">Save as Draft</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postStatus"
                        value="scheduled"
                        checked={postStatus === 'scheduled'}
                        onChange={() => setPostStatus('scheduled')}
                        className="accent-blue-500"
                      />
                      <span className="text-sm text-stone-300">Schedule</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postStatus"
                        value="published"
                        checked={postStatus === 'published'}
                        onChange={() => setPostStatus('published')}
                        className="accent-green-500"
                      />
                      <span className="text-sm text-stone-300">Publish Now</span>
                    </label>
                  </div>

                  {postStatus === 'scheduled' && (
                    <div className="flex items-center gap-4 p-3 bg-blue-950/30 border border-blue-900/50 rounded">
                      <Clock size={16} className="text-blue-400" />
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Schedule Date & Time</label>
                        <input
                          type="datetime-local"
                          value={scheduledDateTime}
                          onChange={(e) => setScheduledDateTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full bg-stone-900 border border-stone-800 p-2 text-white focus:border-blue-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSavePost}
                  className={`text-white px-8 py-4 uppercase tracking-widest text-sm font-bold w-full flex items-center justify-center gap-2 ${postStatus === 'draft'
                    ? 'bg-amber-700 hover:bg-amber-600'
                    : postStatus === 'scheduled'
                      ? 'bg-blue-700 hover:bg-blue-600'
                      : 'bg-copper-600 hover:bg-copper-500'
                    }`}
                >
                  {postStatus === 'draft' && <><FileText size={16} /> {editingPostId ? 'Update Draft' : 'Save Draft'}</>}
                  {postStatus === 'scheduled' && <><Calendar size={16} /> {editingPostId ? 'Update Schedule' : 'Schedule Post'}</>}
                  {postStatus === 'published' && <><Check size={16} /> {editingPostId ? 'Update & Publish' : 'Publish Now'}</>}
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-stone-500 text-xs uppercase tracking-widest font-bold mb-4">All Posts</h3>
                {config.blogPosts.length === 0 && (
                  <p className="text-stone-600 text-sm italic">No posts yet. Create your first post above.</p>
                )}
                {config.blogPosts.map(post => {
                  const status = post.status || 'published';
                  const isScheduledInFuture = status === 'scheduled' && post.scheduledDate && new Date(post.scheduledDate) > new Date();

                  return (
                    <div key={post.id} className={`bg-stone-900 p-4 border rounded flex items-center justify-between group ${status === 'draft' ? 'border-amber-900/50' :
                      status === 'scheduled' ? 'border-blue-900/50' : 'border-stone-800'
                      }`}>
                      <div className="flex items-center gap-4">
                        <img src={post.coverImage} className="w-16 h-10 object-cover rounded" />
                        <div>
                          <span className="text-white font-serif block">{post.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                            {status === 'draft' && (
                              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-amber-900/30 text-amber-400 rounded">Draft</span>
                            )}
                            {status === 'scheduled' && (
                              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded flex items-center gap-1">
                                <Clock size={10} /> {isScheduledInFuture ? 'Scheduled' : 'Pending Publish'}
                              </span>
                            )}
                            {status === 'published' && (
                              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-green-900/30 text-green-400 rounded">Published</span>
                            )}
                            <span className="text-[10px] text-stone-500">{post.date}</span>
                            {status === 'scheduled' && post.scheduledDate && (
                              <span className="text-[10px] text-blue-400">
                                → {new Date(post.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditPost(post)} className="p-2 text-stone-500 hover:text-white" title="Edit Post"><Edit2 size={16} /></button>
                        {/* Writers cannot delete posts */}
                        {currentUser?.role !== 'writer' && (
                          <button onClick={(e) => handleDeletePost(e, post.id)} type="button" className="p-2 text-stone-500 hover:bg-red-900/30 hover:text-red-500 transition-colors rounded relative z-50 cursor-pointer" title="Delete Post"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'story' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <h1 className="text-3xl font-serif text-white mb-8">Brand Story</h1>
              <div className="space-y-4"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Headline</label><input type="text" className="w-full bg-stone-900 border border-stone-800 p-4 text-white focus:border-copper-500 outline-none font-serif text-2xl" value={storyHead} onChange={e => setStoryHead(e.target.value)} /></div>
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Story Hero Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-48 h-24 bg-stone-900 border border-stone-800 overflow-hidden">
                    {config.story.heroImage ? <img src={config.story.heroImage} className="w-full h-full object-cover" /> : <span className="text-xs text-stone-600 flex items-center justify-center h-full">No Image</span>}
                  </div>
                  <label className="cursor-pointer bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                    <Upload size={14} /> Upload Image
                    <input type="file" className="hidden" onChange={handleStoryImageUpload} accept="image/*" />
                  </label>
                </div>
              </div>
              <div className="space-y-4"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Narrative (HTML Supported)</label><textarea className="w-full h-96 bg-stone-900 border border-stone-800 p-6 text-stone-300 focus:border-copper-500 outline-none text-lg leading-relaxed" value={storyNarrative} onChange={e => setStoryNarrative(e.target.value)} /></div>
              <button onClick={handleStorySave} className="bg-copper-600 hover:bg-copper-500 text-white px-8 py-3 uppercase tracking-widest text-sm font-bold flex items-center gap-2"><Save size={16} /> Update Story</button>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <h1 className="text-3xl font-serif text-white mb-8">Global Assets</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(config.assets).map(([key, url]) => (
                  <div key={key} className="bg-stone-900 border border-stone-800 p-4">
                    <div className="aspect-video bg-stone-950 mb-4 overflow-hidden relative group">
                      {url && ((url as string).includes('video') || key.startsWith('video')) ? (
                        <video src={url} className="w-full h-full object-cover" controls muted />
                      ) : (
                        <img src={url} className="w-full h-full object-cover" />
                      )}
                      <label className="absolute inset-0 bg-stone-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <div className="text-center">
                          <Upload className="text-white mx-auto mb-2" size={24} />
                          <span className="text-xs text-white uppercase tracking-widest font-bold">Replace</span>
                        </div>
                        <input type="file" className="hidden" onChange={(e) => handleAssetUpload(key, e)} accept={key.startsWith('video') ? "video/*" : "image/*"} />
                      </label>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-stone-500 font-mono truncate" title={key}>
                        {ASSET_LABELS[key] || key}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-stone-900 border border-stone-800 p-6 flex items-center gap-4 border-dashed"><Plus className="text-stone-600" /><span className="text-stone-500 italic">Add Custom Asset functionality coming soon...</span></div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
              <h1 className="text-3xl font-serif text-white mb-8">Settings</h1>
              <div className="bg-stone-900 p-8 border border-stone-800 rounded-lg space-y-6">
                <h3 className="text-white font-serif text-xl">Admin Security</h3>
                {isChangingPass ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">New Password</label>
                        <input
                          type="text"
                          placeholder="Enter new password"
                          className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Password Hint</label>
                        <input
                          type="text"
                          placeholder="e.g. Favorite color"
                          className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none"
                          value={newHint}
                          onChange={(e) => setNewHint(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveCredentials} className="bg-copper-600 hover:bg-copper-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Check size={14} /> Save Credentials</button>
                      <button onClick={() => { setIsChangingPass(false); setNewPass(''); setNewHint(''); }} className="bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><XIcon size={14} /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setIsChangingPass(true)} className="w-full bg-stone-800 hover:bg-stone-700 text-white py-3 px-4 rounded text-sm font-bold">Update Admin Credentials</button>
                )}
              </div>
              <div className="bg-stone-900 p-8 border border-stone-800 rounded-lg space-y-6">
                <h3 className="text-white font-serif text-xl">OpenAI Configuration</h3>
                <div className={`rounded border px-4 py-3 text-sm ${openAiConfigured ? 'border-green-900 bg-green-950/30 text-green-400' : 'border-amber-900 bg-amber-950/30 text-amber-300'}`}>
                  {openAiConfigured === null ? 'Checking the secure server connection…' : openAiConfigured ? 'OpenAI is securely configured on Vercel.' : 'OpenAI still needs to be configured in Vercel.'}
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">AI Access Code</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      className="w-full bg-stone-950 border border-stone-800 p-3 pr-10 text-white focus:border-copper-500 outline-none font-mono text-sm"
                      value={aiAccessCode}
                      onChange={(e) => setAiAccessCode(e.target.value)}
                      placeholder="Enter the access code saved in Vercel"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
                      type="button"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-stone-500">This is a separate access code—not your OpenAI key. The real API key stays private on Vercel.</p>
                </div>
                <button onClick={handleSaveApiKey} className="w-full bg-copper-900/30 text-copper-400 hover:bg-copper-900/50 py-3 px-4 rounded text-sm font-bold border border-copper-900">Verify &amp; Save AI Access Code</button>
              </div>

              {/* Emergency Cloud Sync Section */}
              <div className="bg-red-900/20 p-8 border border-red-900/50 rounded-lg space-y-6">
                <h3 className="text-white font-serif text-xl flex items-center gap-2">
                  <Cloud size={20} className="text-red-400" /> Cloud Sync
                </h3>
                <p className="text-stone-400 text-sm">
                  If your content isn't appearing on other devices, use this to force sync your local data to the cloud.
                </p>
                <div className="bg-stone-950 p-4 rounded border border-stone-800 text-sm">
                  <p className="text-stone-500">Current local data:</p>
                  <ul className="text-white mt-2 space-y-1">
                    <li>• <strong>{config.blogPosts?.length || 0}</strong> Journal Posts</li>
                    <li>• <strong>{config.products?.length || 0}</strong> Products</li>
                    <li>• <strong>{config.adminUsers?.length || 0}</strong> Team Members</li>
                  </ul>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm('This will push ALL your current data to the cloud. Other devices will see this data. Continue?')) return;
                    const result = await forceSyncToCloud();
                    alert(result.message);
                  }}
                  className="w-full bg-red-700 hover:bg-red-600 text-white py-4 px-4 rounded text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Upload size={18} /> Force Sync to Cloud
                </button>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-white">Team Management</h1>
                <span className="text-xs text-stone-500 uppercase tracking-widest">
                  Logged in as: <span className="text-copper-400">{currentUser?.name || 'Admin'}</span>
                </span>
              </div>

              {/* Add New Team Member */}
              <div className="bg-stone-900 p-8 border border-stone-800 rounded-lg space-y-6">
                <h3 className="text-white font-serif text-xl flex items-center gap-2">
                  <Plus size={20} className="text-copper-500" /> Add Team Member
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Name</label>
                    <input
                      type="text"
                      id="team-new-name"
                      placeholder="John Doe"
                      className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Email / Username</label>
                    <input
                      type="text"
                      id="team-new-email"
                      placeholder="john@example.com"
                      className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Password</label>
                    <input
                      type="text"
                      id="team-new-password"
                      placeholder="Create a password"
                      className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Role</label>
                    <select
                      id="team-new-role"
                      className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none"
                    >
                      <option value="writer">Blog Writer</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const nameEl = document.getElementById('team-new-name') as HTMLInputElement;
                    const emailEl = document.getElementById('team-new-email') as HTMLInputElement;
                    const passwordEl = document.getElementById('team-new-password') as HTMLInputElement;
                    const roleEl = document.getElementById('team-new-role') as HTMLSelectElement;

                    if (!nameEl.value || !emailEl.value || !passwordEl.value) {
                      alert('Please fill in all fields');
                      return;
                    }

                    const existingUsers = config.adminUsers || [];
                    if (existingUsers.some(u => u.email.toLowerCase() === emailEl.value.toLowerCase())) {
                      alert('A user with this email already exists');
                      return;
                    }

                    const newUser: AdminUser = {
                      id: `admin-${Date.now()}`,
                      name: nameEl.value,
                      email: emailEl.value,
                      password: passwordEl.value,
                      role: roleEl.value as 'admin' | 'owner',
                      createdAt: new Date().toISOString()
                    };

                    addAdminUser(newUser);

                    nameEl.value = '';
                    emailEl.value = '';
                    passwordEl.value = '';
                    alert('Team member added successfully!');
                  }}
                  className="w-full bg-copper-600 hover:bg-copper-500 text-white py-3 px-4 rounded text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Team Member
                </button>
              </div>

              {/* Team Members List */}
              <div className="bg-stone-900 p-8 border border-stone-800 rounded-lg space-y-6">
                <h3 className="text-white font-serif text-xl flex items-center gap-2">
                  <Users size={20} className="text-copper-500" /> Current Team Members
                </h3>

                <div className="space-y-3">
                  {(config.adminUsers || []).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-stone-950 border border-stone-800 rounded">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-copper-900/30 rounded-full flex items-center justify-center">
                          <User size={18} className="text-copper-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-stone-500 text-xs">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded ${user.role === 'owner' ? 'bg-amber-900/30 text-amber-400' :
                          user.role === 'writer' ? 'bg-green-900/30 text-green-400' :
                            'bg-stone-800 text-stone-400'
                          }`}>
                          {user.role === 'writer' ? 'Blog Writer' : user.role}
                        </span>
                      </div>

                      {user.id !== 'admin-default' && user.id !== currentUser?.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${user.name} from the team?`)) {
                              removeAdminUser(user.id);
                            }
                          }}
                          className="p-2 text-stone-500 hover:text-red-500 transition-colors"
                          title="Remove team member"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  {(!config.adminUsers || config.adminUsers.length === 0) && (
                    <p className="text-stone-500 text-center py-8">No team members yet. Add one above.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div >
    </div >
  );
};

export default AdminPanel;
