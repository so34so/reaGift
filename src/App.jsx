// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Page1 from './pages/Page1.jsx';
import Page2 from './pages/Page2.jsx';
import Page3 from './pages/Page3.jsx';
import IntroScreen from './components/IntroScreen.jsx';
import EndPage from './pages/EndPage.jsx';

function App() {
  return (
    <Routes>
      {/* 인트로 화면 */}
      <Route path="/" element={<IntroScreen />} />

      {/* 실제 컨텐츠 페이지들 */}
      <Route path="/page1" element={<Page1 />} />
      <Route path="/page2" element={<Page2 />} />
      <Route path="/page3" element={<Page3 />} />

      <Route path="/end" element={<EndPage />} />
      
    </Routes>
  );
}

export default App;
