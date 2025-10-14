// ===============================
// 🌤️ Weather App (Vanilla JS版)
// 使用 wttr.in API (免註冊)
// ===============================

// 🔧 API 基本設定：
// 之後若要換成 OpenWeather，只要修改這裡即可。
const apiBase = "https://wttr.in";

// DOM 要素取得
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("city");
const resultDiv = document.getElementById("weatherResult");

// 🔍 檢索按鈕事件監聽
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();

  // 空白檢查
  if (!city) {
    resultDiv.innerHTML = "<p>都市名を入力してください。</p>";
    return;
  }

  try {
    // 🌐 API呼び出し
    // 例: https://wttr.in/Tokyo?format=j1
    const response = await fetch(`${apiBase}/${city}?format=j1`);

    if (!response.ok) {
      throw new Error("APIレスポンスエラー");
    }

    const data = await response.json();

    // 📦 必要データの抽出
    const area = data.nearest_area[0].areaName[0].value;
    const condition = data.current_condition[0].weatherDesc[0].value;
    const temp = data.current_condition[0].temp_C;

    // 🖥️ 結果表示
    resultDiv.innerHTML = `
      <h2>${area} の天気</h2>
      <p>気温：${temp}℃</p>
      <p>状況：${condition}</p>
    `;
  } catch (error) {
    // ❌ エラー時の表示
    resultDiv.innerHTML = "<p>天気情報を取得できませんでした。</p>";
    console.error(error);
  }
});

/* ========================================
🧩 今後の拡張例：
1️⃣ OpenWeatherに切り替える：
   const apiBase = "https://api.openweathermap.org/data/2.5/weather";
   const apiKey = "YOUR_API_KEY";
   fetch(`${apiBase}?q=${city}&appid=${apiKey}&units=metric&lang=ja`);

2️⃣ 天気によって背景変更（晴れ/雨/曇りなど）

3️⃣ 位置情報APIと組み合わせて現在地天気を自動表示
======================================== */
