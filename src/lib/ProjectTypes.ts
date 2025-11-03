// TypeScript interfaces for ProjectBuilder
export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  content: any;
  updated_at: string;
}

export interface Version {
  id: string;
  project_id: string;
  content: any;
  created_at: string;
  version_number: number;
}

export interface Badge {
  id: string;
  name: string;
  skill: string;
  earned_at: string;
}

export interface Collaborator {
  id: string;
  email: string;
}

export interface Tutorial {
  id: number;
  step: string;
  completed: boolean;
}

export interface ProjectTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  skills: string[];
  progress: number;
  content: {
    type: string;
    features: string[];
    code?: string;
    tutorials: Tutorial[];
    components?: string[];
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// YouTube API interfaces
export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

export interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  stockQuantity: number;
  brand: string;
  tags: string[];
  relatedProjects: string[];
  averageRating: number;
  reviewCount: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: number;
  latitude: number;
  longitude: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface ProductSearchResult {
  id: string;
  title: string;
  link: string;
  snippet: string;
  htmlSnippet: string;
  pagemap: {
    cse_image?: Array<{ src: string }>;
    cse_thumbnail?: Array<{ src: string }>;
    product?: Array<{ brand?: string }>;
  };
}

export type ViewType = 'landing' | 'software' | 'science' | 'project-detail';
export type PreviousViewType = 'landing' | 'software' | 'science';
export type SidebarTabType = 'chat' | 'history' | 'files' | 'video' | 'ideas' | 'code' | 'notes' | 'planner';
export type LearningModeType = 'video' | 'chatbot';
export type ToastType = { message: string; type: 'success' | 'error'; duration?: number } | null;
