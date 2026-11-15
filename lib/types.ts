export interface Analysis {
  overallScore: number;
  skillsMatchPercent: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordsFound: string[];
  keywordsMissing: string[];
  technicalAnalysis: string;
  experienceRelevance: string;
  educationRelevance: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: { area: string; advice: string }[];
}
