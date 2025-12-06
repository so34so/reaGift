// src/pages/Page2.jsx (지금 Page1.js 이름만 바꿨다 했으니까 맞춰서)
import PageNavigator from '../components/PageNavigator.jsx';
import DesktopDragMentBoard from '../components/DesktopDragMentBoard.jsx';
import MobileMentList from '../components/MobileMentList.jsx';
import { useDeviceMode } from '../hooks/useDeviceMode';
import './Page2.css';

export default function Page2() {
  const { isMobile } = useDeviceMode();

  return (
    <div className="page2-root">
      <div className="page2-main">
        {isMobile ? <MobileMentList /> : <DesktopDragMentBoard />}
      </div>

      <div className="page2-nav">
        <PageNavigator />
      </div>
    </div>
  );
}
