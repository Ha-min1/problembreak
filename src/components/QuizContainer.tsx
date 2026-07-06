import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion, QuizSubmission, SubjectId } from '../types/quiz';
import { MOCK_QUIZZES } from '../data/mockQuizzes';

interface QuizContainerProps {
  subjectId: SubjectId;
  timeLimitSeconds: number;
  onQuizComplete: (submissions: QuizSubmission<any>[]) => void;
  onCancel: () => void;
}

// LaTeX 수식 인라인 렌더링 헬퍼 컴포넌트
export const MathText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\$\$[^\$]+\$\$|\$[^\$]+\$)/g);
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Block math
          const math = part.slice(2, -2);
          return (
            <span
              key={index}
              className="block my-3 py-2 px-3 bg-slate-900/80 border border-slate-800 rounded-lg text-center font-serif italic text-indigo-300 overflow-x-auto text-sm leading-relaxed"
            >
              {math}
            </span>
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Inline math
          const math = part.slice(1, -1);
          return (
            <span
              key={index}
              className="inline-block px-1 font-serif italic text-indigo-300 font-medium"
            >
              {math}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

export const QuizContainer: React.FC<QuizContainerProps> = ({
  subjectId,
  timeLimitSeconds,
  onQuizComplete,
  onCancel,
}) => {
  const questions = MOCK_QUIZZES[subjectId] || [];
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [remainingTime, setRemainingTime] = useState<number>(timeLimitSeconds);
  const [submissions, setSubmissions] = useState<QuizSubmission<any>[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestion = questions[currentIndex];

  // 문제 시작 시 소요 시간 추적용
  const questionStartTimeRef = useRef<number>(Date.now());

  // 타이머 로직
  useEffect(() => {
    // 신규 문제 진입 시 타이머 초기화
    setRemainingTime(timeLimitSeconds);
    questionStartTimeRef.current = Date.now();

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, timeLimitSeconds]);

  // 시간 제한 만료 시 처리
  const handleTimeOut = () => {
    // 소요시간 계산
    const timeSpent = timeLimitSeconds;
    const newSubmission: QuizSubmission<string> = {
      questionId: currentQuestion.id,
      selectedAnswer: '', // 시간 초과로 빈 답안 제출
      isCorrect: false,
      timeSpentSeconds: timeSpent,
    };

    moveToNext(newSubmission);
  };

  // 다음 단계 이동 처리 공통 함수
  const moveToNext = (newSubmission: QuizSubmission<any>) => {
    const updatedSubmissions = [...submissions, newSubmission];
    setSubmissions(updatedSubmissions);

    if (currentIndex + 1 < totalQuestions) {
      // 다음 문제로 전환
      setSelectedOptionId('');
      setTextAnswer('');
      setCurrentIndex((prev) => prev + 1);
    } else {
      // 퀴즈 종료 및 최종 결과 반환
      if (timerRef.current) clearInterval(timerRef.current);
      onQuizComplete(updatedSubmissions);
    }
  };

  // 답안 제출 핸들러
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 입력 검증
    let submittedAnswer: any = '';
    if (currentQuestion.type === 'MULTIPLE_CHOICE') {
      if (!selectedOptionId) return; // 선택 필수
      submittedAnswer = selectedOptionId;
    } else {
      if (!textAnswer.trim()) return; // 텍스트 필수
      submittedAnswer = textAnswer.trim();
    }

    const timeSpent = Math.min(
      timeLimitSeconds,
      Math.round((Date.now() - questionStartTimeRef.current) / 1000)
    );

    // 정답 체크 (대소문자 및 공백 완화 비교)
    let isCorrect = false;
    if (currentQuestion.type === 'MULTIPLE_CHOICE') {
      isCorrect = submittedAnswer === currentQuestion.correctAnswer;
    } else {
      const cleanSubmitted = submittedAnswer.toLowerCase().replace(/\s+/g, '');
      const cleanCorrect = String(currentQuestion.correctAnswer)
        .toLowerCase()
        .replace(/\s+/g, '');
      isCorrect = cleanSubmitted === cleanCorrect;
    }

    const newSubmission: QuizSubmission<any> = {
      questionId: currentQuestion.id,
      selectedAnswer: submittedAnswer,
      isCorrect,
      timeSpentSeconds: timeSpent,
    };

    moveToNext(newSubmission);
  };

  // Gamification 스타일 상수
  const isTimeCritical = remainingTime <= 10;
  const isTimeDanger = remainingTime <= 5;
  const progressPercentage = (remainingTime / timeLimitSeconds) * 100;

  return (
    <div className={`w-full max-w-md mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 font-sans relative overflow-hidden transition-all duration-300 ${
      isTimeDanger ? 'ring-2 ring-red-500/30' : ''
    }`}>
      {/* 셰이크 및 하트비트 애니메이션 인라인 CSS 주입 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 55%, 95% { transform: translateX(-3px); }
          35%, 75% { transform: translateX(3px); }
        }
        .animate-shake-critical {
          animation: shake 0.4s ease-in-out infinite;
        }
      `}} />

      {/* Header & Score Progress */}
      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <button
            onClick={onCancel}
            className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:text-slate-200"
          >
            ← 포기하기
          </button>
          <span className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            문제 {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Dynamic Timer Slider Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">제한시간</span>
            <span
              className={`font-black tracking-wider transition-all duration-300 ${
                isTimeDanger
                  ? 'text-red-500 text-lg animate-pulse'
                  : isTimeCritical
                  ? 'text-amber-500 text-md'
                  : 'text-indigo-400'
              }`}
            >
              {remainingTime}s
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                isTimeDanger ? 'bg-red-600' : isTimeCritical ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card Box */}
      <div className={`my-auto py-6 space-y-6 transition-all duration-300 ${
        isTimeDanger ? 'animate-shake-critical' : ''
      }`}>
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-900 space-y-3">
          <div className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            {currentQuestion.type === 'MULTIPLE_CHOICE'
              ? '객관식'
              : currentQuestion.type === 'FILL_IN_THE_BLANK'
              ? '빈칸 완성'
              : '주관식 단답형'}
          </div>
          <h2 className="text-lg font-bold leading-relaxed text-slate-100">
            <MathText text={currentQuestion.title} />
          </h2>
          {currentQuestion.description && (
            <p className="text-sm text-slate-400 border-t border-slate-800/60 pt-3 leading-relaxed">
              <MathText text={currentQuestion.description} />
            </p>
          )}
        </div>

        {/* Input Form Section */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {currentQuestion.type === 'MULTIPLE_CHOICE' ? (
            <div className="space-y-2">
              {currentQuestion.options?.map((option) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedOptionId(option.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                        : 'bg-slate-900/35 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                        isSelected
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {option.id.toUpperCase()}
                      </span>
                      <span>
                        <MathText text={option.label} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder={
                  currentQuestion.type === 'FILL_IN_THE_BLANK'
                    ? '빈칸에 들어갈 알맞은 텍스트를 입력하세요'
                    : '정답을 직접 입력하세요 (공백/대소문자 무관)'
                }
                autoFocus
                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          )}
        </form>
      </div>

      {/* Footer Submission Button */}
      <div className="mb-6">
        <button
          onClick={() => handleSubmit()}
          disabled={
            currentQuestion.type === 'MULTIPLE_CHOICE'
              ? !selectedOptionId
              : !textAnswer.trim()
          }
          className={`w-full py-4 font-bold rounded-xl transition-all duration-300 active:scale-[0.98] ${
            (currentQuestion.type === 'MULTIPLE_CHOICE' ? selectedOptionId : textAnswer.trim())
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.2)]'
              : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          {currentIndex + 1 === totalQuestions ? '제출 및 결과 보기' : '다음 문제 격파하기'}
        </button>
      </div>
    </div>
  );
};
