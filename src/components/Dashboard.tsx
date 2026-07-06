import React, { useState } from 'react';
import { SubjectId } from '../types/quiz';
import { MOCK_SUBJECTS } from '../data/mockQuizzes';

interface DashboardProps {
  onStartQuiz: (subjectId: SubjectId, timeLimitSeconds: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('linear-algebra');
  const [timeLimit, setTimeLimit] = useState<number>(30); // 기본 30초

  const handleStart = () => {
    onStartQuiz(selectedSubject, timeLimit);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 font-sans">
      {/* Top Header */}
      <div className="mt-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          TOSS MINI APP
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
          문제격파하기
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          토스 미니앱 퀴즈 아레나에 오신 것을 환영합니다. 과목을 선택하고 제한 시간 내에 5문제를 격파해 보세요.
        </p>
      </div>

      {/* Main Form Content */}
      <div className="my-auto py-8 space-y-6">
        {/* Subject Selection */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">과목 선택</h2>
          <div className="grid grid-cols-1 gap-3">
            {MOCK_SUBJECTS.map((subject) => {
              const isSelected = selectedSubject === subject.id;
              return (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <span className="text-2xl">{subject.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-200">{subject.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">
                      {subject.description}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Limit Setting */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-900">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">문제당 제한 시간</h2>
            <span className="text-sm font-bold text-indigo-400">{timeLimit}초</span>
          </div>
          <div className="flex items-center gap-2">
            {[10, 20, 30, 45, 60].map((seconds) => (
              <button
                key={seconds}
                onClick={() => setTimeLimit(seconds)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  timeLimit === seconds
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {seconds}s
              </button>
            ))}
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            * 제한시간이 만료되면 해당 문제는 오답으로 처리되고 다음 문제로 넘어갑니다.
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={handleStart}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(99,102,241,0.2)] active:scale-[0.98]"
        >
          격파 시작하기
        </button>
      </div>
    </div>
  );
};
