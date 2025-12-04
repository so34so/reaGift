// src/pages/Page1.jsx

import { useState, useMemo, useRef } from 'react';
import { imageList } from '../data/ImageList';
import PageNavigator from '../components/PageNavigator';
import './Page1.css';

export default function Page1() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGroupKey, setCurrentGroupKey] = useState(null); // x 값
  const [currentIndex, setCurrentIndex] = useState(0);          // 그룹 내 index
  const [sliderValue, setSliderValue] = useState(0);            // 0 ~ 100

  const sliderRef = useRef(null); // 연대기 가로 스트립 div

  // 1) x 값별 대표 이미지 (연대기에 보여줄 카드)
  const groupList = useMemo(() => {
    const map = new Map(); // key: String(x), value: 대표 이미지(첫 번째로 등장한 것)
    imageList.forEach((img) => {
      const key = String(img.x);
      if (!map.has(key)) {
        map.set(key, img);
      }
    });

    return Array.from(map.entries()).map(([key, rep]) => ({
      key,
      rep,
    }));
  }, []);

  // 2) 팝업에서 사용할 현재 그룹 (같은 x 값)
  const currentGroup = useMemo(() => {
    if (currentGroupKey === null) return [];
    return imageList.filter((img) => String(img.x) === String(currentGroupKey));
  }, [currentGroupKey]);

  const currentImage =
    currentGroup.length > 0 ? currentGroup[currentIndex] : null;

  // --- 카드 클릭 → 해당 x 그룹 팝업 열기 ---
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

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const showPrev = () => {
    if (currentGroup.length === 0) return;
    setCurrentIndex(
      (prev) => (prev - 1 + currentGroup.length) % currentGroup.length
    );
  };

  const showNext = () => {
    if (currentGroup.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % currentGroup.length);
  };

  // --- 슬라이드 바 드래그 → 타임라인 스크롤 ---
  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setSliderValue(value);

    if (!sliderRef.current) return;
    const maxScroll =
      sliderRef.current.scrollWidth - sliderRef.current.clientWidth;
    if (maxScroll <= 0) return;

    sliderRef.current.scrollLeft = (maxScroll * value) / 100;
  };

  // --- 타임라인 스크롤 시 슬라이드 바 동기화 (휠, 키보드 등) ---
  const handleTimelineScroll = () => {
    if (!sliderRef.current) return;
    const maxScroll =
      sliderRef.current.scrollWidth - sliderRef.current.clientWidth;
    if (maxScroll <= 0) {
      setSliderValue(0);
      return;
    }
    const ratio = sliderRef.current.scrollLeft / maxScroll;
    setSliderValue(ratio * 100);
  };

  // --- 휠로도 가로 스크롤 가능하게 (원하면 유지) ---
  const handleWheel = (e) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollLeft += e.deltaY;
  };

  return (
    <div className="page1-wrapper">
      {/* 상단 제목 영역 */}
      <header className="page1-header">
        <h1>연대기</h1>
        {/* <p>아래 슬라이드 바를 드래그해서 같이 걸어온 시간을 쭉 훑어봐요.</p> */}
      </header>

      {/* 가운데: 연대기 타임라인 (가로 스크롤) */}
      <main className="timeline-drag-area">
        <div
          className="timeline-strip"
          ref={sliderRef}
          onScroll={handleTimelineScroll}
          onWheel={handleWheel}
        >
          {groupList.map((group, index) => {
            const { key, rep } = group;
            const positionClass =
              index % 2 === 0 ? 'timeline-card top' : 'timeline-card bottom';

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
                    {rep.content && (
                      <span className="timeline-label-sub">
                        {rep.content}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 아래쪽 슬라이드 바 (여기를 드래그할 때만 연대기 이동) */}
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

      {/* 페이지 네비게이터 */}
      <div className="page1-nav">
        <PageNavigator />
      </div>

      {/* 팝업 모달 - 같은 x 그룹만 화살표 슬라이드 */}
      {isModalOpen && currentImage && (
        <div className="image-modal-backdrop" onClick={closeModal}>
          <div
            className="image-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="image-modal-close" onClick={closeModal}>
              ✕
            </button>

            <button className="image-modal-arrow left" onClick={showPrev}>
              ◀
            </button>
            <button className="image-modal-arrow right" onClick={showNext}>
              ▶
            </button>

            <img
              src={currentImage.url}
              alt={currentImage.name}
              className="image-modal-img"
            />
            <div className="image-modal-text">
              <h2>{currentImage.name}</h2>
              <p>{currentImage.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
