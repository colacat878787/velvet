'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Map, Search, Eye, KeyRound, ShieldAlert, Check } from 'lucide-react';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 重設密碼相關狀態
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const init = async () => {
        // 1. 驗證是否為 admin
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.username !== 'admin') {
            router.push('/');
            return;
        }
        
        // 2. 呼叫我們剛寫的超級 API 獲取用戶列表 (含 Email)
        const res = await fetch('/api/admin/get-users');
        const { users: authUsers } = await res.json();

        // 3. 獲取 Profile 資料 (為了顯示頭像和暱稱)
        const { data: profiles } = await supabase.from('profiles').select('*');

        // 4. 合併資料
        const combined = authUsers.map((u: any) => {
            const profile = profiles?.find(p => p.id === u.id);
            return { ...u, ...profile };
        });

        setUsers(combined);
        setLoading(false);
    };
    init();
  }, [router]);

  // 強制重設密碼功能
  const handleResetPassword = async (userId: string) => {
      if(!newPassword.trim()) return;
      
      const res = await fetch('/api/admin/reset-password', {
          method: 'POST',
          body: JSON.stringify({ userId, newPassword })
      });

      if(res.ok) {
          alert(`密碼已強制更改為: ${newPassword}`);
          setEditingUser(null);
          setNewPassword('');
      } else {
          alert('重設失敗');
      }
  };

  const filteredUsers = users.filter(u => 
      u.username?.includes(search) || u.email?.includes(search)
  );

  if (loading) return <div className="bg-black text-red-500 h-screen flex items-center justify-center font-mono text-2xl animate-pulse">VERIFYING GOD CREDENTIALS...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-4xl font-black text-red-500 mb-8 border-b border-red-900 pb-4 flex items-center gap-4">
            <ShieldAlert /> GOD MODE DASHBOARD
        </h1>

        <div className="flex gap-4 mb-8">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-red-900/30 flex-1">
                <div className="text-4xl font-bold">{users.length}</div>
                <div className="text-zinc-500">Total Victims (Users)</div>
            </div>
            <div className="bg-zinc-900 p-6 rounded-2xl border border-red-900/30 flex-[2] flex items-center">
                <Search className="text-zinc-500 ml-4" />
                <input 
                    className="bg-transparent border-none outline-none text-xl ml-4 w-full text-white" 
                    placeholder="Search username or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map(user => (
                <div key={user.id} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-red-500 transition-colors relative overflow-hidden">
                    <div className="flex items-start gap-4 mb-4">
                        <img src={user.avatar_url || 'https://via.placeholder.com/50'} className="w-16 h-16 rounded-full bg-black object-cover" />
                        <div className="flex-1 overflow-hidden">
                            <div className="font-bold text-xl text-white">@{user.username}</div>
                            <div className="text-sm text-red-400 font-mono mb-1">{user.email}</div>
                            <div className="text-xs text-zinc-600">ID: {user.id}</div>
                            <div className="text-xs text-zinc-600">Created: {new Date(user.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* 控制按鈕區 */}
                    <div className="flex gap-2 border-t border-white/5 pt-4">
                        <button onClick={() => window.open(`/${user.username}`, '_blank')} className="flex-1 bg-white/5 py-2 rounded text-xs hover:bg-white/10 flex items-center justify-center gap-2">
                            <Eye size={14}/> View Page
                        </button>
                        
                        {editingUser === user.id ? (
                            <div className="flex-1 flex gap-2">
                                <input 
                                    className="w-full bg-black border border-red-500 text-red-500 text-xs px-2 rounded"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                                <button onClick={() => handleResetPassword(user.id)} className="bg-red-600 px-3 rounded hover:bg-red-500">
                                    <Check size={14}/>
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setEditingUser(user.id)} className="flex-1 bg-red-900/20 text-red-500 py-2 rounded text-xs hover:bg-red-900/40 flex items-center justify-center gap-2 border border-red-900/50">
                                <KeyRound size={14}/> Force Reset Pass
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}