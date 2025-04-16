'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function CreateQuiz(){
    const { user } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if(!user){
        router.push('/auth/login');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try{
            const response = await fetch('/api/quiz-sets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    isPublic,
                }),
            });

            if(!response.ok){
                throw new Error('Ekki tókst að búa til spurninga sett');
            }

            const data = await response.json();
            router.push(`/quiz/${data.id}/edit`);
        } catch(error){
            console.error('Villa við að búa til spurninga sett', error);
            setError('Failaði að búa til spurninga sett! >:/');
        } finally{
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Búa til nýtt spurningasett</h1>
    
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
    
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Titill á setti
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Titill á spurningasetti"
              />
            </div>
    
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Lýsing (Valfrjálst)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Lýsing á setti"
              />
            </div>
    
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                Gera þetta spurningasett opiðbert
              </label>
            </div>
    
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md disabled:bg-blue-300"
              >
                {loading ? 'Býr til spurningasett...' : 'Búa til spurningasett'}
              </button>
            </div>
          </form>
        </div>
      );
}