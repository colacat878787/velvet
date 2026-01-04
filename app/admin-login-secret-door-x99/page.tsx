'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SecretLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 這是你要的硬編碼檢查
    if (username === 'bacon' && password === 'iamminecrafterror422') {
        // 通過第一關，接著登入真正的 Supabase 帳號
        // 注意：你必須先在 Supabase 後台 Authentication 建立這個 email 的使用者
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: 'bacon@admin.com', 
            password: 'iamminecrafterror422',
        });

        if (authError) {
             setError('SYSTEM ERROR: Database Auth Failed. (Did you create the user in Supabase?)');
        } else {
             router.push('/dashboard');
        }
    } else {
        setError('ACCESS DENIED: Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.form 
            initial={{ opacity: 0, rotateX: 90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            onSubmit={handleLogin}
            className="w-full max-w-sm bg-zinc-900 border border-red-900/50 p-8 rounded-lg shadow-[0_0_50px_rgba(255,0,0,0.2)]"
        >
            <h1 className="text-red-600 font-mono text-xl mb-6 tracking-[0.2em] text-center border-b border-red-900 pb-2 animate-pulse">
                SYSTEM OVERRIDE
            </h1>
            
            {error && <div className="text-red-500 text-xs mb-4 font-mono text-center border border-red-500/20 p-2 bg-red-900/10">{error}</div>}

            <div className="space-y-4 font-mono">
                <div>
                    <label className="text-xs text-red-800 block mb-1">IDENTITY</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-black border border-zinc-800 text-red-500 p-3 focus:border-red-600 focus:outline-none focus:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all"
                        placeholder="ENTER USERNAME"
                    />
                </div>
                <div>
                    <label className="text-xs text-red-800 block mb-1">PASSPHRASE</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-black border border-zinc-800 text-red-500 p-3 focus:border-red-600 focus:outline-none focus:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all"
                        placeholder="••••••••••••"
                    />
                </div>
            </div>
            
            <button className="w-full mt-8 bg-red-900/10 text-red-600 border border-red-900 py-3 font-mono hover:bg-red-900/30 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all uppercase tracking-wider text-sm">
                Initiate Session
            </button>
        </motion.form>
    </div>
  );
}