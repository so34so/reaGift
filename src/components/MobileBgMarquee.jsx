import { useMemo } from 'react';

export default function MobileBgMarquee({
  urls = [],
  durationSec = 18,   // 느리게 흐를수록 영상 느낌
  direction = 'ltr',  // 'ltr' | 'rtl'
  itemWidthVw = 72,   // 한 장이 차지하는 가로폭(뷰포트 기준)
}) {
  const cleanUrls = useMemo(() => {
    const u = Array.from(new Set(urls.filter(Boolean)));
    // 끊김/반복 티 최소화를 위해 너무 많지 않게(권장 6~12)
    return u.slice(0, 12);
  }, [urls]);

  // 무한루프 위해 2배로 붙임
  const loopUrls = useMemo(() => {
    if (cleanUrls.length === 0) return [];
    return [...cleanUrls, ...cleanUrls];
  }, [cleanUrls]);

  return (
    <div
      className={`m-marquee ${direction === 'ltr' ? 'is-ltr' : 'is-rtl'}`}
      style={{
        ['--duration']: `${durationSec}s`,
        ['--itemW']: `${itemWidthVw}vw`,
      }}
      aria-hidden="true"
    >
      <div className="m-marquee__track">
        {loopUrls.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="m-marquee__item"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
    </div>
  );
}
