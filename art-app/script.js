/* ====== Firebase 設定 ====== */
const firebaseConfig = {
  apiKey: "AIzaSyAvxiR05hoLZh35Whb9Zk3t4ZguzECX300",
  authDomain: "portfolio-gallery-87b9b.firebaseapp.com",
  projectId: "portfolio-gallery-87b9b",
  storageBucket: "portfolio-gallery-87b9b.firebasestorage.app",
  messagingSenderId: "168162871922",
  appId: "1:168162871922:web:62b28e0cbb6f2f317410eb",
  measurementId: "G-KT2HV1WYZ0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

/* ====== artworks data ====== */
let artworks = [
  {
    id: 1,
    title: "うちわ",
    tag: "ファンアート",
    tools: "MediBang Paint / Photoshop",
    desc: "ライブでうちわに描いたイラストは、推しの目に留まることを願って心を込めた作品です。",
    src: "images/うちわ.png",
    isDefault: true
  },
  {
    id: 2,
    title: "狐面",
    tag: "ファンアート",
    tools: "MediBang Paint",
    desc: "アイドルグループのシングルをイメージして、青い狐の面を対称ブラシで描き、不気味で幻想的な雰囲気を表現しました。",
    src: "images/狐面.png",
    isDefault: true
  },
  {
    id: 3,
    title: "秋の湘南",
    tag: "オリジナル",
    tools: "MediBang Paint",
    desc: "秋の江の島、黄昏に染まる茜色の空は、郷愁を誘う静かな美しさを漂わせています。",
    src: "images/秋の湘南.png",
    isDefault: true
  }
];

let currentList = [...artworks];
let currentIndex = 0;
let nextId = 4;
let editingId = null;

/* ====== DOM references ====== */
const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lbImg = lightbox.querySelector("img");
const lbTitle = lightbox.querySelector(".lb-title");
const lbMeta = lightbox.querySelector(".lb-meta");
const lbDesc = lightbox.querySelector(".lb-desc");
const downloadLink = lightbox.querySelector(".download");
const closeBtn = lightbox.querySelector(".close");
const prevBtn = lightbox.querySelector(".prev");
const nextBtn = lightbox.querySelector(".next");
const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const editModal = document.getElementById("editModal");

/* ====== Firebase 資料載入 ====== */
function loadFromFirebase() {
  database.ref('artworks').once('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const uploadedArtworks = Object.keys(data).map(key => ({
        firebaseKey: key,
        ...data[key]
      }));
      
      if (uploadedArtworks.length > 0) {
        artworks = [...artworks.filter(a => a.isDefault), ...uploadedArtworks];
        const maxId = Math.max(...uploadedArtworks.map(a => a.id));
        nextId = maxId + 1;
      }
    }
    renderGallery();
  }).catch(error => {
    console.error('Firebase 載入錯誤:', error);
    renderGallery();
  });
}

/* ====== Firebase 即時監聽 ====== */
database.ref('artworks').on('child_added', (snapshot) => {
  // 初次載入時會觸發，所以要檢查是否已存在
  const newArtwork = { firebaseKey: snapshot.key, ...snapshot.val() };
  const exists = artworks.find(a => a.firebaseKey === snapshot.key);
  
  if (!exists && !newArtwork.isDefault) {
    artworks.push(newArtwork);
    const activeFilter = document.querySelector(".tags button.active").dataset.filter;
    if (activeFilter === "すべて") {
      renderGallery(artworks);
    } else {
      renderGallery(artworks.filter(a => a.tag === activeFilter));
    }
  }
});

database.ref('artworks').on('child_changed', (snapshot) => {
  const updatedArtwork = { firebaseKey: snapshot.key, ...snapshot.val() };
  const index = artworks.findIndex(a => a.firebaseKey === snapshot.key);
  
  if (index !== -1) {
    artworks[index] = updatedArtwork;
    const activeFilter = document.querySelector(".tags button.active").dataset.filter;
    if (activeFilter === "すべて") {
      renderGallery(artworks);
    } else {
      renderGallery(artworks.filter(a => a.tag === activeFilter));
    }
  }
});

database.ref('artworks').on('child_removed', (snapshot) => {
  artworks = artworks.filter(a => a.firebaseKey !== snapshot.key);
  const activeFilter = document.querySelector(".tags button.active").dataset.filter;
  if (activeFilter === "すべて") {
    renderGallery(artworks);
  } else {
    renderGallery(artworks.filter(a => a.tag === activeFilter));
  }
});

/* ====== render gallery ====== */
function renderGallery(list = artworks) {
  gallery.innerHTML = "";
  currentList = list;
  
  list.forEach((a, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.index = i;
    card.dataset.id = a.id;
    card.dataset.tag = a.tag;
    
    card.innerHTML = `
      <div class="thumb" role="img" aria-label="${a.title}" style="background-image:url('${a.src}')"></div>
      <div class="card-body">
        <h3 class="title">${a.title}</h3>
        <p class="meta">${a.tools} • ${a.tag}</p>
      </div>
      <div class="card-actions">
        <button class="icon-btn edit" aria-label="編集">✏️</button>
        ${!a.isDefault ? '<button class="icon-btn delete" aria-label="削除">🗑️</button>' : ''}
      </div>
    `;
    
    const cardBody = card.querySelector(".card-body");
    const thumb = card.querySelector(".thumb");
    cardBody.addEventListener("click", () => openLightbox(i));
    thumb.addEventListener("click", () => openLightbox(i));
    
    const editBtn = card.querySelector(".icon-btn.edit");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditModal(a.id, a.firebaseKey);
    });
    
    const deleteBtn = card.querySelector(".icon-btn.delete");
    if (deleteBtn && !a.isDefault) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteArtwork(a.firebaseKey);
      });
    }
    
    gallery.appendChild(card);
  });
}

/* ====== filter by tag ====== */
document.querySelectorAll(".tags button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tags button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    if (filter === "すべて") {
      renderGallery(artworks);
    } else {
      renderGallery(artworks.filter(a => a.tag === filter));
    }
  });
});

/* ====== open lightbox ====== */
function openLightbox(index){
  currentIndex = index;
  const a = currentList[index];
  lbImg.src = a.src;
  lbImg.alt = a.title;
  lbTitle.textContent = a.title;
  lbMeta.textContent = `${a.tools} • ${a.tag}`;
  lbDesc.textContent = a.desc;
  downloadLink.href = a.src;
  downloadLink.download = a.title;
  lightbox.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}

/* ====== close lightbox ====== */
function closeLightbox(){
  lightbox.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

/* ====== prev / next ====== */
function showNext(dir){
  currentIndex = (currentIndex + dir + currentList.length) % currentList.length;
  openLightbox(currentIndex);
}

/* ====== lightbox events ====== */
closeBtn.addEventListener("click", closeLightbox);
prevBtn.addEventListener("click", ()=> showNext(-1));
nextBtn.addEventListener("click", ()=> showNext(1));
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

/* ====== keyboard navigation ====== */
window.addEventListener("keydown", (e) => {
  if (lightbox.getAttribute("aria-hidden") === "false") {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showNext(-1);
    if (e.key === "ArrowRight") showNext(1);
  }
  if (editModal.classList.contains("show") && e.key === "Escape") {
    closeEditModal();
  }
});

/* ====== ファイルアップロード ====== */
fileInput.addEventListener("change", handleFiles);

function handleFiles(e) {
  const files = e.target.files;
  
  Array.from(files).forEach(file => {
    if (file.type.startsWith("image/")) {
      // 顯示上傳中提示
      uploadArea.style.opacity = "0.5";
      uploadArea.querySelector("p").textContent = "アップロード中...";
      
      // 上傳到 Firebase Storage
      const storageRef = storage.ref(`artworks/${Date.now()}_${file.name}`);
      const uploadTask = storageRef.put(file);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          uploadArea.querySelector("p").textContent = `アップロード中... ${Math.round(progress)}%`;
        },
        (error) => {
          console.error('アップロードエラー:', error);
          alert('アップロードに失敗しました');
          uploadArea.style.opacity = "1";
          uploadArea.querySelector("p").textContent = "クリックまたはドラッグ&ドロップで画像を追加";
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            const newArtwork = {
              id: nextId++,
              title: file.name.replace(/\.[^/.]+$/, ""),
              tag: "オリジナル",
              tools: "アップロード画像",
              desc: "新しくアップロードされた画像です。編集ボタンから詳細を追加できます。",
              src: downloadURL,
              storagePath: `artworks/${Date.now()}_${file.name}`,
              uploadedAt: new Date().toISOString()
            };
            
            // Firebase に保存
            database.ref('artworks').push(newArtwork)
              .then(() => {
                uploadArea.style.opacity = "1";
                uploadArea.querySelector("p").textContent = "アップロード完了！";
                setTimeout(() => {
                  uploadArea.querySelector("p").textContent = "クリックまたはドラッグ&ドロップで画像を追加";
                }, 2000);
              })
              .catch(error => {
                console.error('データベース保存エラー:', error);
                alert('保存に失敗しました');
              });
          });
        }
      );
    }
  });
  
  fileInput.value = "";
}

/* ====== ドラッグ&ドロップ ====== */
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
  const files = e.dataTransfer.files;
  fileInput.files = files;
  handleFiles({ target: { files } });
});

/* ====== 削除機能 ====== */
function deleteArtwork(firebaseKey) {
  if (!firebaseKey) return;
  
  if (confirm("この作品を削除しますか？")) {
    const artwork = artworks.find(a => a.firebaseKey === firebaseKey);
    
    // Storage から画像削除
    if (artwork && artwork.storagePath) {
      storage.ref(artwork.storagePath).delete()
        .catch(error => console.error('画像削除エラー:', error));
    }
    
    // Database から削除
    database.ref(`artworks/${firebaseKey}`).remove()
      .catch(error => {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
      });
  }
}

/* ====== 編集モーダル表示 ====== */
function openEditModal(id, firebaseKey) {
  editingId = { id, firebaseKey };
  const artwork = artworks.find(a => a.id === id);
  if (artwork) {
    document.getElementById("editTitle").value = artwork.title;
    document.getElementById("editTools").value = artwork.tools;
    document.getElementById("editTag").value = artwork.tag;
    document.getElementById("editDesc").value = artwork.desc;
    editModal.classList.add("show");
  }
}

/* ====== 編集モーダル閉じる ====== */
function closeEditModal() {
  editModal.classList.remove("show");
  editingId = null;
}

/* ====== 編集保存 ====== */
function saveEdit() {
  const artwork = artworks.find(a => a.id === editingId.id);
  if (artwork) {
    const updatedData = {
      title: document.getElementById("editTitle").value,
      tools: document.getElementById("editTools").value,
      tag: document.getElementById("editTag").value,
      desc: document.getElementById("editDesc").value
    };
    
    // デフォルト作品の場合はローカルのみ更新
    if (artwork.isDefault) {
      Object.assign(artwork, updatedData);
      const activeFilter = document.querySelector(".tags button.active").dataset.filter;
      if (activeFilter === "すべて") {
        renderGallery(artworks);
      } else {
        renderGallery(artworks.filter(a => a.tag === activeFilter));
      }
      closeEditModal();
    } else {
      // Firebase の作品を更新
      database.ref(`artworks/${editingId.firebaseKey}`).update(updatedData)
        .then(() => {
          closeEditModal();
        })
        .catch(error => {
          console.error('更新エラー:', error);
          alert('更新に失敗しました');
        });
    }
  }
}

/* ====== init ====== */
loadFromFirebase();