'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleSubmit } from './actions';

export default function Page() {
  const [error, setError] = useState('');
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto mt-10">
      <form 
        action={async (formData) => {
          const result = await handleSubmit(formData);
          
          if (result.success && result.redirect) {
            // Programmatically navigate to the redirect path
            router.push(result.redirect);
            return;
          }

          if (result && !result.success) {
            setError(result.error || '');
          } else {
            setError(''); // Clear any previous errors
          }
        }} 
        className="flex flex-col gap-4"
      >
        <input 
          type="text" 
          name="email" 
          placeholder="Email" 
          required 
          className="border p-2 rounded"
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          required 
          className="border p-2 rounded"
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white p-2 rounded"
        >
          Submit
        </button>
        
        {error && (
          <div className="text-red-500 text-sm mt-2 text-center">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}