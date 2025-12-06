// src/pages/Page1.jsx
import { isMobile } from 'react-device-detect';
import PageNavigator from '../components/PageNavigator.jsx';
//import DesktopPhotoBoard from '../components/DesktopPhotoBoard.jsx';
//import DesktopPhotoSlider from '../components/DesktopPhotoSlider.jsx';
import DesktopDragMentBoard from '../components/DesktopDragMentBoard.jsx';
// import DesktopMentBoard from '../components/DesktopMentBoard.jsx';
import MobileMentList from '../components/MobileMentList.jsx';
import './Page2.css';

export default function Page2() {
  return (
    <div className="page2-root">
      {/* 위쪽: 본문 영역 */}
      <div className="page2-main">
        {isMobile ? <MobileMentList /> : <DesktopDragMentBoard />}
      </div>

      {/* 아래쪽: 네비게이터 영역 */}
      <div className="page2-nav">
        <PageNavigator />
      </div>
    </div>
  );
}
