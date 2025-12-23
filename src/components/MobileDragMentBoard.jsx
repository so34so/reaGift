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
// (값이 커질수록 이동 가능한 공간↑ / 한 번에 보이는 영역↓)
const ZOOM = 1.20;

// 멘트가 가장자리에서 잘리지 않도록(대략)
const NOTE_MAX_W = 210; // px (CSS max-width와 맞추는 게 좋음)
const NOTE_MAX_H = 120; // px
const EDGE_PAD = 10;    // px

export default function MobileDragMentBoard() {
  const viewportRef = useRef(null);

  const [vp, setVp] = useState({ w: 0, h: 0 });
  const [board, setBoard] = useState({ w: 0, h: 0 });
  const [maxOffset, setMaxOffset] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ dragging: false, moved: false });

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // ✅ viewport 크기(= page2-main 영역)를 정확히 잡기 위해 ResizeObserver 사용
  useEffect(() => {
    if (!viewportRef.current) return;

    const update = () => {
      const rect = viewportRef.current.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      setVp({ w, h });

      // ✅ “데스크탑 느낌의 전체 이미지를 보드로”:
      // 기본은 높이를 기준으로 보드를 만들면(landscape 이미지) 가로가 크게 늘어나서 탐색 폭이 커짐
      const boardH = Math.floor(h * ZOOM);
      const boardW = Math.floor(boardH * IMG_RATIO);

      setBoard({ w: boardW, h: boardH });

      const mx = Math.max(0, boardW - w);
      const my = Math.max(0, boardH - h);
      setMaxOffset({ x: mx, y: my });

      // ✅ 시작 위치: 가운데
      setOffset({ x: -mx / 2, y: -my / 2 });
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(viewportRef.current);

    return () => ro.disconnect();
  }, []);

  // ✅ 멘트 배치: 보드 전체에 고르게 + 가장자리 잘림 방지(픽셀 기반)
  const layouts = useMemo(() => {
    if (!board.w || !board.h) return [];

    const marginX = ((NOTE_MAX_W / 2 + EDGE_PAD) / board.w) * 100;
    const marginY = ((NOTE_MAX_H / 2 + EDGE_PAD) / board.h) * 100;

    const cols = 9;
    const rows = 7;

    // 슬롯을 만들고 섞어서 “아래쪽이 비는 문제” 해결
    const slots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        slots.push({
          baseLeft: (c / (cols - 1)) * 100,
          baseTop: (r / (rows - 1)) * 100,
        });
      }
    }
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    return exampleMentList.map((_, idx) => {
      const s = slots[idx % slots.length];

      const jitterX = (Math.random() - 0.5) * 10; // -5~+5%
      const jitterY = (Math.random() - 0.5) * 10;

      const rotate = (Math.random() - 0.5) * 26; // -13~+13deg
      const fontSize = 16 + Math.random() * 8;   // 16~24px

      const left = clamp(s.baseLeft + jitterX, marginX, 100 - marginX);
      const top = clamp(s.baseTop + jitterY, marginY, 100 - marginY);

      return { left, top, rotate, fontSize };
    });
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
