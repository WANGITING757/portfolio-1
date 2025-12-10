/* ====== artworks data ======
 Place your image files in `images/` and update filenames here.
 Each object: {id, title, tag, tools, desc, src}
================================= */
let artworks = [
  {
    id: 1,
    title: "うちわ",
    tag: "ファンアート",
    tools: "MediBang Paint / Photoshop",
    desc: "ライブでうちわに描いたイラストは、推しの目に留まることを願って心を込めた作品です。",
    src: "images/うちわ.png"
  },
  {
    id: 2,
    title: "狐面",
    tag: "ファンアート",
    tools: "MediBang Paint",
    desc: "アイドルグループのシングルをイメージして、青い狐の面を対称ブラシで描き、不気味で幻想的な雰囲気を表現しました。",
    src: "images/狐面.png"
  },
  {
    id: 3,
    title: "秋の湘南",
    tag: "オリジナル",
    tools: "MediBang Paint",
    desc: "秋の江の島、黄昏に染まる茜色の空は、郷愁を誘う静かな美しさを漂わせています。",
    src: "images/秋の湘南.png"
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
        <button class="icon-btn delete" aria-label="削除">🗑️</button>
      </div>
    `;
    
    // カードクリックでLightbox表示
    const cardBody = card.querySelector(".card-body");
    const thumb = card.querySelector(".thumb");
    cardBody.addEventListener("click", () => openLightbox(i));
    thumb.addEventListener("click", () => openLightbox(i));
    
    // 編集ボタン
    const editBtn = card.querySelector(".icon-btn.edit");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditModal(a.id);
    });
    
    // 削除ボタン
    const deleteBtn = card.querySelector(".icon-btn.delete");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteArtwork(a.id);
    });
    
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const newArtwork = {
          id: nextId++,
          title: file.name.replace(/\.[^/.]+$/, ""),
          tag: "オリジナル",
          tools: "アップロード画像",
          desc: "新しくアップロードされた画像です。編集ボタンから詳細を追加できます。",
          src: event.target.result
        };
        artworks.push(newArtwork);
        
        // 現在のフィルターを維持
        const activeFilter = document.querySelector(".tags button.active").dataset.filter;
        if (activeFilter === "すべて") {
          renderGallery(artworks);
        } else {
          renderGallery(artworks.filter(a => a.tag === activeFilter));
        }
      };
      reader.readAsDataURL(file);
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
function deleteArtwork(id) {
  if (confirm("この作品を削除しますか？")) {
    artworks = artworks.filter(a => a.id !== id);
    
    // 現在のフィルターを維持
    const activeFilter = document.querySelector(".tags button.active").dataset.filter;
    if (activeFilter === "すべて") {
      renderGallery(artworks);
    } else {
      renderGallery(artworks.filter(a => a.tag === activeFilter));
    }
  }
}

/* ====== 編集モーダル表示 ====== */
function openEditModal(id) {
  editingId = id;
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
  const artwork = artworks.find(a => a.id === editingId);
  if (artwork) {
    artwork.title = document.getElementById("editTitle").value;
    artwork.tools = document.getElementById("editTools").value;
    artwork.tag = document.getElementById("editTag").value;
    artwork.desc = document.getElementById("editDesc").value;
    
    // 現在のフィルターを維持
    const activeFilter = document.querySelector(".tags button.active").dataset.filter;
    if (activeFilter === "すべて") {
      renderGallery(artworks);
    } else {
      renderGallery(artworks.filter(a => a.tag === activeFilter));
    }
    closeEditModal();
  }
}

/* ====== init ====== */
renderGallery();

/* Accessibility: lazy load suggestion (small enhancement)
   For 2-3 images it's fine, but if many images use IntersectionObserver to lazy-load real <img> elements.
*/