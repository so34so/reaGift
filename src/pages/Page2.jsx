// src/pages/Page1.jsx
import { isMobile } from 'react-device-detect';
import PageNavigator from '../components/PageNavigator.jsx';
import DesktopMentBoard from '../components/DesktopMentBoard.jsx';
import MobileMentList from '../components/MobileMentList.jsx';
import './Page2.css';

export default function Page2() {
  return (
    <div className="page2-root">
      {/* 위쪽: 본문 영역 */}
      <div className="page2-main">
        {isMobile ? <MobileMentList /> : <DesktopMentBoard />}
      </div>

      {/* 아래쪽: 네비게이터 영역 */}
      <div className="page2-nav">
        <PageNavigator />
      </div>
    </div>
  );
}
