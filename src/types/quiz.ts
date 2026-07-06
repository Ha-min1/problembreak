/**
 * 퀴즈 문제의 유형을 나타내는 유니온 타입입니다.
 */
export type QuizType = 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK' | 'SHORT_ANSWER';

/**
 * 과목(Subject)을 나타내는 고유 식별자 타입입니다.
 */
export type SubjectId = 'linear-algebra' | 'engineering-math' | 'c-cpp' | 'data-structure' | 'algorithm';

/**
 * 과목에 대한 메타데이터 구조입니다.
 */
export interface Subject {
  id: SubjectId;
  name: string;
  description: string;
  icon?: string;
}

/**
 * 퀴즈의 개별 선택지(Option) 구조입니다.
 * @template TOptionValue 옵션 값의 타입 (기본값: string)
 */
export interface QuizOption<TOptionValue = string> {
  id: string;
  value: TOptionValue;
  label: string; // 마크다운 및 LaTeX 수식 포함 가능
}

/**
 * 제네릭 퀴즈 문제 정의 인터페이스입니다.
 * @template TAnswer 정답 데이터의 타입 (기본값: string)
 * @template TOptionValue 객관식 옵션 값의 타입 (기본값: string)
 */
export interface QuizQuestion<TAnswer = string, TOptionValue = string> {
  id: string;
  type: QuizType;
  title: string;         // 마크다운 및 LaTeX 수식 포함 가능
  description?: string;   // 본문 설명, 코드 스니펫 등 (마크다운 지원)
  options?: QuizOption<TOptionValue>[]; // 객관식(MULTIPLE_CHOICE)일 경우 존재
  correctAnswer: TAnswer; // 정답 (객관식인 경우 선택지 id 또는 value, 주관식인 경우 정답 문자열 등)
  explanation: string;    // 상세 해설 (LaTeX/마크다운 지원, Unlock 전에는 은닉)
}

/**
 * 사용자가 제출한 각 문제의 답안 정보입니다.
 * @template TAnswer 제출한 답변의 타입 (기본값: string)
 */
export interface QuizSubmission<TAnswer = string> {
  questionId: string;
  selectedAnswer: TAnswer;
  isCorrect: boolean;
  timeSpentSeconds: number; // 이 문제를 푸는 데 걸린 시간
}

/**
 * 퀴즈 풀이 세션의 실시간 상태 구조입니다.
 */
export interface QuizSessionState {
  subjectId: SubjectId;
  questions: QuizQuestion<any, any>[];
  currentQuestionIndex: number;
  submissions: QuizSubmission<any>[];
  remainingTimeSeconds: number; // 현재 문제 혹은 세션 전체의 남은 시간 (Gamification 타이머)
  status: 'READY' | 'PLAYING' | 'COMPLETED';
}

/**
 * 퀴즈 완료 후 대시보드 및 결과 집계에 사용되는 타입입니다.
 */
export interface QuizSessionResult {
  subjectId: SubjectId;
  score: number;                  // 맞춘 개수 (0~5)
  totalQuestions: number;         // 5개 고정
  totalTimeSpentSeconds: number;  // 총 소요 시간
  submissions: QuizSubmission<any>[];
  isUnlocked: boolean;            // 광고 시청 리워드로 상세 해설집이 해제되었는지 여부
}
