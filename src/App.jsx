// src/App.jsx
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import Page1 from './pages/Page1.jsx';
import Page2 from './pages/Page2.jsx';
import Page3 from './pages/Page3.jsx';
import IntroScreen from './components/IntroScreen.jsx';
import EndPage from './pages/EndPage.jsx';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔸 앱이 처음 로드될 때, /가 아니면 무조건 /로 보내기
  useEffect(() => {
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }
    // 의도적으로 dependency를 비워둔다 (처음 로드 시 한 번만 실행)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      {/* 인트로 화면 */}
      <Route path="/" element={<IntroScreen />} />

      {/* 실제 컨텐츠 페이지들 */}
      <Route path="/page1" element={<Page1 />} />
      <Route path="/page2" element={<Page2 />} />
      <Route path="/page3" element={<Page3 />} />
      <Route path="/end" element={<EndPage />} />

      {/* 혹시 모를 나머지 경로는 전부 /로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
