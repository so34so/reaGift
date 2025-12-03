// src/pages/Page3.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coupons, finalCoupon } from '../data/testCoupons';
import PageNavigator from '../components/PageNavigator';
import './Page3.css';

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Page3() {
  const navigate = useNavigate();

  const [shuffled, setShuffled] = useState(coupons);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [openedIds, setOpenedIds] = useState([]);
  const [showFinalCoupon, setShowFinalCoupon] = useState(false);

  const handleShuffle = () => {
    if (isShuffling) return;
    setIsShuffling(true);

    // 살짝 흔들리는 애니메이션 시간을 주고 실제로 섞기
    setTimeout(() => {
      setShuffled((prev) => shuffleArray(prev));
      setHasShuffled(true);
      setIsShuffling(false);
    }, 700);
  };

  const handleBoxClick = (id) => {
    if (!hasShuffled || isShuffling || showFinalCoupon) return;

    const coupon = shuffled.find((c) => c.id === id);
    if (!coupon) return;

    setSelectedCoupon(coupon);

    if (!openedIds.includes(id)) {
      setOpenedIds((prev) => [...prev, id]);
    }
  };

  const handleCloseCoupon = () => {
    setSelectedCoupon(null);

    // 모든 쿠폰을 다 열었으면 마지막 약속 쿠폰 보여주기
    if (openedIds.length === coupons.length) {
      setShowFinalCoupon(true);
    }
  };

  const handleGoEnd = () => {
    navigate('/end'); // 엔딩 화면 라우트 (App.jsx에 /end 추가해주면 됨)
  };

  const openedCount = openedIds.length;

  return (
    <div className="page3-wrapper">
      <header className="page3-header">
        <h1>선물 뽑기 쿠폰 보관함</h1>
        {/* <p>
          삐뚤빼뚤 그린 선물 상자 세 개 안에
          <br />
          레아를 위한 오래가는 쿠폰들이 숨겨져 있어요.
        </p> */}
      </header>

      <main className="page3-main">
        <section className="gift-section">
          <p className="gift-message">
            {!hasShuffled
              ? '먼저 선물 상자를 섞어볼게요! 아래 버튼을 눌러주세요.'
              : openedCount === coupons.length
              ? '모든 쿠폰을 다 열었어요. 마지막 약속 쿠폰이 준비되고 있어요.'
              : '마음에 드는 선물 상자를 하나 골라주세요.'}
          </p>

          <div className="gift-row">
            {shuffled.map((c, index) => {
              const isOpened = openedIds.includes(c.id);
              const rotClass = `rot-${index % 3}`; // 삐뚤삐뚤 효과
              return (
                <button
                  key={c.id}
                  type="button"
                  className={[
                    'gift-box',
                    rotClass,
                    isShuffling ? 'shuffling' : '',
                    isOpened ? 'opened' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleBoxClick(c.id)}
                  disabled={isShuffling}
                >
                  <div className="gift-icon">🎁</div>
                  <div className="gift-ribbon" />
                  {isOpened && <span className="gift-opened-label">OPEN</span>}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="shuffle-btn"
            onClick={handleShuffle}
            disabled={isShuffling}
          >
            {hasShuffled ? '선물 다시 섞기' : '선물 섞기'}
          </button>

          <p className="gift-hint">
            세 개의 상자를 모두 열면, 마지막으로{' '}
            <strong></strong>이 등장해요.
          </p>
        </section>
      </main>

      <div className="page3-nav">
        <PageNavigator />
      </div>

      {/* 개별 쿠폰 모달 */}
      {selectedCoupon && (
        <div className="coupon-backdrop" onClick={handleCloseCoupon}>
          <div
            className="coupon-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="coupon-paper-stain" />
            <div className="coupon-title">{selectedCoupon.title}</div>
            <div className="coupon-divider" />
            <div className="coupon-desc">{selectedCoupon.desc}</div>
            <button
              type="button"
              className="coupon-close-btn"
              onClick={handleCloseCoupon}
            >
              쿠폰 닫기
            </button>
          </div>
        </div>
      )}

      {/* 마지막 약속 쿠폰 모달 */}
      {showFinalCoupon && (
        <div className="coupon-backdrop" onClick={handleGoEnd}>
          <div
            className="coupon-card coupon-final"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="coupon-paper-stain" />
            <div className="coupon-title">{finalCoupon.title}</div>
            <div className="coupon-divider" />
            <div className="coupon-desc">{finalCoupon.desc}</div>
            <button
              type="button"
              className="coupon-go-end-btn"
              onClick={handleGoEnd}
            >
              이 약속 받아줄게 💌 엔딩으로 가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
