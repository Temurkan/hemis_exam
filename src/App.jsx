import { useState, useEffect, useMemo } from "react";
import { questions as invest } from "./data/questions_invest.js";
import { questions as banklaw } from "./data/questions_banklaw.js";
import { questions as supervision } from "./data/questions_supervision.js";
import { questions as digitalbank } from "./data/questions_digitalbank.js";
import { questions as audit } from "./data/questions_audit.js";

// ---------- утилиты ----------
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function prepareQuestions(all) {
  const shuffled = shuffleArray(all).slice(0, 25);
  return shuffled.map((q) => {
    const options = [...q.options];
    const correct = q.options[q.answer];
    const mixed = shuffleArray(options);
    const newAnswer = mixed.indexOf(correct);
    return { text: q.text, options: mixed, answer: newAnswer };
  });
}

// ---------- компонент теста ----------
function QuizApp({ allQuestions, subject, onBack, darkMode, toggleDark }) {
  const totalTime = 3000; // 50 минут
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  const questions = useMemo(
    () => prepareQuestions(allQuestions),
    [allQuestions]
  );

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, finished]);

  const handleSelect = (qIndex, optIndex) => {
    if (finished) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleFinish = () => {
    let count = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) count++;
    });
    setScore(count);
    setFinished(true);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const used = totalTime - timeLeft;

  return (
    <div
      className={`p-6 max-w-3xl mx-auto ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <div className='flex justify-between items-center mb-4'>
        <button
          onClick={onBack}
          className={`px-3 py-1 text-sm rounded-lg ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          ← Назад
        </button>
        <h1 className='text-xl font-bold'>{subject}</h1>
        <div className='flex items-center gap-3'>
          <p className='text-gray-500 dark:text-gray-400'>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </p>
          <button
            onClick={toggleDark}
            className={`px-2 py-1 text-sm rounded-lg border ${
              darkMode
                ? "bg-gray-800 border-gray-600 hover:bg-gray-700"
                : "bg-gray-100 border-gray-300 hover:bg-gray-200"
            }`}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {finished && (
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold mb-2'>Тест завершён</h1>
          <p>
            Результат: {score} из {questions.length}
          </p>
          <p className='text-gray-500'>
            Потрачено времени: {Math.floor(used / 60)}:
            {(used % 60).toString().padStart(2, "0")}
          </p>
        </div>
      )}

      <div className='space-y-6'>
        {questions.map((q, qi) => {
          const userAnswer = answers[qi];
          const correctAnswer = q.answer;
          const isCorrect = userAnswer === correctAnswer;

          return (
            <div
              key={qi}
              className={`border p-4 rounded-lg ${
                darkMode
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <p className='font-medium mb-3'>
                {qi + 1}. {q.text}
              </p>
              <div className='space-y-2'>
                {q.options.map((opt, oi) => {
                  let color = "";
                  if (finished) {
                    if (oi === correctAnswer)
                      color = darkMode
                        ? "bg-green-800 border-green-600"
                        : "bg-green-200 border-green-500";
                    else if (userAnswer === oi && oi !== correctAnswer)
                      color = darkMode
                        ? "bg-red-800 border-red-600"
                        : "bg-red-200 border-red-500";
                    else color = "opacity-60";
                  } else if (userAnswer === oi) {
                    color = darkMode
                      ? "bg-blue-900 border-blue-500"
                      : "bg-blue-100 border-blue-400";
                  }

                  return (
                    <label
                      key={oi}
                      className={`flex items-center gap-2 cursor-pointer rounded-lg border p-2 transition ${color}`}
                    >
                      <input
                        type='radio'
                        name={`question-${qi}`}
                        checked={userAnswer === oi}
                        onChange={() => handleSelect(qi, oi)}
                        disabled={finished}
                        className='text-blue-600 focus:ring-blue-500'
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>

              {finished && userAnswer != null && (
                <p
                  className={`mt-2 font-medium ${
                    isCorrect ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isCorrect
                    ? "✅ Ты выбрал правильно"
                    : `❌ Правильный ответ: ${q.options[correctAnswer]}`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!finished && (
        <div className='text-center mt-6'>
          <button
            onClick={handleFinish}
            className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
          >
            Завершить тест
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- главный экран ----------
export default function App() {
  const [selected, setSelected] = useState(null);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const toggleDark = () => setDarkMode((d) => !d);

  const subjects = [
    { name: "Инвестиции", data: invest },
    { name: "Банковское право", data: banklaw },
    { name: "Банковский надзор", data: supervision },
    { name: "Цифровые банки", data: digitalbank },
    { name: "Аудит", data: audit },
  ];

  if (selected) {
    return (
      <div
        className={
          darkMode
            ? "dark bg-gray-900 min-h-screen"
            : "bg-gray-100 min-h-screen"
        }
      >
        <QuizApp
          key={selected.name}
          subject={selected.name}
          allQuestions={selected.data}
          onBack={() => setSelected(null)}
          darkMode={darkMode}
          toggleDark={toggleDark}
        />
      </div>
    );
  }

  return (
    <div
      className={`${
        darkMode
          ? "dark bg-gray-900 text-gray-100"
          : "bg-gray-100 text-gray-900"
      } p-8 text-center min-h-screen`}
    >
      <div className='flex justify-between items-center mb-6 max-w-xl mx-auto'>
        <h1 className='text-2xl font-bold'>Выбери предмет</h1>
        <button
          onClick={toggleDark}
          className={`px-3 py-1 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
              : "bg-white border-gray-300 hover:bg-gray-200"
          }`}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto'>
        {subjects.map((subj) => (
          <button
            key={subj.name}
            onClick={() => setSelected(subj)}
            className={`px-4 py-3 rounded-lg text-white ${
              darkMode
                ? "bg-blue-700 hover:bg-blue-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {subj.name}
          </button>
        ))}
      </div>
    </div>
  );
}
