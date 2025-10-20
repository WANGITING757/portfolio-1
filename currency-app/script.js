const API_KEY = "6ce996dcd4c41f876f1624c6"; // 從 https://www.exchangerate-api.com/ 取得
const API_URL = `https://v6.exchangerate-api.com/v6/${"6ce996dcd4c41f876f1624c6"}/latest/`;

const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const amountInput = document.getElementById("amount");
const resultText = document.getElementById("result");
const updatedText = document.getElementById("updated");

const convertBtn = document.getElementById("convert");

// 初期化
async function init() {
  const res = await fetch(API_URL + "JPY");
  const data = await res.json();
  const currencies = Object.keys(data.conversion_rates);

  currencies.forEach(cur => {
    fromSelect.innerHTML += `<option value="${cur}">${cur}</option>`;
    toSelect.innerHTML += `<option value="${cur}">${cur}</option>`;
  });

  fromSelect.value = "JPY";
  toSelect.value = "USD";
}

init();

convertBtn.addEventListener("click", async () => {
  const from = fromSelect.value;
  const to = toSelect.value;
  const amount = amountInput.value;

  if (!amount) {
    resultText.textContent = "金額を入力してください";
    return;
  }

  const res = await fetch(API_URL + from);
  const data = await res.json();
  const rate = data.conversion_rates[to];
  const result = (amount * rate).toFixed(2);

  resultText.textContent = `${amount} ${from} = ${result} ${to}`;
  updatedText.textContent = `更新時間: ${new Date().toLocaleString()}`;
});
