'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Sparkles, LayoutDashboard, UserPlus, ShieldAlert, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

// 翻譯字典
const translations = {
  zh: {
    subtitle: '極致奢華的匿名問答體驗。',
    placeholder: '輸入使用者名稱 (例如: admin)',
    dashboard: '控制台',
    join: '註冊',
    godMode: '上帝模式',
    discover: '探索用戶',
    enter: '進入'
  },
  en: {
    subtitle: 'The most sophisticated anonymous Q&A platform.',
    placeholder: 'Enter username (e.g. admin)',
    dashboard: 'Dashboard',
    join: 'Join',
    godMode: 'GOD MODE',
    discover: 'Discover People',
    enter: 'Enter'
  }
};

export default function Home() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh'); // 預設繁體中文
  const t = translations[lang];

  const [targetUser, setTargetUser] = useState('');
  const [randomUsers, setRandomUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      // 1. 隨機推薦
      const { data } = await supabase.from('profiles').select('username, avatar_url').limit(20);
      if (data) {
        setRandomUsers(data.sort(() => 0.5 - Math.random()).slice(0, 4));
      }
      
      // 2. 檢查是否為 Admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.username === 'admin') {
          setIsAdmin(true);
      }
    };
    init();
  }, []);

  const handleGo = (e: any) => {
    e.preventDefault();
    if (targetUser.trim()) router.push(`/${targetUser.trim()}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 text-white relative overflow-hidden font-sans">
      
      {/* 頂部導航 */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
         <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black tracking-tighter cursor-pointer" onClick={() => router.refresh()}>Velvet.</h2>
            {/* 語言切換按鈕 */}
            <button 
                onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
                className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all backdrop-blur-md"
            >
                <Globe size={12}/> {lang === 'zh' ? 'English' : '中文'}
            </button>
         </div>

         <div className="flex gap-3">
            {isAdmin && (
                <Link href="/admin-panel" className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-500 border border-red-500/50 rounded-full font-bold text-xs hover:bg-red-600 hover:text-white transition-all">
                    <ShieldAlert size={14}/> {t.godMode}
                </Link>
            )}
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-sm font-bold border border-white/10">
                <LayoutDashboard size={16}/> <span className="hidden md:inline">{t.dashboard}</span>
            </Link>
            <Link href="/register" className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <UserPlus size={16}/> {t.join}
            </Link>
         </div>
      </nav>

      {/* 主視覺內容 */}
      <div className="relative z-40 w-full max-w-2xl text-center flex flex-col items-center mt-10">
        
        <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl md:text-9xl font-black mb-4 tracking-tighter text-white select-none"
            style={{ 
                textShadow: '0 0 40px rgba(255,255,255,0.3)',
                background: 'linear-gradient(to bottom right, #ffffff, #a5b4fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}
        >
          Velvet
        </motion.h1>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/70 mb-12 font-light max-w-lg"
        >
            {t.subtitle}
        </motion.p>
        
        {/* 輸入框 */}
        <form onSubmit={handleGo} className="relative group mb-16 w-full max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-50">
                <span className="text-white/50 text-xl font-bold">@</span>
            </div>
            <input 
                type="text" placeholder={t.placeholder} value={targetUser} onChange={e => setTargetUser(e.target.value)}
                className="w-full py-5 pl-10 pr-16 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full text-lg md:text-xl text-white placeholder-white/20 focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all shadow-2xl"
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform z-50">
                <ArrowRight size={24} />
            </button>
        </form>

        {/* 隨機推薦 */}
        {randomUsers.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
                className="bg-black/30 backdrop-blur-md p-6 rounded-3xl border border-white/5"
            >
                <div className="flex items-center justify-center gap-2 mb-4 text-white/40 text-xs font-bold uppercase tracking-widest">
                    <Sparkles size={12}/> {t.discover}
                </div>
                <div className="flex justify-center gap-6">
                    {randomUsers.map((u) => (
                        <Link key={u.username} href={`/${u.username}`} className="flex flex-col items-center group">
                            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-indigo-500 group-hover:scale-110 transition-transform shadow-lg shadow-purple-900/40">
                                <img src={u.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${u.username}`} className="w-full h-full rounded-full bg-black object-cover" />
                            </div>
                            <span className="mt-2 text-xs text-white/50 group-hover:text-white transition-colors">@{u.username}</span>
                        </Link>
                    ))}
                </div>
            </motion.div>
        )}
      </div>
    </main>
  );
}