// src/components/SlidingImageField.jsx
import React from 'react';
import { imageList } from '../data/ImageList';
import './SlidingImageField.css';

export default function SlidingImageField({ onImageClick, paused }) {
  return (
    <div className={`slider-wrapper ${paused ? 'paused' : ''}`}>
      {imageList.map((img, idx) => {
        // x 값을 이용해서 세로 위치를 어느 정도 나눠줌 (원하면 조정해도 됨)
        const rowIndex = Number(img.x) || 0;
        const topPercent = 10 + rowIndex * 18; // 10%, 28%, 46%... 이런식으로

        return (
          <img
            key={img.id}
            src={img.url}
            alt={img.name}
            className="slider-img"
            style={{
              top: `${topPercent}%`,
              // 각 이미지마다 속도와 딜레이를 조금씩 다르게 (자연스럽게 보이게)
              animationDuration: `${24 + (idx % 5) * 4}s`,
              animationDelay: `${-idx * 3}s`,
            }}
            onClick={() => onImageClick(img)}
          />
        );
      })}
    </div>
  );
}
