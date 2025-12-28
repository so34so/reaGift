// src/components/MobileDragMentBoard.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import { exampleMentList } from '../mentList';
import './MobileDragMentBoard.css';

const BACKGROUND_URL =
  'https://res.cloudinary.com/dkzferide/image/upload/v1765019299/G7aU1pYbQAAzTpZ_p9l82u.jpg';

// ✅ 원본 이미지 크기(고정)
const IMG_W = 2048;
const IMG_H = 1366;
const IMG_RATIO = IMG_W / IMG_H;

// ✅ 보드를 더 “넓게 탐색”하고 싶으면 1.15~1.35 사이로 올리면 됨
const ZOOM = 1.20;

// 노트 최대 폭(= CSS max-width와 일치)
const NOTE_MAX_W = 210; // px
const EDGE_PAD = 10;    // px

// 겹침 판정 시 여유(클수록 더 띄워짐)
const COLLISION_PAD = 10; // px

// 줄간격(= CSS line-height와 맞추는 게 좋음)
const LINE_HEIGHT = 1.35;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * 텍스트를 NOTE_MAX_W 안에서 줄바꿈 했다고 가정하고
 * 캔버스 measureText로 line 구성 → (w,h) 추정
 * - 한국어/띄어쓰기 없는 문자열도 대응하도록 "문자 단위" 폴백 포함
 */
function measureTextBlock(ctx, text, fontSizePx, maxWidthPx) {
  // 폰트 패밀리는 CSS와 최대한 맞추는 편이 정확합니다.
  ctx.font = `${fontSizePx}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

  const raw = String(text ?? '').trim();
  if (!raw) {
    return { w: 0, h: fontSizePx * LINE_HEIGHT, lines: 1 };
  }

  const hasSpaces = raw.includes(' ');
  const tokens = hasSpaces ? raw.split(' ') : [...raw]; // 띄어쓰기 없으면 문자 단위

  const lines = [];
  let line = '';

  const pushLine = (s) => {
    const t = s.trim();
    lines.push(t.length ? t : '');
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    const next = hasSpaces
      ? (line ? `${line} ${token}` : token)
      : (line + token);

    const width = ctx.measureText(next).width;

    if (width <= maxWidthPx) {
      line = next;
      continue;
    }

    // 한 줄에 못 담으면 줄을 끊음
    if (line) {
      pushLine(line);
      line = hasSpaces ? token : token; // 다음 토큰부터 새 줄 시작
      continue;
    }

    // 단일 토큰(긴 단어/문자열)이 maxWidth를 넘는 경우:
    // 문자 단위로 강제 분해(안전장치)
    if (hasSpaces) {
      const chars = [...token];
      let chunk = '';
      for (let c = 0; c < chars.length; c++) {
        const nn = chunk + chars[c];
        if (ctx.measureText(nn).width <= maxWidthPx) {
          chunk = nn;
        } else {
          pushLine(chunk);
          chunk = chars[c];
        }
      }
      line = chunk;
    } else {
      // 이미 문자 단위 토큰이므로 그냥 줄로 넣고 다음으로
      pushLine(token);
      line = '';
    }
  }

  if (line) pushLine(line);

  const widths = lines.map((ln) => ctx.measureText(ln).width);
  const w = Math.min(maxWidthPx, Math.max(1, ...widths));
  const h = Math.max(1, lines.length) * fontSizePx * LINE_HEIGHT;

  return { w, h, lines: Math.max(1, lines.length) };
}

/**
 * (텍스트 블록 w,h) + 회전각을 고려해서 AABB 크기 계산
 * 회전된 사각형의 외접 축정렬 박스:
 * aabbW = |w*cos| + |h*sin|
 * aabbH = |w*sin| + |h*cos|
 */
function rotatedAabb(w, h, deg) {
  const rad = (deg * Math.PI) / 180;
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  return {
    w: w * c + h * s,
    h: w * s + h * c,
  };
}

/**
 * AABB(중심 x,y / 폭 w / 높이 h) 겹침 판정
 */
function isOverlapping(a, b, pad = 0) {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 + pad &&
    Math.abs(a.y - b.y) < (a.h + b.h) / 2 + pad
  );
}

export default function MobileDragMentBoard() {
  const viewportRef = useRef(null);

  const [vp, setVp] = useState({ w: 0, h: 0 });
  const [board, setBoard] = useState({ w: 0, h: 0 });
  const [maxOffset, setMaxOffset] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ dragging: false, moved: false });

  useEffect(() => {
    if (!viewportRef.current) return;

    const update = () => {
      const rect = viewportRef.current.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      setVp({ w, h });

      const boardH = Math.floor(h * ZOOM);
      const boardW = Math.floor(boardH * IMG_RATIO);

      setBoard({ w: boardW, h: boardH });

      const mx = Math.max(0, boardW - w);
      const my = Math.max(0, boardH - h);
      setMaxOffset({ x: mx, y: my });

      // 시작 위치: 가운데
      setOffset({ x: -mx / 2, y: -my / 2 });
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(viewportRef.current);

    return () => ro.disconnect();
  }, []);

  /**
   * ✅ 겹치지 않게 랜덤 배치
   * - 슬롯 기반(기본 분포 유지)
   * - 랜덤 지터/회전/폰트 크기 유지
   * - AABB 충돌 체크로 겹치면 재시도
   * - 실패 시 스파이럴 탐색 + 폰트 다운(최소치까지)
   */
  const layouts = useMemo(() => {
    if (!board.w || !board.h) return [];

    // 캔버스로 텍스트 크기 추정
    const canvas =
      typeof document !== 'undefined' ? document.createElement('canvas') : null;
    const ctx = canvas?.getContext?.('2d');

    // 슬롯 개수(현재 느낌 유지하면서도, 멘트가 많으면 자동으로 촘촘하게)
    const count = exampleMentList.length;

    // 기존 9x7 느낌을 기반으로, 멘트 수가 많으면 약간 확장
    const baseCols = 9;
    const baseRows = 7;
    const baseSlots = baseCols * baseRows;

    const scale = count > baseSlots ? Math.ceil(Math.sqrt(count / baseSlots)) : 1;
    const cols = baseCols * scale;
    const rows = baseRows * scale;

    // 슬롯 생성 후 섞기(전체 고르게)
    const slots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        slots.push({
          baseLeft: (c / (cols - 1)) * 100,
          baseTop: (r / (rows - 1)) * 100,
        });
      }
    }
    const shuffledSlots = shuffle(slots);

    const placed = []; // { x,y,w,h } AABB 리스트
    const result = [];

    // 후보 생성 시 지터 범위(%)
    const JITTER_PCT = 10; // 기존 -5~+5%와 동일(폭이 10%)
    const MAX_TRIES = 120; // 랜덤 재시도
    const SPIRAL_STEP = 18; // px
    const SPIRAL_TURNS = 18; // 나선 탐색 강도
    const MIN_FONT = 12;

    for (let i = 0; i < count; i++) {
      const item = exampleMentList[i];
      const s = shuffledSlots[i % shuffledSlots.length];

      // 랜덤 속성(유지)
      let rotate = (Math.random() - 0.5) * 26; // -13~+13deg
      let fontSize = 16 + Math.random() * 8;  // 16~24px

      // base 좌표(px)
      const baseX = (s.baseLeft / 100) * board.w;
      const baseY = (s.baseTop / 100) * board.h;

      // 폰트/회전이 정해지면 박스 크기 추정
      const computeBox = (fs, rot) => {
        // 텍스트 블록 크기 추정
        let textW = NOTE_MAX_W;
        let textH = fs * LINE_HEIGHT;

        if (ctx) {
          const m = measureTextBlock(ctx, item.content, fs, NOTE_MAX_W);
          textW = Math.max(1, Math.min(NOTE_MAX_W, m.w));
          textH = Math.max(1, m.h);
        } else {
          // 폴백(대충이라도)
          const len = String(item.content ?? '').length;
          const lines = Math.max(1, Math.ceil((len * fs * 0.55) / NOTE_MAX_W));
          textH = lines * fs * LINE_HEIGHT;
          textW = NOTE_MAX_W;
        }

        // 약간의 여백(그림자/시각적 여유)
        const padW = 8;
        const padH = 6;

        const rawW = textW + padW;
        const rawH = textH + padH;

        const aabb = rotatedAabb(rawW, rawH, rot);
        return { rawW, rawH, aabbW: aabb.w, aabbH: aabb.h };
      };

      let box = computeBox(fontSize, rotate);

      // 배치 시도 함수
      const tryPlace = () => {
        for (let t = 0; t < MAX_TRIES; t++) {
          // 지터(px) : -5%~+5% (총폭 10%)
          const jx = (Math.random() - 0.5) * (JITTER_PCT / 100) * board.w;
          const jy = (Math.random() - 0.5) * (JITTER_PCT / 100) * board.h;

          let x = baseX + jx;
          let y = baseY + jy;

          // 가장자리 clamp (AABB 고려)
          const minX = box.aabbW / 2 + EDGE_PAD;
          const maxX = board.w - box.aabbW / 2 - EDGE_PAD;
          const minY = box.aabbH / 2 + EDGE_PAD;
          const maxY = board.h - box.aabbH / 2 - EDGE_PAD;

          x = clamp(x, minX, maxX);
          y = clamp(y, minY, maxY);

          const cand = { x, y, w: box.aabbW, h: box.aabbH };

          let ok = true;
          for (let p = 0; p < placed.length; p++) {
            if (isOverlapping(cand, placed[p], COLLISION_PAD)) {
              ok = false;
              break;
            }
          }
          if (ok) return { x, y };
        }
        return null;
      };

      // 스파이럴(나선형) 탐색: 랜덤이 다 막혔을 때 주변 빈자리 찾기
      const spiralPlace = () => {
        const minX = box.aabbW / 2 + EDGE_PAD;
        const maxX = board.w - box.aabbW / 2 - EDGE_PAD;
        const minY = box.aabbH / 2 + EDGE_PAD;
        const maxY = board.h - box.aabbH / 2 - EDGE_PAD;

        let x0 = clamp(baseX, minX, maxX);
        let y0 = clamp(baseY, minY, maxY);

        // 나선형으로 dx,dy를 늘려가며 탐색
        for (let ring = 1; ring <= SPIRAL_TURNS; ring++) {
          const r = ring * SPIRAL_STEP;

          // 간단히 원 둘레를 몇 점 찍어서 검사
          const samples = 16 + ring * 2;
          for (let k = 0; k < samples; k++) {
            const ang = (k / samples) * Math.PI * 2;
            let x = x0 + Math.cos(ang) * r;
            let y = y0 + Math.sin(ang) * r;

            x = clamp(x, minX, maxX);
            y = clamp(y, minY, maxY);

            const cand = { x, y, w: box.aabbW, h: box.aabbH };

            let ok = true;
            for (let p = 0; p < placed.length; p++) {
              if (isOverlapping(cand, placed[p], COLLISION_PAD)) {
                ok = false;
                break;
              }
            }
            if (ok) return { x, y };
          }
        }
        return null;
      };

      // 1) 랜덤 재시도
      let pos = tryPlace();

      // 2) 실패하면 스파이럴 탐색
      if (!pos) pos = spiralPlace();

      // 3) 그래도 실패하면 폰트를 줄이면서(랜덤성은 유지) 다시 시도
      while (!pos && fontSize > MIN_FONT) {
        fontSize -= 1.5;
        // 회전도 약간만 줄여주면 성공률이 올라감(느낌은 유지)
        rotate *= 0.92;

        box = computeBox(fontSize, rotate);

        pos = tryPlace() || spiralPlace();
      }

      // 4) 최후: 정말 불가능한 밀도면 겹침을 허용하지 않고,
      //    가장자리 clamp된 base 위치라도 넣음(현실적으로는 ZOOM/멘트 수/노트 크기 조정 필요)
      if (!pos) {
        const minX = box.aabbW / 2 + EDGE_PAD;
        const maxX = board.w - box.aabbW / 2 - EDGE_PAD;
        const minY = box.aabbH / 2 + EDGE_PAD;
        const maxY = board.h - box.aabbH / 2 - EDGE_PAD;
        pos = {
          x: clamp(baseX, minX, maxX),
          y: clamp(baseY, minY, maxY),
        };
      }

      // 확정 배치 기록
      placed.push({ x: pos.x, y: pos.y, w: box.aabbW, h: box.aabbH });

      // CSS 퍼센트 좌표로 변환(기존 방식 유지)
      result.push({
        left: (pos.x / board.w) * 100,
        top: (pos.y / board.h) * 100,
        rotate,
        fontSize,
      });
    }

    return result;
  }, [board.w, board.h]);

  const onPointerDown = (e) => {
    dragRef.current = { dragging: true, moved: false };
    setIsDragging(true);
    lastRef.current = { x: e.clientX, y: e.clientY };
    try {
      viewportRef.current?.setPointerCapture?.(e.pointerId);
    } catch (_) {}
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;

    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;

    if (Math.hypot(dx, dy) > 2) dragRef.current.moved = true;

    lastRef.current = { x: e.clientX, y: e.clientY };

    setOffset((prev) => ({
      x: clamp(prev.x + dx, -maxOffset.x, 0),
      y: clamp(prev.y + dy, -maxOffset.y, 0),
    }));
  };

  const stopDragging = (e) => {
    dragRef.current.dragging = false;
    setIsDragging(false);
    try {
      viewportRef.current?.releasePointerCapture?.(e.pointerId);
    } catch (_) {}
  };

  return (
    <div
      ref={viewportRef}
      className={`m-viewport ${isDragging ? 'dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <div
        className="m-content"
        style={{
          width: `${board.w}px`,
          height: `${board.h}px`,
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        }}
      >
        <img className="m-bg" src={BACKGROUND_URL} alt="" draggable="false" />

        {exampleMentList.map((item, i) => {
          const cfg = layouts[i];
          if (!cfg) return null;

          return (
            <div
              key={item.id}
              className="m-note"
              style={{
                left: `${cfg.left}%`,
                top: `${cfg.top}%`,
                '--rotate-deg': `${cfg.rotate}deg`,
                '--font-size': `${cfg.fontSize}px`,
              }}
              onClick={() => {
                if (dragRef.current.moved) return;
                // 탭 시 모달/강조 등 원하는 동작 넣기
              }}
            >
              <p className="m-note-text">{item.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
