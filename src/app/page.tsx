'use client';

import { useAuth } from './context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // If user is logged in, redirect to dashboard after a short delay
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000); // 3 second delay before redirect
      
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  // For logged in users - show a welcome back message and countdown to redirect
  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-neutral">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl font-bold text-blue-600 mb-6">
            Velkomin/n/ð, {user.name}!
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Sendum þig í mælaborðið...
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link href="/dashboard">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Fara á mælaborð
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // For non-logged in users - show a landing page with features and call to action
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-neutral">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl font-bold text-blue-400 mb-6">
            Undirbúðu þig fyrir prófin með <span className="text-blue-600">SmileyStudent</span>
          </h1>
          <p className="text-xl text-gray-500 mb-8">
            Upprunalega hannað sem eftirherma af SmileyTutor, en varð fljótt að sínu eigin dæmi
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link href="/auth/register">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Nýskrá
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium transition-colors">
                Skrá inn
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Hvað er hægt að gera á SmileyStudent?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Búðu til þín eigin spurningasett</h3>
              <p className="text-gray-600">
                Auðvelt er að búa til spurningasett um hvað sem er.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fylgjast með árangri</h3>
              <p className="text-gray-600">
                Fylgstu árangri þínum með tilraununum, og hvar þú getur bætt þig.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Deila með vinum</h3>
              <p className="text-gray-600">
                Þú getur stjórnað því hvort að aðrir sjái settin þín. Þú getur linkað vinum þín sett til að sjá hvar þið standið!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-neutral text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Tilbúinn að byrja?</h2>
          <p className="text-xl mb-8">Búðu til þinn eigin aðgang!</p>
          <Link href="/auth/register">
            <button className="bg-white text-blue-600 hover:bg-gray-300 px-8 py-3 rounded-lg font-medium transition-colors">
              Búa til aðgang
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
