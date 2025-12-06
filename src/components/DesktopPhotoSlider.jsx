// src/components/DesktopPhotoSlider.jsx
import { useMemo, useState } from 'react';
import { exampleMentList } from '../mentList';
import './DesktopPhotoSlider.css';

const BACKGROUND_URL =
  'https://res.cloudinary.com/dkzferide/image/upload/v1765019299/G7aU1pYbQAAzTpZ_p9l82u.jpg';

const PAGE_SIZE = 20; // 한 페이지에 보여줄 멘트 개수

const DesktopPhotoSlider = () => {
  // 전체 멘트를 페이지 단위로 나누기
  const pages = useMemo(() => {
    const result = [];
    for (let i = 0; i < exampleMentList.length; i += PAGE_SIZE) {
      const pageItems = exampleMentList.slice(i, i + PAGE_SIZE).map((item, idx) => ({
        item,
        globalIndex: i + idx, // 레이아웃용 전역 인덱스
      }));
      result.push(pageItems);
    }
    return result;
  }, []);

  const totalPages = pages.length;

  // 슬라이드 레이아웃(위치/각도/글씨 크기) – 전체 멘트 기준으로 한 번만 생성
  const layouts = useMemo(() => {
    // 5 x 5 그리드 기반으로 랜덤 살짝 추가
    const rows = [18, 30, 42, 54, 66];           // 위→아래
    const cols = [14, 30, 46, 62, 78];           // 왼→오
    const totalSlots = rows.length * cols.length;

    return exampleMentList.map((_, index) => {
      const slot = index % totalSlots;
      const r = Math.floor(slot / cols.length);
      const c = slot % cols.length;

      const jitterX = (Math.random() - 0.5) * 6;  // -3 ~ +3 %
      const jitterY = (Math.random() - 0.5) * 6;  // -3 ~ +3 %
      const rotate = (Math.random() - 0.5) * 22;  // -11 ~ +11 deg
      const fontSize = 18 + Math.random() * 8;    // 18 ~ 26 px

      return {
        top: rows[r] + jitterY,
        left: cols[c] + jitterX,
        rotate,
        fontSize,
      };
    });
  }, []);

  // 현재 페이지 상태
  const [currentPage, setCurrentPage] = useState(0);

  const goToPage = (page) => {
    if (page < 0) {
      setCurrentPage(totalPages - 1);
    } else if (page >= totalPages) {
      setCurrentPage(0);
    } else {
      setCurrentPage(page);
    }
  };

  const goPrev = () => goToPage(currentPage - 1);
  const goNext = () => goToPage(currentPage + 1);

  // 팝업용 선택된 멘트
  const [selected, setSelected] = useState(null);
  const handleClose = () => setSelected(null);

  return (
    <div className="slider-board-wrapper">
      {/* 배경 사진 (전체 화면) */}
      <div
        className="slider-background"
        style={{ backgroundImage: `url(${BACKGROUND_URL})` }}
      />

      {/* 슬라이드 페이지들 */}
      <div className="slider-pages">
        {pages.map((pageItems, pageIndex) => (
          <div
            key={pageIndex}
            className="slider-page"
            style={{
              transform: `translateX(${(pageIndex - currentPage) * 100}%)`,
              pointerEvents: pageIndex === currentPage ? 'auto' : 'none',
            }}
          >
            {pageItems.map(({ item, globalIndex }) => {
              const cfg = layouts[globalIndex];

              return (
                <div
                  key={item.id}
                  className="slider-note"
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
                  <p className="slider-note-text">{item.content}</p>
                  <p className="slider-note-author">- {item.name}</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 하단 슬라이드 컨트롤 */}
      <div className="slider-controls">
        <button
          type="button"
          className="slider-arrow"
          onClick={goPrev}
        >
          ‹
        </button>
        <div className="slider-dots">
          {pages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={
                idx === currentPage ? 'slider-dot active' : 'slider-dot'
              }
              onClick={() => goToPage(idx)}
            />
          ))}
        </div>
        <button
          type="button"
          className="slider-arrow"
          onClick={goNext}
        >
          ›
        </button>
      </div>

      {/* 팝업 모달 */}
      {selected && (
        <div className="slider-modal-backdrop" onClick={handleClose}>
          <div
            className="slider-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="slider-modal-header">
              <h3>메시지</h3>
              <button
                type="button"
                className="slider-modal-close"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>
            <div className="slider-modal-body">
              <p className="slider-modal-content">{selected.content}</p>
              <p className="slider-modal-author">- {selected.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopPhotoSlider;
