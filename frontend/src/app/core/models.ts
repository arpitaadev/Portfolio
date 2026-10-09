export interface SkillGroup { group: string; items: string[]; }
export interface Experience { role: string; company: string; period: string; points: string[]; }
export interface Education { degree: string; detail: string; }
export interface Publication { title: string; venue: string; summary: string; link: string; }

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  roles: string[];
  location: string;
  email: string;
  resume_url: string;
  socials: { github: string; linkedin: string };
  about: string[];
  stats: { label: string; value: string }[];
  skills: SkillGroup[];
  experience: Experience[];
  education: Education[];
  publications: Publication[];
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  featured: boolean;
  status: string;
  github: string;
  demo: string;
  highlights: string[];
}

export interface PostSummary { slug: string; title: string; date: string; tags: string[]; excerpt: string; }
export interface Post extends PostSummary { content: string; }

export interface ContactPayload { name: string; email: string; message: string; website: string; }
export interface ChatReply { answer: string; sources: string[]; }
