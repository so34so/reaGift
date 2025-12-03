// src/pages/Page1.jsx
import MovingMent from '../components/MovingMent.jsx';
import PageNavigator from '../components/PageNavigator.jsx';
import './Page2.css';

export default function Page2() {
  return (
    <div className="page1-root">
      {/* 위쪽: 카드가 흘러다니는 영역 */}
      <div className="page1-main">
        <MovingMent />
      </div>

      {/* 아래쪽: 네비게이터 영역 */}
      <div className="page1-nav">
        <PageNavigator />
      </div>
    </div>
  );
}