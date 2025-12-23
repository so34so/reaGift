// src/pages/Page2.jsx
import PageNavigator from '../components/PageNavigator.jsx';
import DesktopDragMentBoard from '../components/DesktopDragMentBoard.jsx';
import MobileDragMentBoard from '../components/MobileDragMentBoard.jsx'; // ✅ 추가
import { useDeviceMode } from '../hooks/useDeviceMode';
import './Page2.css';

export default function Page2() {
  const { isMobile } = useDeviceMode();

  return (
    <div className="page2-root">
      <div className="page2-main">
        {isMobile ? <MobileDragMentBoard /> : <DesktopDragMentBoard />}
      </div>

      <div className="page2-nav">
        <PageNavigator />
      </div>
    </div>
  );
}
