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
function QuizApp({ allQuestions, subject, onBack }) {
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
    <div className='p-6 max-w-3xl mx-auto'>
      <div className='flex justify-between items-center mb-4'>
        <button
          onClick={onBack}
          className='px-3 py-1 text-sm bg-gray-300 rounded-lg hover:bg-gray-400'
        >
          ← Назад
        </button>
        <h1 className='text-xl font-bold'>{subject}</h1>
        <p className='text-gray-600'>
          Осталось времени: {minutes}:{seconds.toString().padStart(2, "0")}
        </p>
      </div>

      {/* блок с результатом теперь показывается сверху, не убирая вопросы */}
      {finished && (
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold mb-2'>Тест завершён</h1>
          <p>
            Результат: {score} из {questions.length}
          </p>
          <p className='text-gray-600'>
            Потрачено времени: {Math.floor(used / 60)}:
            {(used % 60).toString().padStart(2, "0")}
          </p>
          <button
            onClick={onBack}
            className='mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Вернуться к предметам
          </button>
        </div>
      )}

      {/* теперь вопросы показываются всегда */}
      <div className='space-y-6'>
        {questions.map((q, qi) => {
          const userAnswer = answers[qi];
          const correctAnswer = q.answer;
          const isCorrect = userAnswer === correctAnswer;

          return (
            <div key={qi} className='border p-4 rounded-lg'>
              <p className='font-medium mb-3'>
                {qi + 1}. {q.text}
              </p>
              <div className='space-y-2'>
                {q.options.map((opt, oi) => {
                  let color = "";
                  if (finished) {
                    if (oi === correctAnswer)
                      color = "bg-green-200 border-green-500";
                    else if (userAnswer === oi && oi !== correctAnswer)
                      color = "bg-red-200 border-red-500";
                    else color = "opacity-60";
                  } else if (userAnswer === oi) {
                    color = "bg-blue-100 border-blue-400";
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
                    isCorrect ? "text-green-700" : "text-red-700"
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

  const subjects = [
    { name: "Инвестиции", data: invest },
    { name: "Банковское право", data: banklaw },
    { name: "Банковский надзор", data: supervision },
    { name: "Цифровые банки", data: digitalbank },
    { name: "Аудит", data: audit },
  ];

  if (selected) {
    return (
      <QuizApp
        key={selected.name}
        subject={selected.name}
        allQuestions={selected.data}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className='p-8 text-center'>
      <h1 className='text-2xl font-bold mb-6'>Выбери предмет</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-xl mx-auto'>
        {subjects.map((subj) => (
          <button
            key={subj.name}
            onClick={() => setSelected(subj)}
            className='px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700'
          >
            {subj.name}
          </button>
        ))}
      </div>
    </div>
  );
}
