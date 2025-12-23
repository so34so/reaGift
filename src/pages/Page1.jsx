// src/pages/Page1.jsx
import { useState, useMemo, useRef } from 'react';
import { imageList } from '../data/ImageList';
import PageNavigator from '../components/PageNavigator';
import { useDeviceMode } from '../hooks/useDeviceMode';
import './Page1.css';

export default function Page1() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGroupKey, setCurrentGroupKey] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);

  const { isMobile } = useDeviceMode();
  const sliderRef = useRef(null);

const touchStartRef = useRef({ x: 0, y: 0 });

const handleTouchStart = (e) => {
  if (!isMobile) return;
  const t = e.touches[0];
  touchStartRef.current = { x: t.clientX, y: t.clientY };
};

const handleTouchEnd = (e) => {
  if (!isMobile) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartRef.current.x;
  const dy = t.clientY - touchStartRef.current.y;

  // 수평 스와이프만 인정 (세로 스크롤 오인 방지)
  const H_THRESHOLD = 40;
  const V_LIMIT = 80;

  if (Math.abs(dx) > H_THRESHOLD && Math.abs(dy) < V_LIMIT) {
    if (dx < 0) showNext();  // 왼쪽으로 밀면 다음
    else showPrev();         // 오른쪽으로 밀면 이전
  }
};

  // 1) x 값별 대표 이미지
  const groupList = useMemo(() => {
    const map = new Map();
    imageList.forEach((img) => {
      const key = String(img.x);
      if (!map.has(key)) map.set(key, img);
    });

    return Array.from(map.entries())
      .map(([key, rep]) => ({ key, rep }))
      .sort((a, b) => Number(a.key) - Number(b.key));
  }, []);

  // 2) 팝업에서 사용할 현재 그룹
  const currentGroup = useMemo(() => {
    if (currentGroupKey === null) return [];
    return imageList.filter((img) => String(img.x) === String(currentGroupKey));
  }, [currentGroupKey]);

  const currentImage = currentGroup.length > 0 ? currentGroup[currentIndex] : null;

  const openModalForGroup = (groupKey, repId) => {
    const group = imageList.filter((img) => String(img.x) === String(groupKey));
    let initialIndex = 0;
    if (repId != null) {
      const foundIndex = group.findIndex((img) => img.id === repId);
      if (foundIndex !== -1) initialIndex = foundIndex;
    }
    setCurrentGroupKey(groupKey);
    setCurrentIndex(initialIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const showPrev = () => {
    if (currentGroup.length === 0) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const showNext = () => {
    if (currentGroup.length === 0) return;
    setCurrentIndex((prev) => (prev < currentGroup.length - 1 ? prev + 1 : prev));
  };

  // ✅ 공통: 현재 모드(모바일/데스크탑)에 맞는 최대 스크롤 계산
  const getMaxScroll = (el) => {
    if (!el) return 0;
    return isMobile
      ? el.scrollHeight - el.clientHeight
      : el.scrollWidth - el.clientWidth;
  };

  // ✅ 슬라이더 드래그 → (모바일: 세로 이동 / 데스크탑: 가로 이동)
  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setSliderValue(value);

    const el = sliderRef.current;
    if (!el) return;

    const maxScroll = getMaxScroll(el);
    if (maxScroll <= 0) return;

    const nextPos = (maxScroll * value) / 100;
    if (isMobile) el.scrollTop = nextPos;
    else el.scrollLeft = nextPos;
  };

  // ✅ 타임라인 스크롤 시 슬라이더 동기화
  const handleTimelineScroll = () => {
    const el = sliderRef.current;
    if (!el) return;

    const maxScroll = getMaxScroll(el);
    if (maxScroll <= 0) {
      setSliderValue(0);
      return;
    }

    const ratio = isMobile ? el.scrollTop / maxScroll : el.scrollLeft / maxScroll;
    setSliderValue(ratio * 100);
  };

  // ✅ 데스크탑에서만 휠을 가로 스크롤로 변환 (모바일은 기본 세로 스크롤 유지)
  const handleWheel = (e) => {
    if (isMobile) return; // 모바일은 터치 스크롤 그대로
    const el = sliderRef.current;
    if (!el) return;
    el.scrollLeft += e.deltaY;
  };

  return (
    <div className={`page1-wrapper ${isMobile ? 'mobile' : ''}`}>
      <header className="page1-header">
      </header>

      <main className="timeline-drag-area">
        <div
          className="timeline-strip"
          ref={sliderRef}
          onScroll={handleTimelineScroll}
          onWheel={handleWheel}
        >
          {groupList.map((group, index) => {
            const { key, rep } = group;

            // ✅ 모바일이면 top/bottom 번갈이 대신 단일 스타일로
            const positionClass = isMobile
              ? 'timeline-card mobile'
              : index % 2 === 0
                ? 'timeline-card top'
                : 'timeline-card bottom';

            return (
              <div
                key={key}
                className={positionClass}
                onClick={() => openModalForGroup(key, rep.id)}
              >
                <div className="timeline-card-inner">
                  <div className="timeline-frame">
                    <img src={rep.url} alt={rep.name} />
                  </div>

                  <div className="timeline-label">
                    <span className="timeline-label-main">{rep.name}</span>
                    {rep.content && <span className="timeline-label-sub">{rep.content}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <div className="timeline-slider-container">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
          className="timeline-slider"
        />
      </div>

      <div className="page1-nav">
        <PageNavigator />
      </div>

{isModalOpen && currentImage && (
  <div className="image-modal-backdrop" onClick={closeModal}>
    <div className="image-modal" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="image-modal-close"
        onClick={(e) => {
          e.stopPropagation();
          closeModal();
        }}
        aria-label="닫기"
      >
        ✕
      </button>

      {/* ✅ 이미지 영역: 스와이프는 여기서 처리 */}
      <div
        className="image-modal-main"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImage.url}
          alt={currentImage.name}
          className="image-modal-img"
        />
      </div>

      {/* ✅ 제목 줄 양옆에 화살표 */}
      <div className="image-modal-title-row">
        <button
          type="button"
          className="image-modal-nav-btn"
          onClick={showPrev}
          disabled={!(currentGroup.length > 1 && currentIndex > 0)}
          aria-label="이전 사진"
        >
          ◀
        </button>

        <div className="image-modal-title-wrap">
          <h2 className="image-modal-title">{currentImage.name}</h2>
          <div className="image-modal-count">
            {currentIndex + 1} / {currentGroup.length}
          </div>
        </div>

        <button
          type="button"
          className="image-modal-nav-btn"
          onClick={showNext}
          disabled={!(currentGroup.length > 1 && currentIndex < currentGroup.length - 1)}
          aria-label="다음 사진"
        >
          ▶
        </button>
      </div>

      <div className="image-modal-text">
        <p>{currentImage.content}</p>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
