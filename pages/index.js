// pages/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function WelcomePage() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleStart = () => {
    localStorage.setItem('userName', name);
    router.push('/game');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Welcome to Hangman Game</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-full mb-4 text-black"
        />
        <button
          onClick={handleStart}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
