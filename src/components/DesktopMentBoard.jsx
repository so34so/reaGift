// src/components/DesktopMentBoard.jsx
import { exampleMentList } from '../mentList';
import './DesktopMentBoard.css';

const DesktopMentBoard = () => {
  return (
    <div className="board-wrapper">
      <div className="board-inner">
        {exampleMentList.map((item) => (
          <div key={item.id} className="sticky-card">
            <div className="sticky-pin" />
            <div className="sticky-line1">{item.content}</div>
            <div className="sticky-line2">- {item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesktopMentBoard;
