'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react'; // 新增 icon

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('登入失敗：帳號或密碼錯誤');
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white relative">
      {/* 回首頁按鈕 */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
        <ChevronLeft size={20} /> 回首頁
      </Link>

      <form onSubmit={handleLogin} className="w-full max-w-sm bg-zinc-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">
          歡迎回來
        </h1>
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}
        <div className="space-y-4">
            <input type="email" placeholder="電子郵件" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-black border border-white/10 text-white focus:border-pink-500 outline-none transition-all" required />
            <input type="password" placeholder="密碼" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-black border border-white/10 text-white focus:border-pink-500 outline-none transition-all" required />
        </div>
        <button disabled={loading} className="w-full mt-6 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
            {loading ? '登入中...' : '登入 Dashboard'}
        </button>
        <p className="text-center mt-6 text-sm text-zinc-500">
            還沒有帳號？ <Link href="/register" className="text-white hover:underline">去註冊</Link>
        </p>
      </form>
    </div>
  );
}