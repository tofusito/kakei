import React, { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';

interface LoginProps {
    onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Importante para cookies
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                onLoginSuccess();
            } else {
                if (response.status === 429) {
                    setError('Too many attempts. Please try again later.');
                } else {
                    setError('Invalid credentials. Please try again.');
                }
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg-dark flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo y título */}
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden shadow-2xl ring-4 ring-orange-500/20">
                            <img
                                src="/apple-touch-icon.png"
                                alt="Kakei Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-2">Kakei</h2>
                    <p className="text-gray-400">Secure Financial Management</p>
                </div>

                {/* Formulario de login */}
                <div className="glass-card rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Campo de usuario */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-zinc-700/50 rounded-xl bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="Enter your username"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Campo de contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-zinc-700/50 rounded-xl bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Mensaje de error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/50 rounded-xl">
                                <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0" />
                                <p className="text-sm text-orange-400">{error}</p>
                            </div>
                        )}

                        {/* Botón de login */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer de seguridad */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        🔒 Secured with end-to-end encryption
                    </p>
                </div>
            </div>
        </div>
    );
};

