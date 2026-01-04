/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const text = searchParams.get('text');
    const SITE_URL = 'velvetapp.vercel.app';

    // 初始化 Supabase (為了去查用戶真正的頭像)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. 下載字體
    let fontData: ArrayBuffer | null = null;
    try {
      const response = await fetch(
        new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf', import.meta.url)
      );
      if (response.ok) fontData = await response.arrayBuffer();
    } catch (e) {
      console.log('Font load failed');
    }

    // 2. 獲取頭像 (這是這次修改的重點)
    let avatarBuffer: ArrayBuffer | null = null;
    
    if (username) {
        try {
            // A. 先去資料庫查這個人真正的 avatar_url
            const { data: profile } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('username', username)
                .single();

            // B. 如果有自訂頭像，嘗試下載
            if (profile?.avatar_url) {
                const customAvatarRes = await fetch(profile.avatar_url);
                if (customAvatarRes.ok) {
                    avatarBuffer = await customAvatarRes.arrayBuffer();
                }
            }

            // C. 如果上面失敗了 (或是沒設定頭像)，才用預設的 DiceBear
            if (!avatarBuffer) {
                const defaultRes = await fetch(`https://api.dicebear.com/7.x/shapes/png?seed=${username}&size=200`);
                if (defaultRes.ok) {
                    avatarBuffer = await defaultRes.arrayBuffer();
                }
            }
        } catch (e) {
            console.log('Avatar fetch logic failed');
        }
    }

    const options: any = { width: 1080, height: 1920 };
    if (fontData) {
      options.fonts = [{ name: 'Inter', data: fontData, style: 'normal', weight: 700 }];
    }

    const fontFamily = fontData ? '"Inter"' : 'sans-serif';

    // 背景設定
    const backgroundStyle = {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#050505',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #ec4899 0%, transparent 60%), radial-gradient(circle at 80% 80%, #7c3aed 0%, transparent 50%)',
      fontFamily: fontFamily,
      padding: '60px',
    };

    // 卡片樣式
    const cardStyle = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1a1a', 
      border: '2px solid #333',
      borderRadius: '60px',
      padding: '80px',
      boxShadow: '0 0 100px rgba(236, 72, 153, 0.2)',
      textAlign: 'center' as const,
      width: '100%',
      minHeight: '50%',
      position: 'relative' as const,
    };

    // 💎 模式 A: 個人宣傳卡
    if (username) {
      return new ImageResponse(
        (
          <div style={backgroundStyle}>
            <div style={{ display: 'flex', position: 'absolute', top: 80, fontSize: 40, color: '#666', letterSpacing: '8px', fontWeight: 'bold' }}>
              VELVET
            </div>

            <div style={cardStyle}>
              {/* 頭像後面的光 */}
              <div style={{ display: 'flex', position: 'absolute', top: '-80px', width: '260px', height: '260px', background: 'rgba(236, 72, 153, 0.6)', borderRadius: '100%', filter: 'blur(60px)', opacity: 0.6 }} />
              
              {/* 頭像顯示 */}
              {avatarBuffer ? (
                  // @ts-ignore
                  <img 
                    src={avatarBuffer as any} 
                    width="200" 
                    height="200" 
                    style={{ borderRadius: '100%', border: '6px solid #000', marginBottom: 40, backgroundColor: '#111', objectFit: 'cover' }} 
                  />
              ) : (
                  // 萬一真的連預設圖都抓不到的備案
                  <div style={{ 
                      width: 200, height: 200, borderRadius: '100%', border: '6px solid #000', marginBottom: 40, 
                      background: '#333',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: 'white' 
                  }}>
                      {username.slice(0, 1).toUpperCase()}
                  </div>
              )}

              <div style={{ display: 'flex', fontSize: 32, color: '#ec4899', letterSpacing: '4px', fontWeight: 'bold', marginBottom: 20, textTransform: 'uppercase' }}>
                SEND ME ANONYMOUS
              </div>
              
              <div style={{ display: 'flex', fontSize: 72, color: '#fff', fontWeight: 'bold', wordBreak: 'break-all' }}>
                @{username}
              </div>

              <div style={{ display: 'flex', marginTop: 40, color: '#888', fontSize: 28 }}>
                I won't know it's you. 🤫
              </div>
            </div>

            <div style={{ display: 'flex', marginTop: 80, color: '#fff', fontSize: 36, fontWeight: 'bold', letterSpacing: '4px', textTransform: 'uppercase', background: '#ec4899', padding: '10px 40px', borderRadius: '100px' }}>
                {SITE_URL}
            </div>
          </div>
        ),
        options
      );
    }

    // 💬 模式 B: 訊息分享卡
    return new ImageResponse(
      (
        <div style={backgroundStyle}>
           <div style={{ display: 'flex', position: 'absolute', top: 80, fontSize: 40, color: '#666', letterSpacing: '8px', fontWeight: 'bold' }}>
              VELVET
            </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', position: 'absolute', top: -50, left: 60, fontSize: 160, color: '#7c3aed', fontFamily: 'serif', opacity: 0.5 }}>“</div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 56,
                    color: '#fff',
                    lineHeight: 1.4,
                }}
            >
              {text || 'Secret Message'}
            </div>

             <div style={{ display: 'flex', position: 'absolute', bottom: -120, right: 60, fontSize: 160, color: '#ec4899', fontFamily: 'serif', transform: 'rotate(180deg)', opacity: 0.5 }}>“</div>
          </div>

          <div style={{ display: 'flex', marginTop: 80, color: '#888', fontSize: 32, fontWeight: 'bold', letterSpacing: '2px' }}>
              {SITE_URL}
          </div>
        </div>
      ),
      options
    );

  } catch (e: any) {
    console.log(e.message);
    return new ImageResponse(
        (
            <div style={{ display: 'flex', width: '100%', height: '100%', background: 'black', alignItems: 'center', justifyContent: 'center', color: 'red', fontSize: 40 }}>
                System Error
            </div>
        ),
        { width: 1080, height: 1920 }
    );
  }
}