import { useMemo } from 'react';

// 간단한 결정적(고정) 셔플: 리렌더링해도 배치가 크게 흔들리지 않게
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleDeterministic(arr, seed = 12345) {
  const a = [...arr];
  const rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MobileBgMosaicMarquee({
  items = [],          // [{id, url}, ...]
  cols = 3,
  rows = 6,
  gapPx = 8,
  durationSec = 22,
  direction = 'ltr',   // 'ltr' | 'rtl'
  seed = 12345,
  maxUnique = 30,      // 너무 많이 쓰면 첫 진입에서 네트워크 부담
}) {
  const panels = useMemo(() => {
    // 1) id 기준으로 정렬 -> url 뽑기
    const sorted = [...items]
      .filter((x) => x && x.url)
      .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    // 2) "서로 다른 사진" 우선: url 중복 제거
    const uniqueUrls = [];
    const seen = new Set();
    for (const it of sorted) {
      if (!seen.has(it.url)) {
        seen.add(it.url);
        uniqueUrls.push(it.url);
      }
      if (uniqueUrls.length >= maxUnique) break;
    }

    // 이미지가 너무 적으면 반복될 수밖에 없음
    const base = shuffleDeterministic(uniqueUrls, seed);
    const tilesPerPanel = cols * rows;
    const panelCount = 6; // 화면이 흐를 때 “반복 티” 줄이려면 4~8 권장

    const makePanel = (offset) => {
      const out = [];
      for (let i = 0; i < tilesPerPanel; i++) {
        out.push(base[(offset + i) % base.length]);
      }
      return out;
    };

    const p = [];
    for (let k = 0; k < panelCount; k++) {
      p.push(makePanel(k * tilesPerPanel));
    }
    return p;
  }, [items, cols, rows, seed, maxUnique]);

  // 2배로 붙여서 무한루프(끊김 없음)
  const loopPanels = useMemo(() => [...panels, ...panels], [panels]);

  return (
    <div
      className={`m-mosaic ${direction === 'ltr' ? 'is-ltr' : 'is-rtl'}`}
      style={{
        ['--duration']: `${durationSec}s`,
        ['--cols']: cols,
        ['--rows']: rows,
        ['--gap']: `${gapPx}px`,
      }}
      aria-hidden="true"
    >
      <div className="m-mosaic__track">
        {loopPanels.map((panelUrls, pi) => (
          <div className="m-mosaic__panel" key={pi}>
            {panelUrls.map((url, ti) => (
              <div
                key={`${pi}-${ti}`}
                className="m-mosaic__tile"
                style={{ backgroundImage: `url(${url})` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
