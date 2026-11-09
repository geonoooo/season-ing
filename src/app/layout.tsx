import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@/b_app/styles/globals.css";

export const metadata: Metadata = {
  title: "겨울 맛집 지도",
  description: "방어, 붕어빵, 계란빵 등 겨울 제철 음식 지도",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="bg-ground text-ink break-keep">
        <div className="mx-auto h-dvh w-full max-w-app bg-white">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
