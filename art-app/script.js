/* ====== artworks data ======
 Place your image files in `images/` and update filenames here.
 Each object: {id, title, tag, tools, desc, src}
================================= */
const artworks = [
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
let currentList = artworks;

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

/* current index */
let currentIndex = 0;

/* render gallery */
function renderGallery(list = artworks) {
  gallery.innerHTML = "";
  currentList = list; // ← 記住目前顯示的作品列表
  list.forEach((a, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.index = i;
    card.dataset.tag = a.tag;
    card.innerHTML = `
      <div class="thumb" role="img" aria-label="${a.title}" style="background-image:url('${a.src}')"></div>
      <div class="card-body">
        <h3 class="title">${a.title}</h3>
        <p class="meta">${a.tools} • ${a.tag}</p>
      </div>
    `;
    card.addEventListener("click", () => openLightbox(i));
    gallery.appendChild(card);
  });
}


/* filter by tag */
document.querySelectorAll(".tags button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tags button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    if (filter === "すべて") renderGallery(artworks);
    else renderGallery(artworks.filter(a => a.tag === filter));
  });
});

/* open lightbox */
function openLightbox(index){
  currentIndex = index;
  const a = currentList[index];
  lbImg.src = a.src;
  lbImg.alt = a.title;
  lbTitle.textContent = a.title;
  lbMeta.textContent = `${a.tools} • ${a.tag}`;
  lbDesc.textContent = a.desc;
  downloadLink.href = a.src;
  lightbox.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}

/* close */
function closeLightbox(){
  lightbox.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

/* prev / next */
function showNext(dir){
  currentIndex = (currentIndex + dir + currentList.length) % currentList.length;
  openLightbox(currentIndex);
}

/* events */
closeBtn.addEventListener("click", closeLightbox);
prevBtn.addEventListener("click", ()=> showNext(-1));
nextBtn.addEventListener("click", ()=> showNext(1));
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

/* keyboard navigation */
window.addEventListener("keydown", (e) => {
  if (lightbox.getAttribute("aria-hidden") === "false") {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showNext(-1);
    if (e.key === "ArrowRight") showNext(1);
  }
});

/* init */
renderGallery();

/* Accessibility: lazy load suggestion (small enhancement)
   For 2-3 images it's fine, but if many images use IntersectionObserver to lazy-load real <img> elements.
*/
