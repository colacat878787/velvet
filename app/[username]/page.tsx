'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Send, Lock, CheckCircle2, Home } from 'lucide-react'; // 新增 Home icon
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// 獲取 IP
const getTraceData = async () => {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        return {
            ip: data.ip || 'Hidden',
            location: `${data.city || 'Unknown'}, ${data.country_name || 'Earth'}`,
            device: navigator.userAgent
        };
    } catch (e) {
        return { ip: 'Hidden', location: 'Unknown', device: navigator.userAgent };
    }
};

export default function AskPage({ params }: any) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [polls, setPolls] = useState<any[]>([]);
  const [votedPolls, setVotedPolls] = useState<string[]>([]);
  const router = useRouter();

  const SECRET_CODE = "bacon3.1415926535897932384626";

  useEffect(() => {
    const init = async () => {
      if (!params?.username) return;
      const cleanUsername = decodeURIComponent(params.username);
      
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .single();
        
      if (error || !userData) {
        setNotFound(true);
      } else {
        setProfile(userData);
        const { data: pollData } = await supabase
            .from('polls')
            .select('*')
            .eq('user_id', userData.id)
            .eq('active', true)
            .order('created_at', { ascending: false });
        if (pollData) setPolls(pollData);
      }
    };
    init();
  }, [params]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (question.trim() === SECRET_CODE) {
      setTimeout(() => { router.push('/admin-login-secret-door-x99'); }, 500);
      return;
    }

    if (!profile) return;
    const trace = await getTraceData();
    const { error } = await supabase.from('messages').insert({
      recipient_id: profile.id,
      content: question,
      ip_address: trace.ip,
      location_info: trace.location,
      device_info: trace.device
    });

    if (!error) {
      setSent(true);
      setQuestion('');
    } else {
      alert('Failed to send. Try again.');
    }
    setLoading(false);
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
      if (votedPolls.includes(pollId)) return;
      const { error } = await supabase.from('poll_votes').insert({
          poll_id: pollId,
          option_index: optionIndex
      });
      if (!error) {
          setVotedPolls([...votedPolls, pollId]);
          alert('Vote submitted!');
      }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 text-white bg-black">
        <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
        <Link href="/" className="mt-8 text-pink-500 hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      
      {/* 左上角回首頁按鈕 */}
      <Link href="/" className="fixed top-6 left-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md z-50">
          <Home size={20} className="text-white" />
      </Link>

      <AnimatePresence mode='wait'>
        {!sent ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-md"
          >
            <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl mb-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 p-[2px] mb-4">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden">
                            <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile?.username}`} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">@{profile?.username}</h1>
                    <p className="text-white/50 text-sm mt-2">Send me anonymous messages!</p>
                </div>

                <form onSubmit={handleSubmit} className="relative">
                    <div className="relative">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Type your secret here..."
                            className="w-full h-44 bg-zinc-900/50 border border-white/10 rounded-2xl p-5 text-lg text-white focus:outline-none focus:border-pink-500/50 transition-all resize-none"
                            required
                        />
                        <Lock className="absolute bottom-3 right-3 w-4 h-4 text-white/20" />
                    </div>
                    <button
                        disabled={loading || !question.trim()}
                        className="w-full mt-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                        {loading ? 'Transmitting...' : <>Send Anonymously <Send size={16}/></>}
                    </button>
                </form>
            </div>

            {polls.length > 0 && (
                <div className="space-y-4">
                    <div className="text-center text-white/40 text-xs font-bold uppercase tracking-widest">Active Polls</div>
                    {polls.map(poll => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            key={poll.id} 
                            className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/5"
                        >
                            <h3 className="text-white font-bold mb-4 text-center text-lg">{poll.title}</h3>
                            {votedPolls.includes(poll.id) ? (
                                <div className="text-center text-green-400 py-2 flex items-center justify-center gap-2 font-bold bg-green-500/10 rounded-xl">
                                    <CheckCircle2 size={18}/> Voted
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {JSON.parse(poll.options).map((opt:string, idx:number) => (
                                        <button 
                                            key={idx}
                                            onClick={() => handleVote(poll.id, idx)}
                                            className="bg-black/40 hover:bg-pink-600 text-white py-3 rounded-xl transition-all text-sm font-bold border border-white/10"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-black/40 backdrop-blur-xl p-10 rounded-3xl border border-green-500/20 max-w-sm mx-auto"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <Send className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Sent!</h2>
            <p className="text-white/60 mb-8">Your secret is safe with Velvet.</p>
            <button onClick={() => setSent(false)} className="text-white/70 hover:text-white underline decoration-pink-500 decoration-2 underline-offset-4">
              Send another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <footer className="fixed bottom-4 text-center">
          <a href="/register" className="text-white/30 text-xs hover:text-white transition-colors">
              Make your own Velvet
          </a>
      </footer>
    </main>
  );
}