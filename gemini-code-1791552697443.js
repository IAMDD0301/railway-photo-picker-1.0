let allStations = [];
let visitedCodes = JSON.parse(localStorage.getItem('railway_visited')) || [];

// DOM 元素
const elLine = document.getElementById('flip-line');
const elCode = document.getElementById('flip-code');
const elName = document.getElementById('flip-name');
const elBtnDraw = document.getElementById('btn-draw');

const modalResult = document.getElementById('result-modal');
const modalHistory = document.getElementById('history-modal');

// 初始化：載入車站 JSON
fetch('stations.json')
  .then(res => res.json())
  .then(data => {
    allStations = data;
    updateStats();
  })
  .catch(err => console.error("車站資料讀取失敗", err));

// 更新介面數量統計
function updateStats() {
  const total = allStations.length;
  const visited = visitedCodes.length;
  document.getElementById('total-count').textContent = total;
  document.getElementById('visited-count').textContent = visited;
  document.getElementById('remaining-count').textContent = total - visited;
}

// 機械翻牌抽選邏輯
elBtnDraw.addEventListener('click', () => {
  const available = allStations.filter(s => !visitedCodes.includes(s.station_code));
  
  if (available.length === 0) {
    alert("🎉 恭喜！您已完成全台所有鐵路車站的巡禮！可以重置紀錄重新開始！");
    return;
  }

  elBtnDraw.disabled = true;
  
  // 啟動翻牌動畫 (1.5秒快速跳動)
  elLine.classList.add('flipping');
  elCode.classList.add('flipping');
  elName.classList.add('flipping');

  let speed = 80;
  let timer = setInterval(() => {
    const randomStation = available[Math.floor(Math.random() * available.length)];
    elLine.querySelector('.flip-inner').textContent = randomStation.line_name.substring(0, 3);
    elCode.querySelector('.flip-inner').textContent = randomStation.station_code;
    elName.querySelector('.flip-inner').textContent = randomStation.station_name;
  }, speed);

  // 定格並彈出寫真 Modal (1.5 秒後)
  setTimeout(() => {
    clearInterval(timer);
    
    // 隨機選出最終車站
    const finalStation = available[Math.floor(Math.random() * available.length)];
    
    // 停止動畫並寫入資料
    elLine.classList.remove('flipping');
    elCode.classList.remove('flipping');
    elName.classList.remove('flipping');

    elLine.querySelector('.flip-inner').textContent = finalStation.line_name.substring(0, 3);
    elCode.querySelector('.flip-inner').textContent = finalStation.station_code;
    elName.querySelector('.flip-inner').textContent = finalStation.station_name;

    // 存入已造訪紀錄
    visitedCodes.push(finalStation.station_code);
    localStorage.setItem('railway_visited', JSON.stringify(visitedCodes));
    updateStats();

    // 彈出拍立得卡片 (延遲 0.3 秒)
    setTimeout(() => {
      showResultModal(finalStation);
      elBtnDraw.disabled = false;
    }, 300);

  }, 1500);
});

// 填入 Modal 內容
function showResultModal(station) {
  document.getElementById('modal-station-title').textContent = station.station_name + " 火車站";
  document.getElementById('modal-location').textContent = `📍 ${station.city}${station.district}`;
  document.getElementById('modal-tag').textContent = `${station.line_name} | ${station.station_grade}`;
  
  // 假預設照片（可用實際景點圖替換）
  document.getElementById('modal-photo').src = `https://picsum.photos/400/300?random=${station.station_code}`;

  // 渲染景點與美食
  const spotList = document.getElementById('modal-photo-spots');
  spotList.innerHTML = station.photo_spots.map(spot => 
    `<li><strong>${spot.name}</strong> (${spot.distance_text})<br><small style="color:#6B7280">${spot.description}</small></li>`
  ).join('');

  const foodList = document.getElementById('modal-food-spots');
  foodList.innerHTML = station.food_recommendations.map(food => 
    `<li><strong>${food.name}</strong> (${food.distance_text})<br><small style="color:#6B7280">${food.description}</small></li>`
  ).join('');

  modalResult.classList.remove('hidden');
}

// 關閉按鈕事件
document.getElementById('btn-close-modal').onclick = () => modalResult.classList.add('hidden');
document.getElementById('btn-close-history').onclick = () => modalHistory.classList.add('hidden');

// 歷史紀錄按鈕
document.getElementById('btn-history').onclick = () => {
  const listEl = document.getElementById('history-list');
  const visitedStations = allStations.filter(s => visitedCodes.includes(s.station_code));
  
  if(visitedStations.length === 0) {
    listEl.innerHTML = '<li>尚未有造訪紀錄，快按下快門開始旅程吧！</li>';
  } else {
    listEl.innerHTML = visitedStations.map(s => 
      `<li><strong>${s.station_name}</strong> (${s.line_name}) - 代碼: ${s.station_code}</li>`
    ).join('');
  }
  modalHistory.classList.remove('hidden');
};

// 重置紀錄
document.getElementById('btn-reset').onclick = () => {
  if (confirm("確定要重置所有造訪紀錄，重新開始全台巡禮嗎？")) {
    visitedCodes = [];
    localStorage.removeItem('railway_visited');
    updateStats();
    modalHistory.classList.add('hidden');
    alert("紀錄已重置！");
  }
};