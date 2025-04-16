'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

type QuizSet = {
    id: number;
    title: string;
    description: string | null;
    isPublic: boolean;
    createdAt: string;
    createdBy: {
        name: string;
    };
    _count: {
        questions: number;
    };
};

export default function Dashboard(){
    const { user } = useAuth();
    const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuizSets = async () => {
            try{
                const response = await fetch('/api/quiz-sets');
                if(!response.ok){
                    throw new Error('Villa við að sækja quiz sets inn í useEffecti í dashboardi');
                }
                const data = await response.json();
                setQuizSets(data);
            } catch(error){
                setError('Villa við að hlaða quiz settum');
                console.error('Villa við að hlaða quiz settum', error);
            } finally{
                setLoading(false);
            }
        };
        fetchQuizSets();
    }, []);

    if(loading){
        return <div className="text-center p-8">Sæki spurninga sett...</div>;
    }

    if (error){
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Geitað dashboard</h1>
            {user && (
              <Link href="/quiz/create">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md">
                  Búa til nýtt spurningasett
                </button>
              </Link>
            )}
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizSets.map((quizSet) => (
              <div key={quizSet.id} className="border rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{quizSet.title}</h2>
                  {quizSet.description && (
                    <p className="text-gray-600 mb-3">{quizSet.description}</p>
                  )}
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>By: {quizSet.createdBy.name}</span>
                    <span>{quizSet._count.questions} spurningar</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded ${quizSet.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {quizSet.isPublic ? 'Public' : 'Private'}
                    </span>
                    <div className="flex space-x-2">
                    {user && user.name === quizSet.createdBy.name && (
                        <Link href={`/quiz/${quizSet.id}/edit`}>
                          <button className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm">
                            Breyta
                          </button>
                        </Link>
                      )}
                    <Link href={`/quiz/${quizSet.id}/take`}>
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                        Reyna við spurningasett
                      </button>
                    </Link>
                    </div>
                  </div>    
                </div>
              </div>
            ))}
    
            {quizSets.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                Ekkert spurningasett til ennþá. {user ? 'Búðu til þitt eigið!' : 'Skráðu þig inn til að búa til þín eigin spurningasett!'}
              </div>
            )}
          </div>
        </div>
      );
}