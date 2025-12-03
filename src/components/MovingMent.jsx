// src/components/MovingMent.jsx
import { useMemo } from 'react';
import { exampleMentList } from '../mentList';
import './MovingMent.css';

const MovingMent = () => {
  const configs = useMemo(() => {
    return exampleMentList.map(() => ({
      top: Math.random() * 100,          // 0% ~ 100% 전체 범위
      duration: 14 + Math.random() * 6,  // 14 ~ 20초
      delay: -Math.random() * 20,        // -20 ~ 0초
    }));
  }, []);

  return (
    <div className="moving-wrapper theme-soft">
      {exampleMentList.map((item, index) => {
        const cfg = configs[index];
        return (
          <span
            key={item.id}
            className="moving-text"
            style={{
              top: `${cfg.top}%`,
              animationDuration: `${cfg.duration}s`,
              animationDelay: `${cfg.delay}s`,
            }}
          >
            <div className="ment-card">
              <div className="ment-line1">{item.content}</div>
              <div className="ment-line2">- {item.name}</div>
            </div>
          </span>
        );
      })}
    </div>
  );
};

export default MovingMent;