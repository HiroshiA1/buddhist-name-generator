'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (loading) {
    return (
      <html lang="ja">
        <body className="bg-[#faf8f4] text-[#1f2937]">
          <div className="min-h-screen flex items-center justify-center">
            <div>読み込み中...</div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="ja">
      <body className="bg-[#faf8f4] text-[#1f2937]">
        {!isAuthPage && (
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <h1 className="text-xl font-bold text-[#1e3a8a]">法名ジェネレーター</h1>
                <div className="flex items-center space-x-4">
                  <Link href="/" className="nav-link">ホーム</Link>
                  {user ? (
                    <>
                      <Link href="/generate" className="nav-link">法名生成</Link>
                      <Link href="/mypage" className="nav-link">マイページ</Link>
                      <button onClick={handleLogout} className="nav-link">ログアウト</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="nav-link">ログイン</Link>
                      <Link href="/register" className="nav-link">会員登録</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
        )}
        {children}
      </body>
    </html>
  );
}