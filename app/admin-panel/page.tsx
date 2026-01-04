'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Map, Users, Search, Eye } from 'lucide-react';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        // 嚴格檢查：只有 username 是 admin 的人可以進來
        if (user?.user_metadata?.username !== 'admin') {
            alert('ACCESS DENIED: GOD MODE ONLY');
            router.push('/');
            return;
        }
        
        // 獲取所有用戶 (包含 message 數量)
        const { data } = await supabase.from('profiles').select('*, messages(count)');
        setUsers(data || []);
        setLoading(false);
    };
    checkAdmin();
  }, [router]);

  const filteredUsers = users.filter(u => u.username.includes(search));

  if (loading) return <div className="bg-black text-red-500 h-screen flex items-center justify-center font-mono text-2xl animate-pulse">VERIFYING GOD CREDENTIALS...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-4xl font-black text-red-500 mb-8 border-b border-red-900 pb-4 flex items-center gap-4">
            <Map /> GOD MODE DASHBOARD
        </h1>

        <div className="flex gap-4 mb-8">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-red-900/30 flex-1">
                <div className="text-4xl font-bold">{users.length}</div>
                <div className="text-zinc-500">Total Users</div>
            </div>
            <div className="bg-zinc-900 p-6 rounded-2xl border border-red-900/30 flex-[2] flex items-center">
                <Search className="text-zinc-500 ml-4" />
                <input 
                    className="bg-transparent border-none outline-none text-xl ml-4 w-full" 
                    placeholder="Search any user..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(user => (
                <div key={user.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-red-500 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                        <img src={user.avatar_url || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-full" />
                        <div>
                            <div className="font-bold">@{user.username}</div>
                            <div className="text-xs text-zinc-500">{user.full_name}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        <div className="bg-black p-2 rounded">ID: {user.id.slice(0,8)}...</div>
                        <div className="bg-black p-2 rounded">Msgs: {user.messages[0].count}</div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => window.open(`/${user.username}`, '_blank')} className="flex-1 bg-white/10 py-2 rounded text-xs hover:bg-white/20">View Page</button>
                        {/* 這裡未來可以做「偷看 Inbox」的功能，原理是一樣的 */}
                        <button className="flex-1 bg-red-900/30 text-red-500 py-2 rounded text-xs hover:bg-red-900/50 flex items-center justify-center gap-1">
                            <Eye size={12}/> Spy Inbox
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}