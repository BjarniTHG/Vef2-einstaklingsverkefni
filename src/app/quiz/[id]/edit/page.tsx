'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

type Option = {
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
    isPublic: boolean;
    questions: Question[];
};

export default function EditQuiz({ params }: { params: { id: string } }){
    const { user } = useAuth();
    const router = useRouter();
    const [quizSet, setQuizSet] = useState<QuestionSet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState<Option[]>([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
    ]);
    const [addingQuestion, setAddingQuestion] = useState(false);

    useEffect(() => {
        if (!user){
            router.push('/auth/login');
            return;
        }

        const fetchQuizSet = async () => {
            try {
                const response = await fetch(`/api/quiz-sets/${params.id}`);
                if(!response.ok){
                    if (response.status === 401){
                        router.push('/dashboard');
                        return;
                    }
                    throw new Error('Villa við að sækja spurningasett');
                }
                const data = await response.json();
                setQuizSet(data);
            } catch(error){
                setError('Villa við að hlaða spurningasetti');
                console.error(error);
            } finally{
                setLoading(false);
            }
        };

        fetchQuizSet();
    }, [params.id, router, user]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index].text = value;
        setOptions(newOptions);
    };

    const handleCorrectChange = (index: number) => {
        const newOptions = [...options];
        newOptions.forEach((option, i) => {
            option.isCorrect = i === index;
        });
        setOptions(newOptions);
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddingQuestion(true);

        if(!questionText.trim()){
            setError('Spurning má ekki vera auð');
            setAddingQuestion(false);
            return;
        }

        const filledOptions = options.filter(option => option.text.trim());
        if(filledOptions.length < 2) {
            setError('Það verða að vera minnsta kosti tveir valmöguleikar fyrir hverja spurningu');
            setAddingQuestion(false);
            return;
        }
        if(!options.some(option => option.isCorrect)){
            setError('Velja þarf eitt svar sem rétta svarið');
            setAddingQuestion(false);
            return;
        }

        try{
            const response = await fetch(`/api/quiz-sets/${params.id}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: questionText,
                    options: options.filter(option => option.text.trim()),
                }),
            });

            if(!response.ok){
                throw new Error('Villa við að bæta við spurningu');
            }

            const newQuestion = await response.json();

            setQuizSet(prev => {
                if(!prev) return prev;
                return {
                    ...prev,
                    questions: [...prev.questions, newQuestion]
                };
            });

            setQuestionText('');
            setOptions([
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]);
            setError(null);
        } catch(error){
            console.error('Villa við að bæta við nýrri spurningu: ', error);
            setError('Villa við að bæta við spurningu.');
        } finally{
            setAddingQuestion(false);
        }
    };

    if(loading){
        return <div className="text-center p-8">Vinnur...</div>;
    }

    if(!quizSet){
        return <div className="text-center p-8 text-red-500">Spurningasett fannst ekki</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Breyti setti: {quizSet.title}</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Til baka
            </button>
          </div>
    
          {quizSet.description && (
            <p className="text-gray-600 mb-6">{quizSet.description}</p>
          )}
    
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Spurningar: {quizSet.questions.length}</h2>
            
            {quizSet.questions.length === 0 ? (
              <div className="text-center py-8 bg-neutral rounded-lg border border-gray-200">
                <p className="text-gray-500">Engar spurningar ennþá. Bættu fyrstu spurningunni við!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizSet.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4 bg-neutral shadow-sm">
                    <div className="flex justify-between">
                      <h3 className="font-medium">
                        <span className="text-gray-500 mr-2">{index + 1}.</span>
                        {question.text}
                      </h3>
                    </div>
                    <div className="mt-3 pl-6">
                      <ul className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <li key={optIndex} className={`${option.isCorrect ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                            {option.isCorrect ? '✓ ' : ''}
                            {option.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
    
          <div className="bg-neutral border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Bæta við spurningu</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
    
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">
                  Spurning
                </label>
                <input
                  type="text"
                  id="questionText"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Hverju viltu spurja að?"
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valmöguleikar (Merktu einn sem réttan)
                </label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={option.isCorrect}
                      onChange={() => handleCorrectChange(index)}
                      className="mr-2"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder={`Svarmöguleiki ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
    
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={addingQuestion}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md disabled:bg-blue-300"
                >
                  {addingQuestion ? 'Adding...' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    
}