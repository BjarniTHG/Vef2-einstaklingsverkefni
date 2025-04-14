'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function LoginPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try{
            const result = await login(email, password);

            if(result.success){
                router.push('/');
            } else{
                setError(result.error || 'Innskráning mistókst í handleSubmit í /login/page.tsx');
            }
        } catch(error){
            console.error('Villa við innskráningu í catch blocki í handleSubmit í /login/page.tsx: ', error);
            setError('Villa við innskráningu');
        } finally {
            setIsLoading(false);
        }
    };
//        try{
//            const response = await fetch('/api/auth/login', {
//                method: 'POST',
//                headers: { 'Content-Type': 'application/json'},
//                body: JSON.stringify(formData)
//            });
//
//            if(response.ok){
//                router.push('/');
//            } else{
//                const data = await response.json();
//                setError(data.error ||'Innskráning tókst ekki');
//            }
//        } catch(error){
//            console.error('Villa við innskráningu: ', error);
//            setError('Villa við innskráningu');
//        }
//    };

    return(
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Innskráning</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                {/* Input for "email" field */}
                <input
                    type="email"
                    placeholder="Netfang"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border p-2 block w-full mb-2"
                />
        
                {/* Input for "password" field */}
                <input
                    type="password"
                    placeholder="Lykilorð"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border p-2 block w-full mb-2"
                />
        
                {/* Submit button */}
                <button 
                    type="submit" 
                    className="bg-blue-500 text-white p-2 rounded w-full"
                    disabled={isLoading}
                    >
                    {isLoading ? 'Vinnur...' : 'Skrá inn'}
                </button>
            </form>
            
            <div className="mt-4 text-center">
                <p>Ekki með aðgang? 
                    <Link href="/auth/register" className="text-blue-500 hover:underline">
                        Nýskráning
                    </Link>
                </p>
            </div>
        </div>
    )
}