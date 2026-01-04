'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react'; // 新增 icon

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          full_name: username,
          avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${username}`
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert('註冊成功！系統將自動登入。');
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

      <form onSubmit={handleRegister} className="w-full max-w-sm bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10">
        <h1 className="text-2xl font-bold mb-6 text-center">建立你的 Velvet</h1>
        <input type="text" placeholder="使用者名稱 (例如: bacon)" value={username} onChange={e => setUsername(e.target.value)} className="w-full mb-3 p-3 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-pink-500" required />
        <input type="email" placeholder="電子郵件" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-3 p-3 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-pink-500" required />
        <input type="password" placeholder="密碼" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-6 p-3 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-pink-500" required />
        <button disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
            {loading ? '處理中...' : '建立帳號'}
        </button>
        <p className="text-center mt-6 text-sm text-zinc-500">
            已有帳號？ <Link href="/login" className="text-white hover:underline">去登入</Link>
        </p>
      </form>
    </div>
  );
}