// src/components/DesktopMentBoard.jsx
import { useMemo } from 'react';
import { exampleMentList } from '../mentList';
import './DesktopMentBoard.css';

const DesktopMentBoard = () => {
  // 랜덤 위치 / 회전값: 첫 렌더에서만 생성
  const configs = useMemo(
    () =>
      exampleMentList.map(() => ({
        top: 15 + Math.random() * 70,    // 15% ~ 85%
        left: 10 + Math.random() * 80,   // 10% ~ 90%
        rotate: Math.random() * 10 - 5,  // -5 ~ +5 deg
      })),
    []
  );

  return (
    <div className="board-wrapper">
      {exampleMentList.map((item, index) => {
        const cfg = configs[index];
        return (
          <div
            key={item.id}
            className="sticky-card"
            style={{
              top: `${cfg.top}%`,
              left: `${cfg.left}%`,
              transform: `translate(-50%, -50%) rotate(${cfg.rotate}deg)`,
            }}
          >
            <div className="sticky-pin" />
            <div className="sticky-line1">{item.content}</div>
            <div className="sticky-line2">- {item.name}</div>
          </div>
        );
      })}
    </div>
  );
};

export default DesktopMentBoard;
