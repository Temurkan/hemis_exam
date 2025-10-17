import { useState, useEffect, useMemo } from "react";
import { questions as allQuestions } from "./questions.js";

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

export default function QuizApp() {
  const totalTime = 3000; // 5 минут
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  const questions = useMemo(() => prepareQuestions(allQuestions), []);

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
      {!finished ? (
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-xl font-bold'>Тест из 25 вопросов</h1>
          <p className='text-gray-600'>
            Осталось времени: {minutes}:{seconds.toString().padStart(2, "0")}
          </p>
        </div>
      ) : (
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold mb-2'>Тест завершён</h1>
          <p>
            Результат: {score} из {questions.length}
          </p>
          <p className='text-gray-600'>
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
