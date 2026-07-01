export interface Education {
  institution: string;
  degree: string;
  period: string;
  cgpa: string;
}

export interface Skills {
  languages: string[];
  frameworks: string[];
  tools: string[];
  coursework: string[];
}

export interface PositionOfResponsibility {
  title: string;
  org: string;
  period: string;
  bullets: string[];
}

export interface Profile {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  education: Education;
  skills: Skills;
  positions: PositionOfResponsibility[];
  achievements: string[];
}

export interface Project {
  id: string;
  title: string;
  tech: string;
  category: string;
  description: string;
  bullets: string[];
  link: string;
  liveLink?: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  aiSummary?: string;
  aiSentiment?: string;
  aiDraftReply?: string;
}

export interface ServerStats {
  totalInquiries: number;
  sentimentBreakdown: Record<string, number>;
}
