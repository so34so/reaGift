// src/components/MobileMentList.jsx
import { exampleMentList } from '../mentList';
import './MobileMentList.css';

const MobileMentList = () => {
  return (
    <div className="mobile-ment-wrapper">
      {/* 맨 위 고정 헤더 */}
      <div className="mobile-ment-header">
        <h2>글 모음집</h2>
        <p>친구들이 남긴 축하 멘트들이에요 💌</p>
      </div>

      {/* 아래 스크롤 영역 */}
      <div className="mobile-ment-list">
        {exampleMentList.map((item) => (
          <div key={item.id} className="mobile-ment-item">
            {/* 동그란 메인 이미지(이름 첫 글자) */}
            <div className="mobile-ment-avatar">
              {item.name?.[0] || '친'}
            </div>

            {/* 오른쪽 내용 영역 */}
            <div className="mobile-ment-body">
              <div className="mobile-ment-name-row">
                <span className="mobile-ment-name">{item.name}</span>
                {/* 필요하면 여기에 @id 나 시간 같은 것도 추가 가능 */}
              </div>
              <div className="mobile-ment-content">{item.content}</div>
            </div>
          </div>
        ))}
      </di
