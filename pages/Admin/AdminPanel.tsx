import React, { useState, useEffect, useRef } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Product, BlogPost, ProductCategory } from '../../types';
import { storage } from '../../firebase';
// FIXED: Import storage functions ONLY from firebase/storage
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Link } from 'react-router-dom';
import {
  Lock, Layout, Type, Image as ImageIcon, ShoppingBag,
  BookOpen, LogOut, Plus, Trash2, Edit2, Upload,
  Sparkles, Save, Bold, Italic, Quote, Link as LinkIcon,
  Settings, ExternalLink, X, Heading1, Heading2, Eraser,
  ArrowUp, ArrowDown, Check, X as XIcon, List, FileText, Video, Eye, EyeOff
} from 'lucide-react';

const AdminPanel = () => {
  const { config, updateHeroText, updateAssets, addProduct, updateProduct, deleteProduct, reorderProduct, addBlogPost, updateBlogPost, deleteBlogPost, updateStory, verifyAdminPassword, changeAdminPassword } = useSiteConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<'hero' | 'products' | 'journal' | 'story' | 'assets' | 'settings'>('hero');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Password Change State
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [newHint, setNewHint] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Local state for Hero editing
  const [heroHead, setHeroHead] = useState(config.heroHeadline);
  const [heroSub, setHeroSub] = useState(config.heroSubheadline);

  // AI Configuration
  const [imageGenModel, setImageGenModel] = useState<'imagen-3' | 'imagen-4.0-ultra-generate-001' | 'flux' | 'turbo' | 'custom'>('imagen-4.0-ultra-generate-001');
  const [customModelId, setCustomModelId] = useState('');

  // Refs
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKeyInput(savedKey);
  }, []);

  const checkGoogleModels = async () => {
    try {
      const apiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_API_KEY;
      if (!apiKey) return alert("Please save API Key first.");

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();

      if (!data.models) return alert("No models found directly. Check permissions.");

      // Filter for IMAGE generation models (look for 'predict' method or 'imagen' name)
      const imageModels = data.models.filter((m: any) =>
        m.name.includes('imagen') || (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('predict'))
      );

      if (imageModels.length === 0) {
        alert("No specific 'Image Generation' models found for this key.\n\nTry enabling 'Vertex AI' in Google Cloud, or use the 'Flux' option.");
        return;
      }

      const names = imageModels.map((m: any) => m.name.replace('models/', '')).join('\n');
      alert(`Valid IMAGE Models for your Key:\n\n${names}\n\n(Copy one of these exactly)`);
    } catch (e) {
      alert("Failed to fetch models: " + e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      alert("Please enter a valid API Key");
      return;
    }
    const key = apiKeyInput.trim();
    localStorage.setItem('gemini_api_key', key);
    setApiKeyInput(key);
    alert("API Key Saved Securely");
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
    name: '', category: ProductCategory.COPPER, price: 0, description: '', amazonUrl: '', features: []
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
    const storedKey = localStorage.getItem('gemini_api_key');
    const apiKey = storedKey || import.meta.env.VITE_API_KEY;

    if (!apiKey) return alert("Please enter API Key in Settings first");
    if (!newProduct.name || !newProduct.description) return alert("Enter Product Name and Description first");

    setIsGeneratingFeatures(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const prompt = `
            Analyze this product and generate 5 premium, benefit-driven feature bullet points (max 6 words each).
            Product: ${newProduct.name}
            Category: ${newProduct.category}
            Description: ${newProduct.description}
            
            Return ONLY a raw JSON array of strings. Example: ["Hand-hammered finish", "100% pure copper"]
          `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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
    const storedKey = localStorage.getItem('gemini_api_key');
    const apiKey = storedKey || import.meta.env.VITE_API_KEY;

    if (!apiKey) return alert("Please enter API Key in Settings first");
    if (!newProduct.name) return alert("Enter Product Name first");

    setIsGeneratingDesc(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const prompt = `
            Write a premium, short, and compelling product description (2-3 sentences) for:
            Product Name: ${newProduct.name}
            Category: ${newProduct.category}
            Brand Voice: Elegant, elemental, heritage, luxury.
            
            Return ONLY the raw description text. No quotes.
          `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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
      price: 0,
      description: newProduct.description!,
      features: newProduct.features || [],
      category: newProduct.category as ProductCategory,
      images: newProduct.images || [],
      rating: 5,
      reviews: 0,
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

    setNewProduct({ name: '', category: ProductCategory.COPPER, description: '', amazonUrl: '', features: [] });
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  const [targetProduct, setTargetProduct] = useState('');
  const [targetProductBase64s, setTargetProductBase64s] = useState<string[]>([]);
  const [targetProductImagePreviews, setTargetProductImagePreviews] = useState<string[]>([]);

  const [blogContentDirection, setBlogContentDirection] = useState('');

  const [coverImgDir, setCoverImgDir] = useState('');
  const [inlineImg1Dir, setInlineImg1Dir] = useState('');
  const [inlineImg2Dir, setInlineImg2Dir] = useState('');

  const [editingPostId, setEditingPostId] = useState<string | null>(null);

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
        const imgHtml = `<div class="image-block"><img src="${url}" alt="Blog Image" /><span class="caption">Image Caption</span></div><br/>`;
        execCmd('insertHTML', imgHtml);
      }
    }
    e.target.value = '';
  };

  const handleSavePost = () => {
    if (!blogTitle) return alert("Title required");

    const id = editingPostId || blogTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const newPost: BlogPost = {
      id: id,
      title: blogTitle,
      excerpt: blogExcerpt || "Read more about this topic in our latest journal entry.",
      content: contentEditableRef.current?.innerHTML || blogContent,
      coverImage: blogCover || config.assets.heroVideoPoster,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      author: blogAuthor || "Michael B.",
      readTime: "5 min read",
      slug: blogSlug || blogTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      tags: blogTags.split(',').map(t => t.trim()),
      metaDescription: blogMeta
    };

    if (editingPostId) {
      updateBlogPost(newPost);
      alert("Post Updated Successfully");
    } else {
      addBlogPost(newPost);
      alert("Post Published Successfully");
    }

    resetJournalForm();
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

    setTargetProduct('');
    setTargetProductBase64s([]);
    setTargetProductImagePreviews([]);
    setBlogContentDirection('');
    setCoverImgDir('');
    setInlineImg1Dir('');
    setInlineImg2Dir('');

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

    const files = Array.from(e.target.files);
    const readPromises = files.map(file => {
      return new Promise<{ preview: string, base64: string }>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve({
            preview: result,
            base64: result.split(',')[1]
          });
        };
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

  // Uses Google's native Imagen 3 model (requested as 'Nano Banana Pro')
  const generateImageFromPrompt = async (genAI: GoogleGenerativeAI, prompt: string, modelType: string = 'imagen-3'): Promise<string | null> => {
    try {
      console.log(`Generating image with ${modelType} for:`, prompt);
      const apiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_API_KEY;

      // OPTION 1: FLUX (via Pollinations)
      if (modelType === 'flux') {
        const enhancedPrompt = encodeURIComponent(prompt + " photorealistic, cinematic lighting, 8k uhd, highly detailed, professional photography");
        return `https://pollinations.ai/p/${enhancedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}&model=flux`;
      }

      // OPTION 2: TURBO (via Pollinations)
      if (modelType === 'turbo') {
        const enhancedPrompt = encodeURIComponent(prompt);
        return `https://pollinations.ai/p/${enhancedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}&model=turbo`;
      }

      // OPTION 3: CUSTOM MODEL
      if (modelType === 'custom') {
        if (!customModelId) throw new Error("Please enter a Custom Model ID");
        console.log("Using Custom Model:", customModelId);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${customModelId}:predict?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: prompt + ", photorealistic, 8k, no text, no watermark" }],
            parameters: { sampleCount: 1 }
          })
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(err);
        }
        const data = await response.json();
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
        if (base64Image) return `data:image/jpeg;base64,${base64Image}`;
        return null;
      }

      // OPTION 4: EXPLICIT IMAGEN 4 ULTRA
      if (modelType === 'imagen-4.0-ultra-generate-001') {
        console.log("Using Nano Banana Pro (Imagen 4 Ultra)...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-ultra-generate-001:predict?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: prompt + ", photorealistic, 8k, no text, no watermark" }],
            parameters: { sampleCount: 1 }
          })
        });

        if (!response.ok) {
          console.log("Using Nano Banana Pro (Imagen 4 Ultra)...");
          const retryResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-ultra-generate-001:predict?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instances: [{ prompt: prompt + ", photorealistic, 8k, no text, no watermark, (NO TEXT ON BOTTLES)" }],
              parameters: { sampleCount: 1 }
            })
          });

          if (!retryResponse.ok) {
            const err = await retryResponse.text();
            throw new Error(err);
          }
          const data = await retryResponse.json();
          const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
          if (base64Image) return `data:image/jpeg;base64,${base64Image}`;
          return null;
        }

        // If first response was OK, process it
        const data = await response.json();
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
        if (base64Image) return `data:image/jpeg;base64,${base64Image}`;
        return null;
      }

      // OPTION 5: GOOGLE IMAGEN 3.0 (Discovery Fallback/Default)
      // STEP 1: Discovery - Find the exact Model ID allowed for this key
      console.log("Auto-Discovering correct Imagen model ID...");
      const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!listResp.ok) {
        throw new Error("Could not connect to Google API to check models. Check internet/key.");
      }
      const listData = await listResp.json();
      const models = listData.models || [];
      // Look for any model with 'imagen' in the name
      const imagenModel = models.find((m: any) => m.name.includes('imagen') && m.supportedGenerationMethods?.includes('predict'));

      const targetModel = imagenModel ? imagenModel.name.replace('models/', '') : 'imagen-3.0-generate-001';
      console.log("Selected Model:", targetModel);

      // STEP 2: Generate
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:predict?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: prompt + ", photorealistic, 8k, no text, no watermark" }],
          parameters: { sampleCount: 1 }
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();
      const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

      if (base64Image) {
        return `data:image/jpeg;base64,${base64Image}`;
      }
      return null;
    } catch (e) {
      console.error("Image Gen Error:", e);
      const msg = e instanceof Error ? e.message : "Unknown error";
      alert(`Image Generation Failed (${modelType}): ${msg}`);
      return null;
    }
  };

  const generateFullPost = async () => {
    const storedKey = localStorage.getItem('gemini_api_key');
    const apiKey = storedKey || import.meta.env.VITE_API_KEY;

    if (!apiKey) {
      alert("Please enter API Key in Settings first");
      return;
    }
    if (!blogTitle) {
      alert("Please enter a Title first");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Analyzing product images & Writing content...');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const productsContext = config.products.map(p => `${p.name} (ID: ${p.id})`).join(', ');

      const prompt = `
        You are an expert luxury lifestyle editor for 'Moscow Mix'.
        
        TASK:
        1. FIRST, analyze the attached product image(s). Extract a highly detailed "VISUAL DNA" description including:
           - Material texture (e.g. hammered copper dents, wood wool fibers).
           - Shape and silhouette.
           - Lighting behavior (how light reflects off it).
           - Color palette.
           - Unique identifying features (logos, engravings, handles, etc.)
        2. THEN, write a professional, SEO-optimized blog post (1500-1800 words) based on the title: "${blogTitle}".
        
        CONTEXT:
        - Brand: High-end copper drinkware & natural fire starters.
        - Target Product to Weave In: "${targetProduct || 'Our premium Copper Collection'}".
        - Available Products for linking: ${productsContext}.
        ${blogContentDirection ? `- SPECIFIC DIRECTION FROM EDITOR: "${blogContentDirection}"` : ""}
        
        REQUIREMENTS:
        1. LINKS: 
           - Include EXACTLY 2 internal links to the product IDs provided above. 
           - **CRITICAL**: Use valid HTML relative paths ONLY for HashRouter. Example: <a href="#/product/copper-mule-16oz" style="color: #3b82f6;">Product Name</a>. 
           - Include 2-3 external links to HIGH-AUTHORITY relevant domains (e.g., Wikipedia for historical context, authoritative cocktail/culinary sites, scientific journals for material properties).
           - External links must open in new tab: <a href="https://example.com" target="_blank" rel="noopener noreferrer" style="color: #3b82f6;">Link Text</a>
        2. FORMAT:
           - Use semantic HTML (<h2>, 3-4 sentences per paragraph, <h3> for subsections).
           - Do NOT use markdown. Return raw HTML.
         3. IMAGES:
            - You MUST insert exactly 2 image placeholders within the HTML content at logical section breaks to break up the text.
            - Use this EXACT format (do not use markdown images): <div class="image-placeholder" data-prompt="Detailed visual description of the image"></div>
            - **CRITICAL IMAGE PROMPT RULES**:
              ${coverImgDir ? `* Cover Image: Use this exact direction: "${coverImgDir}"` : '* Cover Image: Must feature the target product prominently, replicating the VISUAL DNA from the uploaded images.'}
              ${inlineImg1Dir ? `* Inline Image 1: Use this exact direction: "${inlineImg1Dir}"` : '* Inline Image 1: Must be contextually relevant to the surrounding paragraph content AND feature the target product if applicable.'}
              ${inlineImg2Dir ? `* Inline Image 2: Use this exact direction: "${inlineImg2Dir}"` : '* Inline Image 2: Must be contextually relevant to the surrounding paragraph content AND feature the target product if applicable.'}
              * ALL image prompts must replicate the exact VISUAL DNA (materials, colors, shapes, lighting) from the uploaded product images.
              * Image prompts should be 2-3 sentences, highly descriptive, and photorealistic.
         4. OUTPUT:
            - Return ONLY a valid JSON object.
           {
             "excerpt": "Engaging summary (150 chars)",
             "content": "Full HTML body...",
             "slug": "seo-friendly-url",
             "tags": ["tag1", "tag2"],
             "metaDescription": "SEO meta description",
             "coverImagePrompt": "A highly descriptive, photorealistic prompt for the cover image that captures the essence of the headline and replicates the product's visual DNA.",
             "inlineImagePrompts": ["Contextually relevant prompt for image 1 (must match the surrounding text and replicate product visual DNA)", "Contextually relevant prompt for image 2 (must match the surrounding text and replicate product visual DNA)"]
           }
      `;

      const parts: any[] = [{ text: prompt }];
      if (targetProductBase64s.length > 0) {
        targetProductBase64s.forEach(base64 => {
          parts.push({ inlineData: { data: base64, mimeType: 'image/jpeg' } });
        });
      }

      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      if (!text) throw new Error("No text generated");

      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonString);

      setBlogExcerpt(data.excerpt);
      setBlogSlug(data.slug);
      setBlogTags(data.tags.join(', '));
      setBlogMeta(data.metaDescription);

      // 2. Generate Cover Image
      setGenerationStatus('Generating & Uploading Cover Image...');
      const coverPrompt = data.coverImagePrompt || `A professional, magazine-quality photo for a blog post about: ${blogTitle}. ${blogContentDirection || ''}. Photorealistic, 8k.`;
      const coverUrlRaw = await generateImageFromPrompt(genAI, coverPrompt, imageGenModel);

      let coverUrl = "";
      if (coverUrlRaw) {
        if (coverUrlRaw.startsWith('data:')) {
          coverUrl = await uploadBase64ToFirebase(coverUrlRaw, 'blog-covers');
        } else {
          // It's a Pollinations URL
          coverUrl = coverUrlRaw;
        }
      }
      if (coverUrl) setBlogCover(coverUrl);

      setGenerationStatus('Rendering & Uploading Inline Images...');
      let finalContent = data.content;

      // Improved regex to handle various attribute orderings if necessary, but standardizing on the one we generated
      const placeholderRegex = /<div class="image-placeholder" data-prompt="([^"]+)"><\/div>/g;

      // transform to array to avoid iterator issues during async replacement
      const matches = Array.from(finalContent.matchAll(placeholderRegex));

      for (const match of matches) {
        const fullMatch = match[0]; // e.g. <div ...></div>
        const imgPrompt = match[1]; // The prompt text

        setGenerationStatus(`Creating image: ${imgPrompt.substring(0, 20)}...`);
        const imgBase64 = await generateImageFromPrompt(genAI, imgPrompt, imageGenModel);

        if (imgBase64) {
          let imageUrl = await uploadBase64ToFirebase(imgBase64, 'blog-content');

          // Fallback: If upload failed, use the direct Pollinations URL
          if (!imageUrl) {
            console.warn("Firebase upload failed. Using external URL fallback.");
            imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgPrompt + " photorealistic, cinematic, 8k, luxury product photography")}`;
          }

          if (imageUrl) {
            const imgTag = `<div class="image-block"><img src="${imageUrl}" alt="${imgPrompt}" /><span class="caption">${imgPrompt.split('.')[0]}</span></div>`;
            finalContent = finalContent.replace(fullMatch, imgTag);
          } else {
            finalContent = finalContent.replace(fullMatch, '');
          }
        } else {
          // Even if generation blob failed, try the direct URL as a last resort
          const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgPrompt + " photorealistic, cinematic, 8k, luxury product photography")}`;
          const imgTag = `<div class="image-block"><img src="${fallbackUrl}" alt="${imgPrompt}" /><span class="caption">${imgPrompt.split('.')[0]}</span></div>`;
          finalContent = finalContent.replace(fullMatch, imgTag);
        }
      }

      if (contentEditableRef.current) contentEditableRef.current.innerHTML = finalContent;
      setBlogContent(finalContent);

    } catch (error) {
      console.error(error);
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`AI Generation failed: ${errorMessage}`);
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
          <input
            type="password" placeholder="Enter Password"
            className="w-full bg-stone-950 border border-stone-800 p-4 text-white mb-6 focus:border-copper-500 outline-none"
            value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button className="w-full bg-copper-600 hover:bg-copper-500 text-white font-bold py-4 uppercase tracking-widest transition-colors">Login</button>

          <button type="button" onClick={() => setShowHint(!showHint)} className="w-full text-center text-xs text-stone-500 hover:text-copper-400 mt-4 underline">
            {showHint ? "Hide Hint" : "Forgot Password? Show Hint"}
          </button>

          {showHint && (
            <div className="mt-2 p-3 bg-stone-800 rounded border border-stone-700 text-center animate-fade-in">
              <p className="text-stone-400 text-xs">Hint: <span className="text-white font-bold tracking-wide">{(config as any).passwordHint || "No hint set"}</span></p>
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
            <button onClick={() => setActiveTab('hero')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'hero' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
              <Layout size={18} /> Hero & Logo
            </button>
            <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'products' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
              <ShoppingBag size={18} /> Products
            </button>
            <button onClick={() => setActiveTab('journal')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'journal' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
              <BookOpen size={18} /> Journal
            </button>
            <button onClick={() => setActiveTab('story')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'story' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
              <Type size={18} /> Our Story
            </button>
            <button onClick={() => setActiveTab('assets')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'assets' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
              <ImageIcon size={18} /> Global Assets
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'settings' ? 'bg-stone-800 text-copper-400' : 'text-stone-400 hover:text-white'}`}>
              <Settings size={18} /> Settings
            </button>
          </nav>

          <div className="p-4">
            <Link
              to="/"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-copper-900/30 text-copper-400 border border-copper-900/50 hover:bg-copper-900/50 hover:text-white rounded-md transition-colors mb-2"
            >
              <ExternalLink size={18} /> View Live Site
            </Link>
          </div>

          <div className="p-4 border-t border-stone-800">
            <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-500 hover:text-red-400 transition-colors">
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
                  {isEditingProduct && (<button onClick={() => { setIsEditingProduct(false); setNewProduct({ name: '', category: ProductCategory.COPPER, description: '', amazonUrl: '', features: [] }); }} className="text-stone-500 hover:text-white text-xs uppercase tracking-widest">Cancel Edit</button>)}
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
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Image Gen Model</label>
                    <select
                      value={imageGenModel}
                      onChange={(e) => setImageGenModel(e.target.value as any)}
                      className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none"
                    >
                      <option value="imagen-3">Google Imagen 3.0 (Standard)</option>
                      <option value="imagen-4.0-ultra-generate-001">Nano Banana Pro (Imagen 4 Ultra)</option>
                      <option value="flux">Flux (Text Friendly)</option>
                      <option value="turbo">Turbo (Fastest)</option>
                      <option value="custom">Custom Model ID...</option>
                    </select>

                    {imageGenModel === 'custom' && (
                      <input
                        type="text"
                        placeholder="e.g. nano-banana-pro-001"
                        className="w-full bg-stone-900 border border-stone-800 p-2 text-copper-400 text-xs mt-2 focus:border-copper-500 outline-none font-mono"
                        value={customModelId}
                        onChange={(e) => setCustomModelId(e.target.value)}
                      />
                    )}

                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[10px] text-stone-600">Select 'Flux' if text looks bad.</p>
                      <button onClick={checkGoogleModels} className="text-[10px] text-copper-500 hover:text-copper-400 underline cursor-pointer">Check Available Models</button>
                    </div>
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
                      <input type="text" placeholder="e.g. Hand holding a copper mug" className="w-full bg-stone-900 border border-stone-800 p-2 text-white text-xs focus:border-copper-500 outline-none" value={inlineImg1Dir} onChange={e => setInlineImg1Dir(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Inline Image 2</label>
                      <input type="text" placeholder="e.g. Fireplace setting" className="w-full bg-stone-900 border border-stone-800 p-2 text-white text-xs focus:border-copper-500 outline-none" value={inlineImg2Dir} onChange={e => setInlineImg2Dir(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Target Product Images (Optional)</label>
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
                  <div className="flex items-end"><button onClick={generateFullPost} className="w-full bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-white px-6 py-3 uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2"><Sparkles size={16} /> Auto-Write & Design</button></div>
                </div>
                <div className="grid grid-cols-2 gap-6 border-t border-stone-800 pt-6">
                  <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Author</label><input type="text" placeholder="Michael B." className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none text-sm" value={blogAuthor} onChange={e => setBlogAuthor(e.target.value)} /></div>
                  <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Slug (URL)</label><input type="text" placeholder="my-blog-post" className="w-full bg-stone-950 border border-stone-800 p-3 text-stone-400 focus:border-copper-500 outline-none text-sm font-mono" value={blogSlug} onChange={e => setBlogSlug(e.target.value)} /></div>
                  <div className="col-span-2 space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Meta Description</label><input type="text" className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none text-sm" value={blogMeta} onChange={e => setBlogMeta(e.target.value)} /></div>
                  <div className="col-span-2 space-y-2"><label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Tags (comma separated)</label><input type="text" placeholder="Copper, Lifestyle, Fire" className="w-full bg-stone-950 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none text-sm" value={blogTags} onChange={e => setBlogTags(e.target.value)} /></div>
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
                <button onClick={handleSavePost} className="bg-copper-600 hover:bg-copper-500 text-white px-8 py-4 uppercase tracking-widest text-sm font-bold w-full">{editingPostId ? 'Update Post' : 'Publish Post'}</button>
              </div>

              <div className="space-y-4">
                <h3 className="text-stone-500 text-xs uppercase tracking-widest font-bold mb-4">Published Posts</h3>
                {config.blogPosts.map(post => (
                  <div key={post.id} className="bg-stone-900 p-4 border border-stone-800 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <img src={post.coverImage} className="w-16 h-10 object-cover" />
                      <span className="text-white font-serif">{post.title}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditPost(post)} className="p-2 text-stone-500 hover:text-white" title="Edit Post"><Edit2 size={16} /></button>
                      <button onClick={(e) => handleDeletePost(e, post.id)} type="button" className="p-2 text-stone-500 hover:bg-red-900/30 hover:text-red-500 transition-colors rounded relative z-50 cursor-pointer" title="Delete Post"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
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
                <h3 className="text-white font-serif text-xl">API Configuration</h3>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      className="w-full bg-stone-950 border border-stone-800 p-3 pr-10 text-white focus:border-copper-500 outline-none font-mono text-sm"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="AIza..."
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
                      type="button"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-stone-600">Required for Journal AI generation features.</p>
                </div>
                <button onClick={handleSaveApiKey} className="w-full bg-copper-900/30 text-copper-400 hover:bg-copper-900/50 py-3 px-4 rounded text-sm font-bold border border-copper-900">Save API Key</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;