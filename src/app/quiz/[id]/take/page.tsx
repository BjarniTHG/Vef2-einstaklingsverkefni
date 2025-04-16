'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

type Option = {
  id: number;
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: number;
  text: string;
  options: Option[];
};

type QuestionSet = {
  id: number;
  title: string;
  description: string | null;
  questions: Question[];
  createdBy: {
    name: string;
  };
};

export default function TakeQuiz({ params }: { params: { id: string } }){
    const { user } = useAuth();
    const router = useRouter();
    const [quizSet, setQuizSet] = useState<QuestionSet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [answers, setAnswers] = useState<{ questionId: number; optionId: number; timeToAnswer: number }[]>([]);
    const [startTime, setStartTime] = useState<number>(0);
    const [questionStartTime, setQuestionStarttime] = useState<number>(0);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        const fetchQuizSet = async () => {
            try{
                const response = await fetch(`/api/quiz-sets/${params.id}`);
                if(!response.ok){
                    throw new Error('Villa við að sækja spurningasett');
                }
                const data = await response.json();

                if(data.questions.length === 0){
                    setError('Þetta sett hefur engar spurningar ennþá. Prófaðu að búa eina til!');
                    setLoading(false);
                    return;
                }

                setQuizSet(data);

                if(user){
                    const attemptResponse = await fetch(`/api/quiz-sets/${params.id}/attempt`, {
                        method:'POST',
                    });

                    if(attemptResponse.ok){
                        const attemptData = await attemptResponse.json();
                        setAttemptId(attemptData.id);
                    }
                }

                const nuna = Date.now();
                setStartTime(nuna);
                setQuestionStarttime(nuna);
            } catch(error){
                console.error('Villa!!: ', error);
                setError('Villa við að hlaða spurningasetti');
            } finally{
                setLoading(false);
            }
        };

        fetchQuizSet();
    }, [params.id, user]);

    const handleOptionSelect = (optionId: number) => {
        setSelectedOptionId(optionId);
    };

    const handleNextQuestion = async () => {
        if(selectedOptionId === null || !quizSet) return;

        const currentQuestion = quizSet.questions[currentQuestionIndex];
        const timeToAnswer = Math.floor((Date.now() - questionStartTime) / 1000);

        const answer = {
            questionId: currentQuestion.id,
            optionId: selectedOptionId,
            timeToAnswer
        };

        setAnswers([...answers, answer]);

        if(user && attemptId){
            try{
                await fetch(`/api/quiz-attempts/${attemptId}/answers`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            questionId: currentQuestion.id,
                            optionId: selectedOptionId,
                            timeToAnswer
                        }),
                    });
            } catch(error){
                console.error('Villa við að senda svör:', error);
            }
        }

        if(currentQuestionIndex < quizSet.questions.length - 1){
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOptionId(null);
            setQuestionStarttime(Date.now());
        } else{
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        if(!quizSet) return;

        const totalTime = Math.floor((Date.now() - startTime) / 1000);

        let correctAnswers = 0;
        answers.forEach(answer => {
            const question = quizSet.questions.find(q => q.id === answer.questionId);
            if(question){
                const selectedOption = question.options.find(o => o.id === answer.optionId);
                if (selectedOption && selectedOption.isCorrect){
                    correctAnswers++;
                }
            }
        });

        const calculatedScore = Math.round((correctAnswers / quizSet.questions.length)* 100);
        setScore(calculatedScore);
        setQuizCompleted(true);

        if(user && attemptId){
            try{
                await fetch(`/api/quiz-attempts/${attemptId}/complete`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            score: calculatedScore,
                            timeTaken: totalTime
                        }),
                    });
            } catch(error){
                console.error('Error completing quiz:', error);
            }
        }
    };

    if(loading){
        return(
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
            </div>
        </div>
        );
    }

    if(error){
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Back to Dashboard
              </button>
            </div>
          );
    }

    if(!quizSet){
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Quiz not found
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Back to Dashboard
              </button>
            </div>
          );
    }

    if (quizCompleted) {
        return (
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-neutral rounded-lg shadow-md p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Sett klárað!</h1>
              <div className="mb-6">
                <div className="text-5xl font-bold text-blue-600 mb-2">{score}%</div>
                <p className="text-gray-600">
                  Þú svaraðir {answers.filter((a, i) => {
                    const question = quizSet.questions[i];
                    const option = question.options.find(o => o.id === a.optionId);
                    return option?.isCorrect;
                  }).length} af {quizSet.questions.length} spurningum rétt
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <h2 className="text-xl font-semibold">Þín svör</h2>
                {quizSet.questions.map((question, index) => {
                  const answer = answers[index];
                  const selectedOption = question.options.find(o => o.id === answer?.optionId);
                  const isCorrect = selectedOption?.isCorrect;
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4 text-left">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {isCorrect ? '✓' : '✗'}
                        </div>
                        <div>
                          <p className="font-medium">{question.text}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Þú svaraðir: {selectedOption?.text}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-green-600 mt-1">
                              Rétt svar: {question.options.find(o => o.isCorrect)?.text}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Tími til að svara: {answer?.timeToAnswer} sekúndur
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push(`/quiz/${params.id}`)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Reyna aftur
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                  Aftur á mælaborð(dashboard)
                </button>
              </div>
            </div>
          </div>
        );
      }

      const currentQuestion = quizSet.questions[currentQuestionIndex];

      return(
        <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-neutral rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">{quizSet.title}</h1>
            <div className="text-sm text-gray-600">
              Spurning {currentQuestionIndex + 1} af {quizSet.questions.length}
            </div>
          </div>
          
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${((currentQuestionIndex + 1) / quizSet.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">{currentQuestion.text}</h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <div 
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedOptionId === option.id 
                      ? 'bg-gray-900 border-blue-500' 
                      : 'hover:bg-gray-600'
                  }`}
                >
                  {option.text}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              Hætta við tilraun
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={selectedOptionId === null}
              className={`px-4 py-2 rounded-md ${
                selectedOptionId === null
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {currentQuestionIndex < quizSet.questions.length - 1 ? 'Næsta spurning' : 'Klára tilraun'}
            </button>
          </div>
        </div>
      </div>
      )
}