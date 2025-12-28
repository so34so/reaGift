// src/components/PageNavigator.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import './PageNavigator.css';

const pagePaths = ['/page1', '/page2', '/page3'];  // ✅ 변경 포인트

export default function PageNavigator() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = pagePaths.indexOf(location.pathname);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;

  const goPrev = () => {
    const next = (safeIndex - 1 + pagePaths.length) % pagePaths.length;
    navigate(pagePaths[next]);
  };

  const goNext = () => {
    const next = (safeIndex + 1) % pagePaths.length;
    navigate(pagePaths[next]);
  };

  return (
    <div className="nav-wrapper">
      <button type="button" className="nav-arrow" onClick={goPrev}>◀</button>

      <div className="nav-dots">
        {pagePaths.map((path, idx) => (
          <button
            type="button" 
            key={path}
            className={`nav-dot ${idx === safeIndex ? 'active' : ''}`}
            onClick={() => navigate(path)}
          />
        ))}
      </div>

      <button type="button" className="nav-arrow" onClick={goNext}>▶</button>
    </div>
  );
}
