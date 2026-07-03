export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
}

export type InterviewTopic =
  | "Java"
  | "Spring Boot"
  | "Spring Security"
  | "Hibernate & JPA"
  | "SQL"
  | "MySQL"
  | "React.js"
  | "JavaScript"
  | "HTML & CSS"
  | "REST APIs"
  | "Microservices"
  | "Docker"
  | "AWS Basics"
  | "Data Structures & Algorithms"
  | "Operating Systems"
  | "DBMS"
  | "Computer Networks"
  | "HR Interview"
  | "Aptitude"
  | "Custom Topic";

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export type InterviewMode =
  | "Technical Interview"
  | "HR Interview"
  | "Mock Interview"
  | "Coding Interview"
  | "Rapid Fire Round";

export interface InterviewSession {
  id: string;
  userId: string;
  topic: string;
  difficulty: DifficultyLevel;
  mode: InterviewMode;
  yearsOfExperience: number;
  totalQuestions: number;
  score: number; // Average score out of 10
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  sessionId: string;
  question: string;
  codeTemplate?: string; // For Coding Interview
  sampleTestCases?: string; // For Coding Interview
  userAnswer?: string;
  score?: number; // 0-10
  correctAnswer?: string;
  missingPoints?: string[];
  suggestions?: string[];
  optimalSolutionAnalysis?: string; // Coding specific
  timeSpaceComplexity?: string; // Coding specific
  aiFeedback?: string;
  followUpQuestion?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalInterviews: number;
  averageScore: number;
  strongTopics: string[];
  weakTopics: string[];
  totalQuestionsAttempted: number;
  correctAnswersCount: number; // Score >= 7
  accuracy: number; // (correctAnswers / totalAttempted) * 100
  recentSessions: InterviewSession[];
  topicWisePerformance: {
    topic: string;
    score: number;
    completed: number;
  }[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AnswerEvaluationResult {
  score: number;
  correctAnswer: string;
  missingPoints: string[];
  suggestions: string[];
  aiFeedback: string;
  followUpQuestion?: string;
  optimalSolutionAnalysis?: string;
  timeSpaceComplexity?: string;
}
