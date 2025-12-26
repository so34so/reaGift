import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { introImages, MAIN_INTRO_ID } from '../data/introImages';
import { imageList } from '../data/ImageList';
import MobileBgMosaicMarquee from './MobileBgMosaicMarquee';
import './IntroScreenMobile.css';

export default function IntroScreenMobile() {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  const selected =
    introImages.find((item) => item.id === MAIN_INTRO_ID) || introImages[0];

  const handleEnterClick = () => {
    if (isLeaving) return;
    setIsLeaving(true);
  };

  const handleAnimationEnd = (e) => {
    if (e.animationName === 'introFadeOut' && isLeaving) {
      navigate('/page1');
    }
  };

  return (
    <div
      className={`intro-m-wrapper ${isLeaving ? 'intro-fade-out' : 'intro-fade-in'}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* ✅ 바둑판 배경 + 좌→우 흐름 */}
      <MobileBgMosaicMarquee
        items={imageList}     // x는 무시, id/url 기반으로 처리
        cols={3}
        rows={6}
        gapPx={8}
        durationSec={26}
        direction="ltr"
        seed={20251226}
        maxUnique={24}
      />

      <div className="intro-m-overlay">
        <div className="intro-m-sheet">
          <div className="intro-m-kicker">AMORE</div>
          <h1 className="intro-m-title">{selected.name}</h1>
          <p className="intro-m-content">{selected.content}</p>

          <button className="intro-m-button" onClick={handleEnterClick}>
            들어가기
          </button>
        </div>
      </div>
    </div>
  );
}
