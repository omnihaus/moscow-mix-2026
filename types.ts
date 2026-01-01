
export enum ProductCategory {
  COPPER = 'Copper Drinkware',
  FIRE = 'Fire Starters',
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price?: number; // Made optional
  description: string;
  features: string[];
  category: ProductCategory;
  images: string[];
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  amazonUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML
  coverImage: string;
  date: string;
  author: string;
  readTime: string;
  slug?: string;
  tags?: string[];
  metaDescription?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role?: string;
  text: string;
  rating: number;
}

export interface SiteAssets {
  logo?: string; // Data URI or URL
  brandMark?: string; // Small logo/icon for section headers
  heroVideoPoster: string;
  fireStarterHero: string;
  copperHero: string;
  textureWood: string;
  textureCopper: string;
  lifestyleCabin: string;
  lifestyleKitchen: string;
  lifestyleRitual?: string; // New asset for Home section right side
  videoCopperMug?: string; // New: 30s Mug Video
  videoCopperBottle?: string; // New: 30s Bottle Video
  videoCopperJug?: string; // New: 30s Jug Video
  [key: string]: string | undefined; // Allow custom assets
}

export interface BrandStory {
  headline: string;
  subheadline: string;
  narrative: string;
  values: string[];
  heroImage?: string;
}

export interface SiteConfig {
  heroHeadline: string;
  heroSubheadline: string;
  assets: SiteAssets;
  products: Product[];
  blogPosts: BlogPost[];
  story: BrandStory;
  adminPassword?: string; // Added for cloud persistence
  passwordHint?: string;
}