import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // 取得參數
  const username = searchParams.get('username');
  const text = searchParams.get('text');
  
  // 設定網址常數
  const SITE_URL = 'velvetapp.vercel.app';

  // 判斷模式
  // 模式 A: 個人宣傳 (傳入 username) -> 強制顯示 Ask me anything
  if (username) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'linear-gradient(to bottom right, #db2777, #7c3aed)',
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* 白框卡片 */}
          <div
              style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '40px',
                  padding: '50px',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  width: '90%',
                  minHeight: '40%',
              }}
          >
            {/* 強制固定的標題 (防止被亂改) */}
            <div style={{ fontSize: 30, color: '#ec4899', fontWeight: 'bold', marginBottom: 20 }}>
                ASK ME ANYTHING
            </div>
            
            {/* 使用者名稱 */}
            <div style={{ fontSize: 60, color: '#000', fontWeight: 'bold', wordBreak: 'break-all' }}>
                @{username}
            </div>
          </div>

          {/* 底部網址 */}
          <div style={{ marginTop: 60, color: 'white', fontSize: 32, fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {SITE_URL}
          </div>
        </div>
      ),
      { width: 1080, height: 1920 }
    );
  }

  // 模式 B: 訊息分享 (傳入 text) -> 顯示引號內容
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(to bottom right, #000000, #4338ca)', // 訊息用深色背景區分
          padding: '40px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
            style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '4px solid rgba(255,255,255,0.2)',
                borderRadius: '40px',
                padding: '60px',
                boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: 48, // 字體稍微小一點以容納長訊息
                color: '#fff',
                width: '90%',
                minHeight: '40%',
                lineHeight: 1.4,
            }}
        >
          "{text || 'Secret Message'}"
        </div>
        <div style={{ marginTop: 60, color: 'rgba(255,255,255,0.5)', fontSize: 32, fontWeight: 'bold', letterSpacing: '2px' }}>
            {SITE_URL}
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}