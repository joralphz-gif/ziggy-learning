// Attempt Scoring Service
// Handles scoring of different item types

import prisma from '@/lib/prisma';
import { updateSrsEntry } from './srs';
import { updateMasteryState } from './mastery';
import { AttemptResponse, McqPayload, ShortAnswerPayload, CodingTaskPayload } from '@/types';

interface AttemptInput {
  learnerId: string;
  itemId: string;
  rawResponse: unknown;
  timeTakenMs?: number;
  testRunId?: string;
}

interface ScoringResult {
  isCorrect: boolean;
  score: number;
  feedback?: string;
  correctAnswer?: string | number;
  errorType?: string;
}

function scoreMcq(payload: McqPayload, response: number | string): ScoringResult {
  const selectedIndex = typeof response === 'string' ? parseInt(response) : response;
  const isCorrect = selectedIndex === payload.correctIndex;
  
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    feedback: isCorrect 
      ? 'Brilliant! That\'s correct! 🌟' 
      : payload.explanation || `The correct answer was: ${payload.options[payload.correctIndex]}`,
    correctAnswer: payload.options[payload.correctIndex],
    errorType: isCorrect ? undefined : 'wrong_answer',
  };
}

function scoreShortAnswer(payload: ShortAnswerPayload, response: string | number): ScoringResult {
  const normalizedResponse = String(response).toLowerCase().trim();
  const correctAnswer = String(payload.correctAnswer).toLowerCase().trim();
  
  // Check exact match
  let isCorrect = normalizedResponse === correctAnswer;
  
  // Check acceptable variants
  if (!isCorrect && payload.acceptableVariants) {
    isCorrect = payload.acceptableVariants.some(
      variant => normalizedResponse === variant.toLowerCase().trim()
    );
  }
  
  // For numeric answers, allow some tolerance
  if (!isCorrect && !isNaN(Number(response)) && !isNaN(Number(payload.correctAnswer))) {
    const numResponse = Number(response);
    const numCorrect = Number(payload.correctAnswer);
    // Allow 0.01% tolerance for rounding
    isCorrect = Math.abs(numResponse - numCorrect) < Math.abs(numCorrect * 0.0001);
  }
  
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    feedback: isCorrect
      ? 'Perfect! Well done! ✨'
      : payload.explanation || `The answer was: ${payload.correctAnswer}`,
    correctAnswer: payload.correctAnswer,
    errorType: isCorrect ? undefined : 'wrong_answer',
  };
}

function scoreCodingTask(payload: CodingTaskPayload, response: string): ScoringResult {
  // In MVP, we do simple test case checking
  // For a full implementation, you'd run the code in a sandbox
  
  // Simplified: Check if the response contains key patterns
  // This is a placeholder - real implementation would execute code
  const hasCode = Boolean(response && response.trim().length > 10);
  
  // For MVP, we'll mark as correct if there's substantial code submitted
  // Real implementation would run against test cases
  const isCorrect: boolean = hasCode;
  
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    feedback: isCorrect
      ? 'Great code! Keep it up! 🚀'
      : 'Try adding more to your solution. Check the hints if you need help!',
    errorType: isCorrect ? undefined : 'incomplete',
  };
}

function scoreLessonPage(_payload: unknown, _response: unknown): ScoringResult {
  // Lesson pages are always "correct" - they're for consumption
  return {
    isCorrect: true,
    score: 1,
    feedback: 'Great job reading through that! 📚',
  };
}

function scoreReflection(_payload: unknown, response: string): ScoringResult {
  // Reflections are scored by completion/effort
  const hasContent = Boolean(response && response.trim().length > 20);
  
  return {
    isCorrect: hasContent,
    score: hasContent ? 1 : 0.5,
    feedback: hasContent
      ? 'Thanks for sharing your thoughts! 💭'
      : 'Try to write a bit more about what you learned.',
  };
}

export async function scoreAttempt(input: AttemptInput): Promise<AttemptResponse> {
  const { learnerId, itemId, rawResponse, timeTakenMs, testRunId } = input;
  
  // Get the item with its payload
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { topic: true },
  });
  
  if (!item) {
    throw new Error('Item not found');
  }
  
  // Score based on item type
  let scoringResult: ScoringResult;
  const payload = item.payload as unknown;
  
  switch (item.typeId) {
    case 'mcq':
    case 'concept_mcq':
      scoringResult = scoreMcq(payload as McqPayload, rawResponse as number);
      break;
    case 'short_answer':
      scoringResult = scoreShortAnswer(payload as ShortAnswerPayload, rawResponse as string);
      break;
    case 'coding_task':
    case 'debug_task':
      scoringResult = scoreCodingTask(payload as CodingTaskPayload, rawResponse as string);
      break;
    case 'lesson_page':
      scoringResult = scoreLessonPage(payload, rawResponse);
      break;
    case 'reflection':
      scoringResult = scoreReflection(payload, rawResponse as string);
      break;
    default:
      // Default to MCQ-style scoring
      scoringResult = scoreMcq(payload as McqPayload, rawResponse as number);
  }
  
  // Save the attempt
  const attempt = await prisma.attempt.create({
    data: {
      learnerId,
      itemId,
      trackId: item.trackId,
      subjectId: item.subjectId,
      topicId: item.topicId,
      isCorrect: scoringResult.isCorrect,
      score: scoringResult.score,
      timeTakenMs,
      errorType: scoringResult.errorType,
      rawResponse: rawResponse as object,
      testRunId,
    },
  });
  
  // Update SRS entry
  await updateSrsEntry(
    learnerId,
    itemId,
    item.trackId,
    item.topicId,
    scoringResult.isCorrect
  );
  
  // Get mastery rules from topic
  const masteryRules = item.topic.masteryRules as {
    min_recent_attempts: number;
    min_accuracy: number;
    min_days_span: number;
  };
  
  // Update mastery state
  const masteryState = await updateMasteryState(
    learnerId,
    item.topicId,
    item.trackId,
    item.subjectId,
    masteryRules
  );
  
  return {
    attempt_id: attempt.id,
    is_correct: scoringResult.isCorrect,
    score: scoringResult.score,
    feedback: scoringResult.feedback,
    correct_answer: scoringResult.correctAnswer,
    mastery_state: {
      status: masteryState.masteryStatus,
      rag: masteryState.rag,
      percent_correct: masteryState.percentCorrect,
    },
  };
}
