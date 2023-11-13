const createNickname = () => {
  const adjective = [
    "뒹굴거리는",
    "심술난",
    "심심한",
    "집에가고싶은",
    "주접떠는",
    "월요병걸린",
    "이프로부족한",
    "오늘은 내가",
    "늦잠자는",
    "돈많은",
  ];

  const noun = [
    "토끼",
    "거북이",
    "상어",
    "다람쥐",
    "나무늘보",
    "알파카",
    "고슴도치",
    "병아리",
    "팬더",
    "강아지",
  ];

  const rand1 = Math.floor(Math.random() * 10);
  const rand2 = Math.floor(Math.random() * 10);

  const nickname = `${adjective[rand1]} ${noun[rand2]}`;

  return nickname;
};

export default createNickname;
