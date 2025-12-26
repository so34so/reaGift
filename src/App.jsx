import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { isMobile as realIsMobile } from 'react-device-detect';

import Page1 from './pages/Page1.jsx';
import Page2 from './pages/Page2.jsx';
import Page3 from './pages/Page3.jsx';
import IntroScreen from './components/IntroScreen.jsx';
import IntroScreenMobile from './components/IntroScreenMobile.jsx';
import EndPage from './pages/EndPage.jsx';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // 모바일/데스크탑 인트로 선택
  const Intro = useMemo(() => (realIsMobile ? IntroScreenMobile : IntroScreen), []);

  useEffect(() => {
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Intro />} />

      <Route path="/page1" element={<Page1 />} />
      <Route path="/page2" element={<Page2 />} />
      <Route path="/page3" element={<Page3 />} />
      <Route path="/end" element={<EndPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
