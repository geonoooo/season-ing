"use client";

import type { ReactNode } from "react";
import { useKakaoLoader } from "react-kakao-maps-sdk";

interface KakaoMapGateProps {
  children: ReactNode;
}

const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? "";

const MapNotice = ({ message }: { message: string }) => (
  <p className="flex size-full items-center justify-center p-6 text-center text-label text-muted">
    {message}
  </p>
);

const KakaoMapLoader = ({ children }: KakaoMapGateProps) => {
  const [isLoading, error] = useKakaoLoader({ appkey: KAKAO_MAP_KEY, libraries: ["services"] });

  if (error) return <MapNotice message="카카오 지도를 불러오지 못했어요" />;
  if (isLoading) return null;
  return children;
};

export const KakaoMapGate = ({ children }: KakaoMapGateProps) =>
  KAKAO_MAP_KEY ? (
    <KakaoMapLoader>{children}</KakaoMapLoader>
  ) : (
    <MapNotice message="카카오 지도 키(NEXT_PUBLIC_KAKAO_MAP_KEY)가 설정되지 않았어요" />
  );
