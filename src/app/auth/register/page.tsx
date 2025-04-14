'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage(){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        const formData = {
            name,
            email,
            password,
        };

        try{
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            if(response.ok){
                router.push('/auth/login');
            } else{
                const data = await response.json();
                setError(data.error || 'Nýskráning tókst ekki');
            }
        } catch(error){
            console.error('Villa við nýskráningu: ', error);
            setError('Villa við nýskráningu');
        }
    };

    return(
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Nýskráning</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                {/* Input for "name" field */}
                <input
                    type="text"
                    placeholder="Nafn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border p-2 block w-full mb-2"
                />
        
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
                <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
                    Nýskrá
                </button>
            </form>
            
            <div className="mt-4 text-center">
                <p>Ertu nú þegar með aðgang? <Link href="/auth/login" className="text-blue-500 hover:underline">Skrá inn</Link></p>
            </div>
        </div>
    )
}