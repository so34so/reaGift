// src/hooks/useDeviceMode.js
import { isMobile as realIsMobile } from 'react-device-detect';

export function useDeviceMode() {
  // Vite SPA라서 서버 렌더링은 거의 없겠지만 안전빵
  if (typeof window === 'undefined') {
    return { isMobile: realIsMobile, override: null };
  }

  const params = new URLSearchParams(window.location.search);
  const override = params.get('device'); // 'mobile' | 'desktop' | null

  let isMobile = realIsMobile;

  if (override === 'mobile') {
    isMobile = true;
  } else if (override === 'desktop') {
    isMobile = false;
  }

  return { isMobile, override };
}
