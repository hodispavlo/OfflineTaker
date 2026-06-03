import {
  Briefcase,
  GraduationCap,
  HeartPulse,
  Landmark,
  LucideIcon,
  Palette,
  Terminal,
} from "lucide-react-native";

export type ProfileCategory = "Healthcare" | "Tech" | "Education" | "Legal/Finance" | "Business" | "Creative";

export type AIProfile = {
  category: ProfileCategory;
  title: string;
  subtitle: string;
  icon: LucideIcon;
};

export const UNIVERSAL_PROFILE = "Universal";

export const PROFILE_CATEGORIES: ProfileCategory[] = [
  "Healthcare",
  "Tech",
  "Education",
  "Legal/Finance",
  "Business",
  "Creative",
];

export const AI_PROFILES: AIProfile[] = [
  { category: "Healthcare", title: "Doctor", subtitle: "Formats text into clinical SOAP notes.", icon: HeartPulse },
  { category: "Healthcare", title: "Nurse", subtitle: "Highlights care actions, risks, and follow-up.", icon: HeartPulse },
  { category: "Healthcare", title: "Therapist", subtitle: "Captures themes, interventions, and next focus.", icon: HeartPulse },
  { category: "Healthcare", title: "Dentist", subtitle: "Preserves findings, procedures, and aftercare.", icon: HeartPulse },
  { category: "Tech", title: "Software Engineer", subtitle: "Tracks blockers, architecture, and deployments.", icon: Terminal },
  { category: "Tech", title: "Product Manager", subtitle: "Extracts decisions, impact, metrics, and next steps.", icon: Terminal },
  { category: "Tech", title: "Data Scientist", subtitle: "Keeps datasets, metrics, models, and experiments.", icon: Terminal },
  { category: "Tech", title: "UX Designer", subtitle: "Summarizes user insights and design iterations.", icon: Terminal },
  { category: "Education", title: "Teacher", subtitle: "Organizes lessons, student needs, and assignments.", icon: GraduationCap },
  { category: "Education", title: "University Student", subtitle: "Turns lectures into study notes and exam cues.", icon: GraduationCap },
  { category: "Education", title: "Researcher", subtitle: "Preserves methods, findings, and limitations.", icon: GraduationCap },
  { category: "Education", title: "Academic Advisor", subtitle: "Tracks requirements, plan options, and risks.", icon: GraduationCap },
  { category: "Legal/Finance", title: "Lawyer", subtitle: "Captures facts, legal risks, and evidence needs.", icon: Landmark },
  { category: "Legal/Finance", title: "Accountant", subtitle: "Extracts amounts, compliance items, and documents.", icon: Landmark },
  { category: "Legal/Finance", title: "Financial Advisor", subtitle: "Summarizes goals, risks, and recommendations.", icon: Landmark },
  { category: "Legal/Finance", title: "Insurance Agent", subtitle: "Tracks coverage, exclusions, and claim steps.", icon: Landmark },
  { category: "Business", title: "Executive Manager", subtitle: "Distills strategy, risks, owners, and decisions.", icon: Briefcase },
  { category: "Business", title: "Sales Manager", subtitle: "Captures objections, deal stage, and follow-up.", icon: Briefcase },
  { category: "Business", title: "HR Manager", subtitle: "Preserves people-sensitive policy and follow-up.", icon: Briefcase },
  { category: "Business", title: "Consultant", subtitle: "Structures diagnosis, recommendations, and workplan.", icon: Briefcase },
  { category: "Business", title: "Project Manager", subtitle: "Tracks status, dependencies, blockers, and owners.", icon: Briefcase },
  { category: "Creative", title: "Journalist", subtitle: "Isolates revelations, quotes, and article outlines.", icon: Palette },
  { category: "Creative", title: "Content Creator", subtitle: "Finds hooks, audience takeaways, and production tasks.", icon: Palette },
  { category: "Creative", title: "Podcast Host", subtitle: "Creates episode notes, clips, and follow-up questions.", icon: Palette },
  { category: "Creative", title: "Screenwriter", subtitle: "Captures story beats, characters, and rewrite tasks.", icon: Palette },
];

export function getProfileByTitle(title: string): AIProfile | undefined {
  return AI_PROFILES.find((profile) => profile.title === title);
}
