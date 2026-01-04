'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, MessageSquare, Upload, Share2, MapPin, Smartphone, Plus, BarChart2, Globe, ShieldAlert, Download, X, Loader2, Check } from 'lucide-react';

const translations = {
  zh: {
    title: '控制台',
    logout: '登出',
    viewPage: '查看我的主頁',
    tabs: { inbox: '收件匣', forms: '表單投票', profile: '個人與分享' },
    inbox: {
      empty: '還沒有收到秘密留言... 快分享你的連結！',
      whoSent: '誰傳的？(免費分析)',
      unknownLoc: '未知地點',
      unknownDev: '未知裝置',
      saveImg: '存成圖片'
    },
    forms: {
      createTitle: '建立新投票',
      placeholderTitle: '投票標題 (例如：我該染頭髮嗎？)',
      launch: '發布投票',
      active: '進行中 (顯示於個人頁)',
      alert: '投票已建立！現在會在你的頁面上顯示。'
    },
    profile: {
      settings: '個人設定',
      changeAvatar: '更換頭像',
      userType: 'Velvet 用戶',
      adminType: 'Velvet 最高管理員',
      shareTitle: '分享至 IG 限動 / Line',
      shareDesc: '自動生成圖片並開啟分享選單',
      promote: '宣傳你的連結',
      copy: '複製連結',
      copied: '已複製！',
      previewBtn: '生成宣傳卡片',
      previewTitle: '卡片預覽'
    }
  },
  en: {
    title: 'Dashboard',
    logout: 'Logout',
    viewPage: 'View My Page',
    tabs: { inbox: 'Inbox', forms: 'Polls', profile: 'Profile' },
    inbox: {
      empty: 'No secrets yet... Share your link!',
      whoSent: 'WHO SENT THIS? (FREE)',
      unknownLoc: 'Unknown Location',
      unknownDev: 'Unknown Device',
      saveImg: 'Save Image'
    },
    forms: {
      createTitle: 'Create New Poll',
      placeholderTitle: 'Poll Question (e.g. Should I dye my hair?)',
      launch: 'Launch Poll',
      active: 'Active (Visible on profile)',
      alert: 'Poll Created! It is now live on your page.'
    },
    profile: {
      settings: 'Profile Settings',
      changeAvatar: 'Change Avatar',
      userType: 'Velvet User',
      adminType: 'Velvet Administrator',
      shareTitle: 'Share to IG Story / Line',
      shareDesc: 'Generates image & opens app',
      promote: 'Promote Link',
      copy: 'Copy Link',
      copied: 'Copied!',
      previewBtn: 'Generate Promo Card',
      previewTitle: 'Card Preview'
    }
  }
};

export default function Dashboard() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const t = translations[lang];

  const [messages, setMessages] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'forms' | 'profile'>('inbox');
  const [revealedMsg, setRevealedMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // 上傳狀態
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['Yes', 'No']);

  useEffect(() => {
    const init = async () => {
       const { data: { user: authUser } } = await supabase.auth.getUser();
       if(!authUser) { router.push('/login'); return; }

       const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
       setUser({ ...authUser, ...profile });

       const { data: msgs } = await supabase.from('messages').select('*').eq('recipient_id', authUser.id).order('created_at', { ascending: false });
       if(msgs) setMessages(msgs);

       const { data: myPolls } = await supabase.from('polls').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false });
       if(myPolls) setPolls(myPolls);

       setLoading(false);
    };
    init();
  }, [router]);

  const toggleLang = () => setLang(l => l === 'zh' ? 'en' : 'zh');

  const handleAvatarUpload = async (e: any) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.username}-${Date.now()}.${fileExt}`;
    
    setIsUploading(true);
    setUploadProgress(0);

    // 模擬真實感進度條 (跑得比較慢，才不會一下就卡在 90%)
    const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 95) return prev; // 卡在 95% 等待後端回應
            // 隨機增加 1~10%，模擬網路波動
            return prev + Math.floor(Math.random() * 10);
        });
    }, 300);

    try {
        // 1. 上傳到 Supabase
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
        if (uploadError) throw uploadError;

        // 2. 獲取連結
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        
        // 3. 更新資料庫
        const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
        if (updateError) throw updateError;

        // 成功！
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // 讓 100% 顯示一下下再消失
        setTimeout(() => {
            setUser({ ...user, avatar_url: publicUrl });
            setIsUploading(false);
            setUploadProgress(0);
        }, 800);

    } catch (error: any) {
        clearInterval(progressInterval);
        setIsUploading(false);
        alert('Upload Error: ' + error.message);
    }
  };

  const createPoll = async () => {
      if(!newPollTitle) return;
      const { data } = await supabase.from('polls').insert({
          user_id: user.id,
          title: newPollTitle,
          options: JSON.stringify(newPollOptions)
      }).select().single();
      
      if(data) {
          setPolls([data, ...polls]);
          setNewPollTitle('');
          alert(t.forms.alert);
      }
  };

  const copyLink = () => {
      navigator.clipboard.writeText(`${window.location.origin}/${user.username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleGeneratePreview = () => {
      const url = `/api/og?username=${user.username}`;
      setPreviewUrl(url);
  };

  const handleNativeShare = async () => {
      if (!previewUrl) return;
      const shareData = {
          title: 'Velvet',
          text: 'Ask me anything anonymous.',
          url: `${window.location.origin}/${user.username}`
      };
      try {
          const blob = await fetch(previewUrl).then(r => r.blob());
          const file = new File([blob], 'velvet-promo.png', { type: 'image/png' });
          if (navigator.share && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: 'Velvet', text: shareData.text, url: shareData.url });
          } else if (navigator.share) {
              await navigator.share(shareData);
          } else {
              copyLink();
              alert('Link copied');
          }
      } catch (err) { console.log(err); }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Velvet...</div>;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 text-white pb-24 font-sans">
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">
                {t.title}
            </h1>
            <div className="flex gap-3 items-center">
                <button onClick={toggleLang} className="flex items-center gap-1 text-xs bg-zinc-900 px-3 py-1.5 rounded-full border border-white/10 hover:bg-zinc-800 transition-all">
                    <Globe size={12}/> {lang === 'zh' ? 'EN' : '中文'}
                </button>
                <button onClick={() => window.open(`/${user.username}`, '_blank')} className="hidden md:block text-sm bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all">
                    {t.viewPage}
                </button>
                <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="text-zinc-500 hover:text-white">
                    <LogOut size={20} />
                </button>
            </div>
        </header>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {[
                { id: 'inbox', icon: MessageSquare, label: t.tabs.inbox },
                { id: 'forms', icon: BarChart2, label: t.tabs.forms },
                { id: 'profile', icon: Settings, label: t.tabs.profile }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-lg ${activeTab === tab.id ? 'bg-white text-black scale-105' : 'bg-zinc-900 text-zinc-500'}`}
                >
                    <tab.icon size={18}/> {tab.label}
                </button>
            ))}
        </div>

        {activeTab === 'inbox' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {messages.length === 0 ? (
                    <div className="col-span-full text-center text-zinc-600 mt-20">{t.inbox.empty}</div>
                ) : (
                    messages.map((msg) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            key={msg.id} 
                            className="bg-zinc-900/50 border border-white/5 p-5 rounded-2xl hover:border-pink-500/20 transition-colors"
                        >
                            <p className="text-xl font-medium mb-6 leading-relaxed">"{msg.content}"</p>
                            {revealedMsg === msg.id ? (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-black/50 p-4 rounded-xl text-sm space-y-2 overflow-hidden border border-pink-500/30">
                                    <div className="flex items-center gap-2 text-pink-400 font-bold"><MapPin size={14}/> {msg.location_info || t.inbox.unknownLoc}</div>
                                    <div className="flex items-center gap-2 text-purple-400"><Smartphone size={14}/> {msg.device_info || t.inbox.unknownDev}</div>
                                    <div className="text-zinc-600 text-xs mt-2 border-t border-white/5 pt-2">IP: {msg.ip_address}</div>
                                </motion.div>
                            ) : (
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-zinc-600">{new Date(msg.created_at).toLocaleDateString()}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => window.open(`/api/og?text=${encodeURIComponent(msg.content)}`, '_blank')} className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white">
                                            <Share2 size={14}/>
                                        </button>
                                        <button 
                                            onClick={() => setRevealedMsg(msg.id)}
                                            className="text-xs font-bold bg-pink-500/10 text-pink-500 px-3 py-1 rounded-lg border border-pink-500/20 hover:bg-pink-500 hover:text-white transition-colors"
                                        >
                                            {t.inbox.whoSent}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        )}

        {activeTab === 'forms' && (
            <div className="space-y-8 max-w-2xl mx-auto">
                <div className="bg-zinc-900 p-6 rounded-3xl border border-white/10 shadow-xl">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-lg"><Plus size={20} className="text-green-400"/> {t.forms.createTitle}</h3>
                    <input 
                        className="w-full bg-black border border-zinc-700 p-4 rounded-xl mb-3 text-white focus:border-green-500 outline-none transition-colors" 
                        placeholder={t.forms.placeholderTitle} 
                        value={newPollTitle} 
                        onChange={e => setNewPollTitle(e.target.value)} 
                    />
                    <div className="flex gap-2 mb-4">
                        {newPollOptions.map((opt, i) => (
                            <input key={i} className="flex-1 bg-black border border-zinc-700 p-3 rounded-xl text-center focus:border-white outline-none" value={opt} onChange={e => {
                                const newOpts = [...newPollOptions]; newOpts[i] = e.target.value; setNewPollOptions(newOpts);
                            }}/>
                        ))}
                    </div>
                    <button onClick={createPoll} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg">
                        {t.forms.launch}
                    </button>
                </div>
                <div className="space-y-4">
                    {polls.map(poll => (
                        <div key={poll.id} className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-lg mb-1">{poll.title}</h4>
                                <div className="text-xs text-green-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> {t.forms.active}</div>
                            </div>
                            <div className="flex gap-1">
                                {JSON.parse(poll.options).map((opt:string) => (
                                    <span key={opt} className="bg-white/5 px-3 py-1 rounded-lg text-xs text-zinc-400">{opt}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'profile' && (
            <div className="space-y-6 max-w-xl mx-auto">
                <div className="bg-zinc-900 p-8 rounded-[2rem] flex items-center gap-6 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-pink-600/20 blur-[60px] rounded-full pointer-events-none"/>
                    
                    {/* 頭像與進度條區塊 */}
                    <div className="relative w-24 h-24 flex-shrink-0 group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
                        <div className="w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-indigo-500">
                            <img 
                                src={user?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${user.username}`} 
                                className={`w-full h-full rounded-full object-cover bg-black transition-opacity ${isUploading ? 'opacity-30' : ''}`} 
                            />
                        </div>
                        
                        {/* 上傳中的遮罩與進度 */}
                        {isUploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full z-10">
                                <Loader2 className="animate-spin text-white w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold text-white">{uploadProgress}%</span>
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload size={20}/>
                            </div>
                        )}
                        
                        {/* 上傳成功的勾勾 */}
                        {uploadProgress === 100 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/80 rounded-full z-20">
                                <Check className="text-white w-8 h-8" />
                            </div>
                        )}
                    </div>
                    
                    <input type="file" ref={fileInputRef} hidden onChange={handleAvatarUpload} disabled={isUploading} />
                    
                    <div className="z-10 flex-1">
                        <h2 className="text-2xl font-bold mb-1">@{user.username}</h2>
                        {user.username === 'admin' ? (
                            <div className="inline-flex items-center gap-1 bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded-md border border-red-500/30">
                                <ShieldAlert size={12}/> {t.profile.adminType}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500">{t.profile.userType}</p>
                        )}
                        
                        {/* 文字進度提示 */}
                        {isUploading && <p className="text-xs text-pink-500 mt-2 animate-pulse">Compressing & Uploading...</p>}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pink-900/20 to-indigo-900/20 p-6 rounded-[2rem] border border-pink-500/20">
                    <h3 className="font-bold text-pink-300 mb-4 flex items-center gap-2"><Share2 size={18}/> {t.profile.promote}</h3>
                    <div className="flex gap-2 mb-4">
                        <code className="flex-1 bg-black/40 p-4 rounded-xl text-pink-400 font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap border border-white/5">
                            {window.location.origin}/{user.username}
                        </code>
                        <button onClick={copyLink} className="bg-white/10 px-4 rounded-xl hover:bg-white/20 transition-colors min-w-[60px]">
                            {copied ? t.profile.copied : t.profile.copy}
                        </button>
                    </div>
                    <AnimatePresence>
                        {previewUrl && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-4 overflow-hidden"
                            >
                                <div className="bg-black/40 p-2 rounded-xl border border-white/10">
                                    <div className="flex justify-between items-center mb-2 px-2">
                                        <span className="text-xs text-zinc-400">{t.profile.previewTitle}</span>
                                        <button onClick={() => setPreviewUrl(null)} className="text-zinc-500 hover:text-white"><X size={14}/></button>
                                    </div>
                                    <img src={previewUrl} className="w-full rounded-lg shadow-lg" alt="Promo Preview" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {previewUrl ? (
                         <div className="grid grid-cols-2 gap-3">
                             <button onClick={handleNativeShare} className="py-4 bg-pink-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-pink-500 transition-colors">
                                <Share2 size={16}/> {t.profile.shareTitle}
                             </button>
                             <a href={previewUrl} download="velvet-promo.png" className="py-4 bg-white/10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
                                <Download size={16}/> {t.inbox.saveImg}
                             </a>
                         </div>
                    ) : (
                        <button onClick={handleGeneratePreview} className="w-full py-5 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-xl font-bold text-lg flex flex-col items-center justify-center gap-1 shadow-lg shadow-pink-900/30 hover:scale-[1.02] transition-transform">
                            {t.profile.previewBtn}
                        </button>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}