'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function Signin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    return (
        <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4">Sign In</h2>

                {/* Email Input */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 p-2 w-full rounded-md bg-gray-700 text-gray-300 focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>

                {/* Password Input */}
                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 p-2 w-full rounded-md bg-gray-700 text-gray-300 focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>

                {/* Login Button */}
                <div>
                    <button
                        onClick={() => signIn('credentials', { email, password, redirect: true, callbackUrl: '/profile/upload' })}
                        disabled={!email || !password}
                        type="button"
                        className="disabled:opacity-40 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    )
}