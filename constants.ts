
import { Product, ProductCategory, Testimonial, BlogPost, BrandStory } from './types';

// NOTE: In a real deployment, these URLs would point to the user's uploaded assets.
export const ASSETS = {
  heroVideoPoster: "https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=2070&auto=format&fit=crop",
  fireStarterHero: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2070&auto=format&fit=crop", // Camping/Fire vibe
  copperHero: "https://images.unsplash.com/photo-1620219662768-e366141a0635?q=80&w=2070&auto=format&fit=crop", // Copper Mule
  brandMark: "https://images.unsplash.com/photo-1625016279860-936639b7a421?q=80&w=200&auto=format&fit=crop", // Default copper texture as mark
  lifestyleRitual: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200&auto=format&fit=crop", // Cocktail/Ritual vibe
  textureWood: "https://images.unsplash.com/photo-1611566026373-c6c8544c0429?q=80&w=1000&auto=format&fit=crop",
  textureCopper: "https://images.unsplash.com/photo-1625016279860-936639b7a421?q=80&w=1000&auto=format&fit=crop",
  lifestyleCabin: "https://images.unsplash.com/photo-1445583934509-4152fdd32399?q=80&w=2073&auto=format&fit=crop",
  lifestyleKitchen: "https://images.unsplash.com/photo-1605218427368-35b019b8db58?q=80&w=2000&auto=format&fit=crop",
  videoCopperMug: "",
  videoCopperBottle: "",
  videoCopperJug: ""
};

export const DEFAULT_STORY: BrandStory = {
  headline: "Crafted From the Elements. Designed for Life.",
  subheadline: "Designed for Life.",
  narrative: `Moscow Mix was founded on a belief that everyday products don’t have to be disposable or soulless. 
  Copper and wood—two of Earth’s oldest materials—carry history, warmth, and character. 
  When shaped with intention, they elevate the simple moments that make up a life.
  <br/><br/>
  Our copper drinkware is made from 100% pure copper, not plated shortcuts that chip or tarnish prematurely. 
  Our fire starters are formed from natural wood wool, igniting cleanly without chemicals or fumes.`,
  values: ["Purity", "Durability", "Purpose", "Design Integrity"],
  heroImage: "https://images.unsplash.com/photo-1504280501179-fac52ddca06a?q=80&w=2070&auto=format&fit=crop"
};

export const PRODUCTS: Product[] = [
  {
    id: 'copper-mule-16oz',
    name: "Premium Pure Copper Mug (16oz)",
    subtitle: "Hand-Hammered Solid Copper",
    price: 34.95,
    description: "Crafted from 100% pure copper, this mug delivers the coldest, cleanest, most refreshing drink experience possible. The hammered finish adds grip, character, and premium texture. Perfect for Moscow Mules, cocktails, mocktails, or daily hydration.",
    features: [
      "Solid copper construction",
      "Naturally antimicrobial",
      "Hand-hammered finish",
      "No lining, lacquer, or coating",
      "Built to last decades"
    ],
    category: ProductCategory.COPPER,
    images: [
      "https://images.unsplash.com/photo-1620219662768-e366141a0635?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563222378-5776d65314a5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579532824792-747d63251c6c?q=80&w=800&auto=format&fit=crop"
    ],
    rating: 4.9,
    reviews: 428,
    isBestSeller: true,
    amazonUrl: "https://amazon.com"
  },
  {
    id: 'copper-water-bottle-34oz',
    name: "Pure Copper Water Bottle (34oz)",
    subtitle: "Hydrate With Purity",
    price: 44.95,
    description: "This bottle is crafted from single-sheet pure copper, designed to deliver refreshing hydration with a naturally purifying effect. Sleek, minimal, and durable for everyday use. No plastic, no steel taste, just clean copper.",
    features: [
      "Seamless pure copper build",
      "Enhances water freshness",
      "Classic spill-proof design",
      "Perfect for home, office, gym"
    ],
    category: ProductCategory.COPPER,
    images: [
      "https://images.unsplash.com/photo-1647416395561-396e81134268?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573216895511-2eb94917dc8a?q=80&w=800&auto=format&fit=crop"
    ],
    rating: 4.8,
    reviews: 156,
    amazonUrl: "https://amazon.com"
  },
  {
    id: 'copper-jug-2l',
    name: "Premium Pure Copper Water Jug (2L)",
    subtitle: "Timeless Design, Clean Hydration",
    price: 89.95,
    description: "Timeless design meets clean hydration. A centerpiece for modern and classic kitchens alike. Storing water in a copper jug is an ancient practice known to purify and charge water with essential minerals.",
    features: [
      "100% pure copper body",
      "Large 2L capacity",
      "Natural antimicrobial benefits",
      "Comes with matching lid"
    ],
    category: ProductCategory.COPPER,
    images: [
      "https://images.unsplash.com/photo-1596708785934-1c52d80c3c66?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614266399435-08170c97800c?q=80&w=800&auto=format&fit=crop"
    ],
    rating: 5.0,
    reviews: 42,
    isNew: true,
    amazonUrl: "https://amazon.com"
  },
  {
    id: 'fire-starters-150',
    name: "Natural Wood Wool Fire Starters",
    subtitle: "Instant Flame, Zero Chemicals",
    price: 29.95,
    description: "Made from pure wood wool and natural wax, these fire starters ignite instantly and burn cleanly. Odorless, non-toxic, and capable of burning for up to 10 minutes. Safe for stoves, grills, fire pits, and camping.",
    features: [
      "Lights with a single spark",
      "Zero chemical smell",
      "Indoor + outdoor safe",
      "Available in 25, 75, 150 packs"
    ],
    category: ProductCategory.FIRE,
    images: [
      "https://images.unsplash.com/photo-1582236560935-71cb133d348a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510265119258-db115b0e8172?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525209149971-d1c238b6d39d?q=80&w=800&auto=format&fit=crop"
    ],
    rating: 5.0,
    reviews: 892,
    isBestSeller: true,
    amazonUrl: "https://amazon.com"
  },
  {
    id: 'fire-starter-cubes',
    name: "Fire Starter Cubes",
    subtitle: "Simple. Powerful. Clean.",
    price: 19.95,
    description: "Perfect for grilling and home fireplaces. These dense ignition cores offer a sustained burn to get even the most stubborn logs or charcoal going without lighter fluid.",
    features: [
      "Dense ignition core",
      "Clean burning",
      "Moisture-resistant",
      "Perfect for barbecues"
    ],
    category: ProductCategory.FIRE,
    images: [
      "https://images.unsplash.com/photo-1618330835717-8751de2bc392?q=80&w=800&auto=format&fit=crop", // Coal/Cube vibe
      "https://images.unsplash.com/photo-1533575770077-052fa2c609fc?q=80&w=800&auto=format&fit=crop"
    ],
    rating: 4.7,
    reviews: 89,
    amazonUrl: "https://amazon.com"
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "science-of-copper",
    title: "Why Your Mule Tastes Better in Pure Copper",
    excerpt: "It's not just tradition—it's thermal dynamics. Discover how copper's atomic structure interacts with ice and citric acid to create the perfect sip.",
    slug: "why-your-mule-tastes-better-in-pure-copper",
    metaDescription: "Discover the science behind copper mugs and why they make Moscow Mules taste better. Learn about thermal conductivity and flavor enhancement.",
    tags: ["Science", "Cocktails", "Copper Care"],
    content: "<p>The Moscow Mule is famous for its copper mug, but few people understand the science behind it. When the cold copper touches your lips, the metal instantly takes on the temperature of the drink.</p><p>This sensory feedback loop tricks your brain into perceiving the drink as colder and fresher than it actually is. Furthermore, copper oxidation slightly enhances the aroma of the vodka and lime, creating a fuller flavor profile that glass or stainless steel simply cannot replicate.</p><h2>The Thermal Advantage</h2><p>Copper is one of the most thermally conductive metals on earth. This means it transfers heat (or cold) faster than almost any other material. In a glass, the insulation keeps the cold 'in' the liquid. In a copper mug, the cold is transferred 'to' the vessel.</p><blockquote><strong>Tip:</strong> Always hand wash your copper mugs to preserve their structural integrity and prevent tarnishing from dishwasher salts.</blockquote>",
    coverImage: "https://images.unsplash.com/photo-1620219662768-e366141a0635?q=80&w=1200&auto=format&fit=crop",
    date: "October 12, 2023",
    author: "Michael B.",
    readTime: "4 min read"
  },
  {
    id: "art-of-fire",
    title: "The Lost Art of Building a Fire",
    excerpt: "Stop using lighter fluid. Learn the log cabin method and why natural materials matter for the perfect hearth.",
    slug: "lost-art-building-fire",
    metaDescription: "Learn how to build the perfect fire using the log cabin method and natural wood wool starters. No chemicals, just pure flame.",
    tags: ["Firecraft", "Outdoors", "How-To"],
    content: "<p>Building a fire is a primal ritual. It connects us to our ancestors and provides a focal point for gathering. However, the modern convenience of lighter fluid has ruined the experience with chemical smells and dangerous flare-ups.</p><h2>The Log Cabin Method</h2><p>The 'Log Cabin' method, combined with natural wood wool starters, ensures a clean, sustainable burn that respects the environment and your guests. By stacking the wood in a square pattern, you create a chimney effect that draws oxygen into the center.</p><div class=\"image-block\"><img src=\"https://images.unsplash.com/photo-1496317512549-d828d9c12532?q=80&w=1200&auto=format&fit=crop\" /><span class=\"caption\">A perfectly stacked fire ready for ignition.</span></div><p>Start with two large logs parallel to each other. Place two slightly smaller logs across them perpendicularly. Repeat this until you have a small tower. Place your Moscow Mix wood wool starter in the center of the base and light it.</p>",
    coverImage: "https://images.unsplash.com/photo-1496317512549-d828d9c12532?q=80&w=1200&auto=format&fit=crop",
    date: "November 05, 2023",
    author: "Sarah J.",
    readTime: "6 min read"
  }
];

export const TESTIMONIALS: Testimonial[] = [];