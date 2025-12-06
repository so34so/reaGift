// src/components/DesktopPhotoBoard.jsx
import { useMemo, useState } from 'react';
import { exampleMentList } from '../mentList';
import './DesktopPhotoBoard.css';

const BACKGROUND_URL =
  'https://res.cloudinary.com/dkzferide/image/upload/v1765019299/G7aU1pYbQAAzTpZ_p9l82u.jpg';

const DesktopPhotoBoard = () => {
  // 멘트 위치/각도/글씨 크기 랜덤 설정 (처음 렌더 시 한 번만)
  const layouts = useMemo(() => {
    // 사진 영역 안에서 대략 6 x 5 그리드로 깔고, 약간씩 흔들기
    const rows = [18, 32, 46, 60, 74, 88]; // 위→아래
    const cols = [16, 32, 48, 64, 80];     // 왼→오
    const totalSlots = rows.length * cols.length;

    return exampleMentList.map((_, index) => {
      const slot = index % totalSlots;
      const r = Math.floor(slot / cols.length);
      const c = slot % cols.length;

      const jitterX = (Math.random() - 0.5) * 6; // -3 ~ +3 %
      const jitterY = (Math.random() - 0.5) * 6; // -3 ~ +3 %
      const rotate = (Math.random() - 0.5) * 22; // -11 ~ +11 deg
      const fontSize = 18 + Math.random() * 8;   // 18 ~ 26 px

      return {
        top: rows[r] + jitterY,
        left: cols[c] + jitterX,
        rotate,
        fontSize,
      };
    });
  }, []);

  // 팝업에 보여줄 선택된 멘트
  const [selected, setSelected] = useState(null);

  const handleClose = () => setSelected(null);

  return (
    <div className="photo-board-wrapper">
      <div className="photo-frame">
        <div className="photo-frame-inner">
          {/* 배경 사진 */}
          <div
            className="photo-board-background"
            style={{ backgroundImage: `url(${BACKGROUND_URL})` }}
          />

          {/* 멘트 레이어 */}
          <div className="photo-board-layer">
            {exampleMentList.map((item, index) => {
              const cfg = layouts[index];

              return (
                <div
                  key={item.id}
                  className="photo-note"
                  style={{
                    top: `${cfg.top}%`,
                    left: `${cfg.left}%`,
                    '--rotate-deg': `${cfg.rotate}deg`,
                    '--font-size': `${cfg.fontSize}px`,
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelected(item);
                    }
                  }}
                >
                  <p className="photo-note-text">{item.content}</p>
                  <p className="photo-note-author">- {item.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 팝업 모달 */}
      {selected && (
        <div className="photo-modal-backdrop" onClick={handleClose}>
          <div
            className="photo-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="photo-modal-header">
              <h3>메시지</h3>
              <button
                type="button"
                className="photo-modal-close"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>
            <div className="photo-modal-body">
              <p className="photo-modal-content">{selected.content}</p>
              <p className="photo-modal-author">- {selected.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopPhotoBoard;
