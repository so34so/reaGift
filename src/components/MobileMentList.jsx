// src/components/MobileMentList.jsx
import { exampleMentList } from '../mentList';
import './MobileMentList.css';

const MobileMentList = () => {
  return (
    <div className="mobile-ment-wrapper">
      {/* 맨 위에 고정될 헤더 */}
      <div className="mobile-ment-header">
        <h2>글 모음집</h2>
        <p>친구들이 남긴 축하 멘트들이에요 💌</p>
      </div>

      {/* 아래 스크롤 가능한 댓글 리스트 */}
      <div className="mobile-ment-list">
        {exampleMentList.map((item) => (
          <div key={item.id} className="mobile-ment-item">
            <div className="mobile-ment-avatar">
              {item.name?.[0] || '친'}
            </div>
            <div className="mobile-ment-bubble">
              <div className="mobile-ment-content">{item.content}</div>
              <div className="mobile-ment-name">- {item.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileMentList;
