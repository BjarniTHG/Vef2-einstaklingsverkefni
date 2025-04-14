'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  //const handleLogout = async () => {
  //  try{
  //    const response = await fetch('/api/auth/logout', {
  //      method: 'POST',
  //      credentials: 'include',
  //    });
  //
  //    if(response.ok){
  //      await refreshSession();
  //      router.push('/');
  //    }
  //  } catch(error){
  //    console.error('Villa við útskráningu: ', error);
  //  }
  //};

  return(
    <header className="bg-gray-900 text-white shadow-lg">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
          SmileyStudent
        </Link>
        <div className='flex items-center gap-4'>
          {user ? (
            <>
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text font-bold text-lg px-2 py-1 rounded-md border border-blue-400 shadow-md hover:shadow-blue-300/50 transition-all duration-300 cursor-default">
            {user.name}
            </span>
            <button 
              onClick={logout}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors"
            >
              Sign Out
            </button>
            </>
          ) : (
            <Link href="/auth/login">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  </header>
  );
};

export default Header;