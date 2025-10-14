function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();
  if (taskText === "") return;

  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = taskText;

  const delBtn = document.createElement("button");
  delBtn.textContent = "削除";
  delBtn.onclick = function () {
    li.remove();
  };

  li.appendChild(span);
  li.appendChild(delBtn);

  document.getElementById("taskList").appendChild(li);

  input.value = "";
}
// 小互動效果：點擊作品卡時在 console 顯示記錄
document.querySelectorAll('.project-link').forEach(link => {
  link.addEventListener('click', () => {
    console.log('作品ページを開きました:', link.href);
  });
});
