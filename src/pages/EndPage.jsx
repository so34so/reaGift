import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EndPageV2.css';

const BG_URL =
  'https://res.cloudinary.com/dkzferide/image/upload/v1766926524/20251221_001342_a9cxpo.jpg';

export default function EndPage() {
  const navigate = useNavigate();
  const [on, setOn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOn(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="endP-wrap">
      <div className="endP-bg" style={{ backgroundImage: `url(${BG_URL})` }} />

      <section className={`endP-polaroid ${on ? 'is-on' : ''}`}>
        <div className="endP-photo" style={{ backgroundImage: `url(${BG_URL})` }} />
        <div className="endP-caption">
          <h1 className="endP-title">지금처럼 행복하게</h1>
          <p className="endP-desc">
            지금까지의 아모레, 이제 시작될 아우,
            <br />
            그리고 그 이후의 레아까지 옆에서 항상 응원할게. 잘 부탁해!!🤍🤍🤍
          </p>

          <div className="endP-actions">
            <button className="endP-btn primary" onClick={() => navigate('/')}>처음으로</button>
            <button className="endP-btn ghost" onClick={() => navigate('/page1')}>사진 다시 보기</button>
          </div>
        </div>
      </section>
    </div>
  );
}
