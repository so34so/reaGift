// src/data/introImages.js
export const introImages = [
  {
    id: '1',
    url: 'https://res.cloudinary.com/dkzferide/image/upload/v1766446814/G7_CrVHacAAWIbd_mkexa3.jpg',
    name: '아모레로 좋은 추억을 만들어준 레아야 고마워',
    content: '🤍🤍 레아야 사랑해!😘😘😘 🤍🤍',

    // ✅ 모바일에서 더 짧게(추천)
    mobileName: '항상 행복한 웃음을 만들어준 레아야 고마워!!!',
    mobileContent: '🤍🤍 레아야 사랑해!😘😘😘 🤍🤍',

    // ✅ cover 크롭 시 “얼굴이 위로 잘려서” 문제면 세로 포커스를 위로 올리기
    // '50% 20%' / '50% 15%' 이런 식으로 조절
    focus: '50% 20%',
  },
    {
    id: '2',
    url: 'https://res.cloudinary.com/dkzferide/image/upload/v1764153114/GwXwWRpXIAA21DfR_gym7ux.jpg', // public/images/friend-main.jpg 이런 식으로
    name: 'teset1',
    content: 'tset1',
  }
];

export const MAIN_INTRO_ID = '1';
