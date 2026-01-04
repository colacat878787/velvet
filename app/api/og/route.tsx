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

    // 初始化 Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. 下載字體 (Google Fonts Inter)
    const fontTask = fetch(
      new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer()).catch(() => null);

    // 2. 智能頭像獲取 (Supabase + 1.5秒超時防護)
    let avatarBuffer: ArrayBuffer | null = null;
    
    if (username) {
        const fetchAvatar = async () => {
            try {
                // A. 查資料庫看有沒有自訂頭像
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('username', username)
                    .single();

                // B. 決定圖片網址 (自訂 > 預設)
                let url = `https://api.dicebear.com/7.x/shapes/png?seed=${username}&size=200`;
                if (profile?.avatar_url) url = profile.avatar_url;

                const res = await fetch(url);
                if (res.ok) return await res.arrayBuffer();
            } catch (e) { return null; }
            return null;
        };

        // 競速機制：1.5秒沒抓到圖就放棄，避免卡死
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
        avatarBuffer = await Promise.race([fetchAvatar(), timeoutPromise]);
    }

    const fontData = await fontTask;

    const options: any = { width: 1080, height: 1920 };
    if (fontData) {
      options.fonts = [{ name: 'Inter', data: fontData, style: 'normal', weight: 700 }];
    }
    const fontFamily = fontData ? '"Inter"' : 'sans-serif';

    // 🌟 恢復奢華背景設定 (網格 + 星雲)
    const backgroundStyle = {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#050505',
      // 這是我們之前修好的無錯字版本網格背景
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
      backgroundSize: '50px 50px',
      fontFamily: fontFamily,
      padding: '60px',
    };

    // 🌟 恢復玻璃卡片樣式
    const cardStyle = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(20, 20, 20, 0.9)', 
      border: '2px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '60px',
      padding: '80px',
      boxShadow: '0 0 100px rgba(236, 72, 153, 0.2)', // 粉色光暈陰影
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
            {/* 背景星雲裝飾光暈 */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', background: 'radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)' }} />

            {/* Logo */}
            <div style={{ display: 'flex', position: 'absolute', top: 80, fontSize: 40, color: 'rgba(255,255,255,0.3)', letterSpacing: '8px', fontWeight: 'bold' }}>
              VELVET
            </div>

            <div style={cardStyle}>
              {/* 頭像後面的光 */}
              <div style={{ display: 'flex', position: 'absolute', top: '-80px', width: '260px', height: '260px', background: 'rgba(236, 72, 153, 0.6)', borderRadius: '100%', filter: 'blur(60px)', opacity: 0.6 }} />
              
              {/* 頭像 */}
              {avatarBuffer ? (
                  // @ts-ignore
                  <img 
                    src={avatarBuffer as any} 
                    width="200" 
                    height="200" 
                    style={{ borderRadius: '100%', border: '6px solid #000', marginBottom: 40, backgroundColor: '#111', objectFit: 'cover' }} 
                  />
              ) : (
                  <div style={{ 
                      width: 200, height: 200, borderRadius: '100%', border: '6px solid #000', marginBottom: 40, 
                      background: 'linear-gradient(to bottom right, #db2777, #7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: 'white' 
                  }}>
                      {username.slice(0, 1).toUpperCase()}
                  </div>
              )}

              <div style={{ display: 'flex', fontSize: 32, color: '#ec4899', letterSpacing: '4px', fontWeight: 'bold', marginBottom: 20, textTransform: 'uppercase' }}>
                SEND ME ANONYMOUS
              </div>
              
              <div style={{ display: 'flex', fontSize: 72, color: '#fff', fontWeight: 'bold', wordBreak: 'break-all', textShadow: '0 0 40px rgba(255,255,255,0.5)' }}>
                @{username}
              </div>

              <div style={{ display: 'flex', marginTop: 40, color: 'rgba(255,255,255,0.4)', fontSize: 28 }}>
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
           {/* 背景星雲裝飾光暈 (紫色版) */}
           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', background: 'radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.3) 0%, transparent 50%)' }} />

           <div style={{ display: 'flex', position: 'absolute', top: 80, fontSize: 40, color: 'rgba(255,255,255,0.3)', letterSpacing: '8px', fontWeight: 'bold' }}>
              VELVET
            </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', position: 'absolute', top: -50, left: 60, fontSize: 160, color: 'rgba(124, 58, 237, 0.5)', fontFamily: 'serif' }}>“</div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 56,
                    color: '#fff',
                    lineHeight: 1.4,
                    textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                }}
            >
              {text || 'Secret Message'}
            </div>

             <div style={{ display: 'flex', position: 'absolute', bottom: -120, right: 60, fontSize: 160, color: 'rgba(236, 72, 153, 0.5)', fontFamily: 'serif', transform: 'rotate(180deg)' }}>“</div>
          </div>

          <div style={{ display: 'flex', marginTop: 80, color: 'rgba(255,255,255,0.5)', fontSize: 32, fontWeight: 'bold', letterSpacing: '2px' }}>
              {SITE_URL}
          </div>
        </div>
      ),
      options
    );

  } catch (e: any) {
    console.log(e.message);
    // 錯誤時回傳黑底紅字，方便除錯，且不讓頁面崩潰
    return new ImageResponse(
        (
            <div style={{ display: 'flex', width: '100%', height: '100%', background: 'black', alignItems: 'center', justifyContent: 'center', color: 'red', fontSize: 40 }}>
                Image System Error
            </div>
        ),
        { width: 1080, height: 1920 }
    );
  }
}