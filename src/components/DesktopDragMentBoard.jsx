// src/components/DesktopDragMentBoard.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import { exampleMentList } from '../mentList';
import './DesktopDragMentBoard.css';

const BACKGROUND_URL =
  'https://res.cloudinary.com/dkzferide/image/upload/v1765019299/G7aU1pYbQAAzTpZ_p9l82u.jpg';

// 화면보다 가로로 얼마나 더 크게 쓸지 (2배 정도)
const BOARD_SCALE = 2.0;

const DesktopDragMentBoard = () => {
  // 가로 오프셋만 사용
  const [offsetX, setOffsetX] = useState(0);
  const [maxOffsetX, setMaxOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastXRef = useRef(0);
  const dragStateRef = useRef({ dragging: false, moved: false });

  // 화면 크기 기준으로 드래그 가능한 최대 범위 계산
  useEffect(() => {
    const updateMaxOffset = () => {
      const w = window.innerWidth;
      // 보드 너비 = BOARD_SCALE * w
      // 왼쪽 끝(0) ~ 오른쪽 끝(-(보드너비 - 화면너비)) 범위로 이동
      const maxX = (BOARD_SCALE - 1) * w;
      setMaxOffsetX(maxX);
      // 화면 새로고침 시 왼쪽에서 시작
      setOffsetX(0);
    };

    updateMaxOffset();
    window.addEventListener('resize', updateMaxOffset);
    return () => window.removeEventListener('resize', updateMaxOffset);
  }, []);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const handleMouseDown = (e) => {
    dragStateRef.current = { dragging: true, moved: false };
    setIsDragging(true);
    lastXRef.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!dragStateRef.current.dragging) return;

    const lastX = lastXRef.current;
    const dx = e.clientX - lastX;

    if (Math.abs(dx) > 2) {
      dragStateRef.current.moved = true;
    }

    lastXRef.current = e.clientX;

    setOffsetX((prev) => {
      // 0 ~ -maxOffsetX 사이로만 이동
      const next = clamp(prev + dx, -maxOffsetX, 0);
      return next;
    });
  };

  const stopDragging = () => {
    dragStateRef.current.dragging = false;
    setIsDragging(false);
  };

  // 멘트 레이아웃 (위치 / 각도 / 글씨 크기 랜덤)
  const layouts = useMemo(() => {
    // 가로로 넓은 보드를 위해 7 x 6 정도의 그리드에 랜덤 배치
    const rows = [12, 24, 36, 48, 60, 72, 84];     // 위→아래 (%)
    const cols = [4, 20, 36, 52, 68, 84, 100, 116]; // 왼→오 (%)
    const totalSlots = rows.length * cols.length;

    return exampleMentList.map((_, index) => {
      const slot = index % totalSlots;
      const r = Math.floor(slot / cols.length);
      const c = slot % cols.length;

      const jitterX = (Math.random() - 0.5) * 6;   // -3 ~ +3 %
      const jitterY = (Math.random() - 0.5) * 6;   // -3 ~ +3 %
      const rotate = (Math.random() - 0.5) * 26;   // -13 ~ +13 deg
      const fontSize = 18 + Math.random() * 10;    // 18 ~ 28 px

      return {
        top: rows[r] + jitterY,
        left: cols[c] + jitterX, // 이 %는 보드(BOARD_SCALE * 100%) 기준
        rotate,
        fontSize,
      };
    });
  }, []);

  // 팝업용 선택된 멘트
  const [selected, setSelected] = useState(null);
  const handleClose = () => setSelected(null);

  return (
    <div
      className={
        isDragging ? 'drag-board-wrapper dragging' : 'drag-board-wrapper'
      }
      style={{
        backgroundImage: `url(${BACKGROUND_URL})`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      {/* 가로로 긴 멘트 보드 (배경은 wrapper에 고정) */}
      <div
        className="drag-board-content"
        style={{
          transform: `translateX(${offsetX}px)`,
        }}
      >
        {exampleMentList.map((item, index) => {
          const cfg = layouts[index];

          return (
            <div
              key={item.id}
              className="drag-note"
              style={{
                top: `${cfg.top}%`,
                left: `calc(${cfg.left}% * ${BOARD_SCALE})`, // 보드 가로 스케일 반영
                '--rotate-deg': `${cfg.rotate}deg`,
                '--font-size': `${cfg.fontSize}px`,
              }}
              onClick={() => {
                // 드래그 중에 떼는 클릭은 무시
                if (dragStateRef.current.moved) return;
                setSelected(item);
              }}
            >
              <p className="drag-note-text">{item.content}</p>
            </div>
          );
        })}
      </div>


    </div>
  );
};

export default DesktopDragMentBoard;
