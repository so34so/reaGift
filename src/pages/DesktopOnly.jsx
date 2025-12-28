// src/pages/DesktopOnly.jsx
import { isMobile as realIsMobile } from 'react-device-detect';
import { Navigate } from 'react-router-dom';
import './DesktopOnly.css';

export default function DesktopOnly() {
  // 혹시라도 모바일에서 이 페이지로 오면 홈으로 돌려보냄
  if (realIsMobile) return <Navigate to="/" replace />;

  return (
    <div className="only-wrapper">
      <div className="only-card">
        <div className="only-kicker">AMORE</div>
        <h1 className="only-title">모바일에서만 확인할 수 있어요</h1>
        <p className="only-desc">
          이 페이지는 모바일 화면에 최적화되어 있습니다.
          <br />
          휴대폰으로 접속해 주세요.
        </p>

        <div className="only-tips">
          <div className="only-tip">• 휴대폰에서 링크를 다시 열어주세요.</div>
          <div className="only-tip">• 카카오톡/문자/메일로 링크를 보내서 열면 편해요.</div>
        </div>
      </div>
    </div>
  );
}
