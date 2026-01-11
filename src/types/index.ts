// Ziggy Alpha Hub - TypeScript Type Definitions

// ============================================
// ENUMS (matching Prisma)
// ============================================

export type UserRole = 'parent' | 'learner';
export type TimePriority = 'exam_critical' | 'core_skill' | 'enrichment';
export type TopicLevel = 'foundation' | 'intermediate' | 'advanced';
export type TestMode = 'diagnostic' | 'mock' | 'mini_test' | 'practice';
export type MasteryStatus = 'not_started' | 'learning' | 'practising' | 'nearly_there' | 'mastered';
export type RagStatus = 'red' | 'amber' | 'green';

// ============================================
// ITEM TYPES
// ============================================

export type ItemType = 
  | 'mcq' 
  | 'short_answer' 
  | 'coding_task' 
  | 'debug_task' 
  | 'concept_mcq' 
  | 'lesson_page' 
  | 'reflection';

// MCQ Payload
export interface McqPayload {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  imageUrl?: string;
}

// Short Answer Payload
export interface ShortAnswerPayload {
  question: string;
  correctAnswer: string | number;
  acceptableVariants?: string[];
  explanation?: string;
}

// Coding Task Payload
export interface CodingTaskPayload {
  prompt: string;
  starterCode?: string;
  solutionCode?: string;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
  hints?: string[];
}

// Lesson Page Payload
export interface LessonPagePayload {
  title: string;
  content: string; // Markdown
  mediaUrl?: string;
  reflectionPrompt?: string;
}

export type ItemPayload = McqPayload | ShortAnswerPayload | CodingTaskPayload | LessonPagePayload;

// ============================================
// MASTERY RULES
// ============================================

export interface MasteryRules {
  min_recent_attempts: number;
  min_accuracy: number;
  min_days_span: number;
}

// ============================================
// TODAY PLAN
// ============================================

export interface TodayBlock {
  block_id: string;
  title: string;
  track_id: string | null;
  estimated_minutes: number;
  topics: string[];
  item_ids: string[];
  icon?: string;
  color?: string;
}

export interface TodayPlan {
  date: string;
  total_minutes_target: number;
  blocks: TodayBlock[];
  greeting?: string;
}

// ============================================
// API RESPONSES
// ============================================

export interface AttemptResponse {
  attempt_id: string;
  is_correct: boolean;
  score: number;
  feedback?: string;
  correct_answer?: string | number;
  mastery_state?: {
    status: MasteryStatus;
    rag: RagStatus;
    percent_correct: number;
  };
}

export interface TrackOverview {
  track_id: string;
  track_name: string;
  icon: string;
  color: string;
  mastered_topics: number;
  total_topics: number;
  red_topics: number;
  amber_topics: number;
  green_topics: number;
  minutes_this_week: number;
  last_activity?: Date;
}

export interface TopicMasteryView {
  topic_id: string;
  topic_name: string;
  subject_id: string;
  subject_name: string;
  track_id: string;
  level: TopicLevel;
  mastery_status: MasteryStatus;
  rag: RagStatus;
  percent_correct: number;
  attempts_count: number;
  last_updated_at: Date | null;
}

// ============================================
// AUTH
// ============================================

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email?: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  role: UserRole;
}

// ============================================
// TRACKSPEC CONFIG
// ============================================

export interface TrackSpecSubject {
  subject_id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface TrackSpecTopic {
  topic_id: string;
  subject_id: string;
  name: string;
  description?: string;
  level: TopicLevel;
  prerequisites: string[];
  mastery_rules: MasteryRules;
  tags: string[];
}

export interface TrackSpecItemType {
  type_id: string;
  description: string;
  supported_subjects: string[];
}

export interface TrackSpec {
  track_id: string;
  name: string;
  description: string;
  time_priority: TimePriority;
  default_weekly_minutes: number;
  icon: string;
  color: string;
  subjects: TrackSpecSubject[];
  topics: TrackSpecTopic[];
  item_types: TrackSpecItemType[];
  scheduling_rules?: {
    min_minutes_per_week: number;
    max_minutes_per_week: number;
    review_weight: number;
    new_content_weight: number;
    project_weight: number;
  };
}
