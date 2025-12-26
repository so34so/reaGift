import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isMobile as realIsMobile } from 'react-device-detect';

import { coupons, finalCoupon } from '../data/coupons';
import PageNavigator from '../components/PageNavigator';
import './Page3.css';

export default function Page3() {
  const navigate = useNavigate();

  const base = useMemo(() => coupons, []);
  const n = base.length; // 보통 3

  // 무한루프용: [마지막, 0,1,2, 첫번째]
  const loop = useMemo(() => {
    if (n === 0) return [];
    return [base[n - 1], ...base, base[0]];
  }, [base, n]);

  // pos: loop 배열에서의 현재 위치 (초기 1 = base[0])
  const [pos, setPos] = useState(1);
  const [enableTransition, setEnableTransition] = useState(true);

  // 드래그(스와이프) 상태
  const swipeRef = useRef(null);
  const startXRef = useRef(0);
  const dragXRef = useRef(0);
  const draggingRef = useRef(false);
  const [dragX, setDragX] = useState(0);

  // 쿠폰 오픈 상태
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [openedIds, setOpenedIds] = useState([]);
  const [showFinalCoupon, setShowFinalCoupon] = useState(false);

  // 현재 base index 계산 (pos=1 -> 0)
  const activeBaseIndex = useMemo(() => {
    if (n === 0) return 0;
    return (pos - 1 + n) % n;
  }, [pos, n]);

  const activeCoupon = useMemo(() => {
    if (n === 0) return null;
    return base[activeBaseIndex];
  }, [base, activeBaseIndex, n]);

  // 무한 루프 점프(transition end에서 처리)
  const handleTransitionEnd = () => {
    if (n === 0) return;

    // loop의 맨 앞(0) 또는 맨 뒤(n+1)에 도달하면 "순간이동"
    if (pos === 0) {
      // 0은 base의 마지막을 보여주는 더미 => 실제 위치 base 마지막(=pos n)
      setEnableTransition(false);
      setPos(n);
      return;
    }
    if (pos === n + 1) {
      // n+1은 base의 첫번째 더미 => 실제 위치 base 첫번째(=pos 1)
      setEnableTransition(false);
      setPos(1);
      return;
    }
  };

  // transition을 끄고 pos를 점프한 다음, 다음 프레임에 transition 다시 켜기
  useEffect(() => {
    if (!enableTransition) {
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true);
        });
      });
      return () => cancelAnimationFrame(t);
    }
  }, [enableTransition]);

  // 마지막 쿠폰 표시 (모든 쿠폰을 열고, 개별 쿠폰 모달이 닫힌 상태일 때)
  useEffect(() => {
    if (!selectedCoupon && openedIds.length === base.length && base.length > 0) {
      setShowFinalCoupon(true);
    }
  }, [selectedCoupon, openedIds, base.length]);

  const goNext = () => setPos((p) => p + 1);
  const goPrev = () => setPos((p) => p - 1);

  // 스와이프 핸들러 (pointer events)
  const onPointerDown = (e) => {
    if (!realIsMobile) return;
    draggingRef.current = true;
    startXRef.current = e.clientX;
    dragXRef.current = 0;
    setEnableTransition(false);
    setDragX(0);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    dragXRef.current = dx;
    setDragX(dx);
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const el = swipeRef.current;
    const width = el ? el.clientWidth : 320;

    const dx = dragXRef.current;
    const threshold = Math.max(42, width * 0.18);

    // 드래그 종료 -> 스냅
    setEnableTransition(true);
    setDragX(0);

    if (dx <= -threshold) goNext();
    else if (dx >= threshold) goPrev();
    // 아니면 제자리
  };

  const handleOpenCurrent = () => {
    if (!activeCoupon) return;
    if (showFinalCoupon) return;

    setSelectedCoupon(activeCoupon);

    setOpenedIds((prev) => {
      if (prev.includes(activeCoupon.id)) return prev;
      return [...prev, activeCoupon.id];
    });
  };

  const handleCloseCoupon = () => {
    setSelectedCoupon(null);
  };

  const handleGoEnd = () => {
    navigate('/end');
  };

  // 탭 vs 스와이프 구분: 손가락이 많이 움직였으면 탭 오픈 금지
  const handleCardClick = () => {
    const dx = Math.abs(dragXRef.current);
    if (dx > 8) return;
    handleOpenCurrent();
  };

  return (
    <div className="page3-wrapper">


      <main className="page3-main">
        <section className="gift-section">

          {/* ✅ 모바일: 스와이프 전용 무한루프 캐러셀 */}
          {realIsMobile ? (
            <div className="gift-carousel-wrap">
              <div
                className="gift-swipe"
                ref={swipeRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <div
                  className={`gift-track ${enableTransition ? 'with-transition' : ''}`}
                  style={{
                    transform: `translate3d(calc(${-pos * 100}% + ${dragX}px), 0, 0)`,
                  }}
                  onTransitionEnd={handleTransitionEnd}
                >
                  {loop.map((c, idx) => {
                    const isOpened = openedIds.includes(c.id);
                    const isActiveSlide = idx === pos; // loop 기준 현재 슬라이드

                    return (
                      <div className="gift-slide" key={`${c.id}-${idx}`}>
                        <button
                          type="button"
                          className={[
                            'gift-card',
                            isActiveSlide ? 'active' : '',
                            isOpened ? 'opened' : '',
                          ].join(' ')}
                          onClick={handleCardClick}
                          aria-label="선물 상자"
                        >
                          <div className="gift-card-inner">
                            <div className="gift-card-top">
                              <span className="gift-badge">
                                {isOpened ? 'OPENED' : 'TAP'}
                              </span>
                            </div>

                            <div className="gift-icon">🎁</div>
                            <div className="gift-ribbon" />
                            {isOpened && <span className="gift-opened-label">OPEN</span>}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="gift-subhint">
                {openedIds.length}/{base.length} opened
              </p>
            </div>
          ) : (
            // 데스크탑은 기존 3개 버튼 나열(원하면 여기 또한 스와이프로 통일 가능)
            <div className="gift-row">
              {base.map((c, index) => {
                const isOpened = openedIds.includes(c.id);
                const rotClass = `rot-${index % 3}`;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={[
                      'gift-box',
                      rotClass,
                      isOpened ? 'opened' : '',
                    ].join(' ')}
                    onClick={() => {
                      setSelectedCoupon(c);
                      setOpenedIds((prev) => (prev.includes(c.id) ? prev : [...prev, c.id]));
                    }}
                  >
                    <div className="gift-icon">🎁</div>
                    <div className="gift-ribbon" />
                    {isOpened && <span className="gift-opened-label">OPEN</span>}
                  </button>
                );
              })}
            </div>
          )}

          <p className="gift-hint">
            세 개의 쿠폰을 모두 열면 마지막 약속 쿠폰이 등장해요.
          </p>
        </section>
      </main>

      <div className="page3-nav">
        <PageNavigator />
      </div>

      {/* 개별 쿠폰 모달 */}
      {selectedCoupon && (
        <div className="coupon-backdrop" onClick={handleCloseCoupon}>
          <div className="coupon-card" onClick={(e) => e.stopPropagation()}>
            <div className="coupon-paper-stain" />
            <div className="coupon-title">{selectedCoupon.title}</div>
            <div className="coupon-divider" />
            <div className="coupon-desc">{selectedCoupon.desc}</div>
            <button type="button" className="coupon-close-btn" onClick={handleCloseCoupon}>
              쿠폰 닫기
            </button>
          </div>
        </div>
      )}

      {/* 마지막 약속 쿠폰 모달 */}
      {showFinalCoupon && (
        <div className="coupon-backdrop" onClick={handleGoEnd}>
          <div className="coupon-card coupon-final" onClick={(e) => e.stopPropagation()}>
            <div className="coupon-paper-stain" />
            <div className="coupon-title">{finalCoupon.title}</div>
            <div className="coupon-divider" />
            <div className="coupon-desc">{finalCoupon.desc}</div>
            <button type="button" className="coupon-go-end-btn" onClick={handleGoEnd}>
              엔딩으로 가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
