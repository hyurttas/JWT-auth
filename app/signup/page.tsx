'use client';

import { useState } from 'react';

interface User {
    email: string;
    password: string;
    createdAt: string;
}

export default function UserForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: User; error?: string }>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(undefined);

        try {
            const response = await fetch('/api/cookie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setResult({ success: data.user });
            // Clear form on success
            setFormData({ email: '', password: '' });
        } catch (error) {
            setResult({ 
                error: error instanceof Error ? error.message : 'An error occurred' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>

            {result?.success && (
                <div className="mt-4 p-4 bg-green-50 rounded-md">
                    <h3 className="text-sm font-medium text-green-800">
                        User created successfully!
                    </h3>
                    <pre className="mt-2 text-sm text-green-700">
                        {JSON.stringify(result.success, null, 2)}
                    </pre>
                </div>
            )}

            {result?.error && (
                <div className="mt-4 p-4 bg-red-50 rounded-md">
                    <h3 className="text-sm font-medium text-red-800">
                        Error
                    </h3>
                    <p className="mt-2 text-sm text-red-700">
                        {result.error}
                    </p>
                </div>
            )}
        </div>
    );
}