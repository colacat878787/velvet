import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. 初始化超級管理員客戶端
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 使用最高權限鑰匙
  );

  // 2. 獲取所有使用者列表 (包含 Email)
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3. 為了方便顯示，我們把 profiles 的資料也抓出來合併 (Optional)
  // 這裡簡單回傳 users 就好，前端會用 id 去對應
  return NextResponse.json({ users });
}