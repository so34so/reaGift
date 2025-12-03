// src/components/IntroScreen.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { introImages, MAIN_INTRO_ID } from '../data/introImages';
import './IntroScreen.css';

export default function IntroScreen() {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  const targetId = MAIN_INTRO_ID;
  const selected =
    introImages.find((item) => item.id === targetId) || introImages[0];

  const handleEnterClick = () => {
    if (isLeaving) return; // 중복 클릭 방지
    setIsLeaving(true);    // fade-out 시작
  };

  const handleAnimationEnd = (e) => {
    // fade-out 애니메이션이 끝났을 때만 페이지 이동
    if (e.animationName === 'introFadeOut' && isLeaving) {
      navigate('/page1');
    }
  };

  return (
    <div
      className={`intro-wrapper ${
        isLeaving ? 'intro-fade-out' : 'intro-fade-in'
      }`}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* 배경 이미지 */}
      <img
        src={selected.url}
        alt={selected.name}
        className="intro-bg-img"
      />

      {/* 어두운 오버레이 + 텍스트 */}
      <div className="intro-overlay">
        <div className="intro-text-box">
          <h1 className="intro-title">{selected.name}</h1>
          <p className="intro-content">{selected.content}</p>

          <button className="intro-button" onClick={handleEnterClick}>
            들어가기
          </button>
        </div>
      </div>
    </div>
  );
}
