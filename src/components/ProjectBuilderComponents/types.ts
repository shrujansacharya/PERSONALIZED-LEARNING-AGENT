
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
      };
    };
    channelTitle: string;
  };
}
