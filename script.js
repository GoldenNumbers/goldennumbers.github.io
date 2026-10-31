const gameCards = [...document.querySelectorAll(".game-card")];
const gameGrid = document.getElementById("gameGrid");
const gameFilters = document.getElementById("gameFilters");
const globalSearch = document.getElementById("globalSearch");
const gameCount = document.getElementById("gameCount");
const overlay = document.getElementById("playerOverlay");
const gameFrame = document.getElementById("gameFrame");
const playerTitle = document.getElementById("playerTitle");
const closePlayer = document.getElementById("closePlayer");
const videoGrid = document.getElementById("videoGrid");
const videoForm = document.getElementById("videoForm");
const videoInput = document.getElementById("videoInput");
const videoCategory = document.getElementById("videoCategory");
const videoCount = document.getElementById("videoCount");
let activeGameFilter = "all";
let activeVideoFilter = "all";
let videos = [];
try { videos = JSON.parse(localStorage.getItem("golden-internet-videos") || "[]"); } catch { videos = []; }

function openGame(card) {
  const src = card.dataset.src;
  if (!src) return;
  playerTitle.textContent = `Playing ${card.dataset.title}`;
  gameFrame.src = src;
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  closePlayer.focus();
}
function shutPlayer() {
  overlay.hidden = true;
  gameFrame.src = "about:blank";
  document.body.style.overflow = "";
}
gameCards.forEach(card => card.querySelector(".play-button").addEventListener("click", () => openGame(card)));
closePlayer.addEventListener("click", shutPlayer);
overlay.addEventListener("click", e => { if (e.target === overlay) shutPlayer(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !overlay.hidden) shutPlayer(); });

function filterGames() {
  const term = globalSearch.value.trim().toLowerCase();
  let shown = 0;
  gameCards.forEach(card => {
    const matchesCategory = activeGameFilter === "all" || card.dataset.category === activeGameFilter;
    const matchesSearch = !term || card.dataset.title.toLowerCase().includes(term);
    card.hidden = !(matchesCategory && matchesSearch);
    if (!card.hidden) shown++;
  });
  gameCount.textContent = `${shown} ${shown === 1 ? "game" : "games"}`;
}
gameFilters.addEventListener("click", e => {
  const button = e.target.closest("[data-filter]");
  if (!button) return;
  activeGameFilter = button.dataset.filter;
  gameFilters.querySelectorAll(".filter-chip").forEach(b => b.classList.toggle("selected", b === button));
  filterGames();
});
globalSearch.addEventListener("input", () => { filterGames(); renderVideos(); });
document.addEventListener("keydown", e => {
  if (e.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) {
    e.preventDefault(); globalSearch.focus();
  }
});

function getVideoId(raw) {
  const value = raw.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be" || url.hostname === "www.youtu.be") return url.pathname.split("/").filter(Boolean)[0] || null;
    if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const parts = url.pathname.split("/").filter(Boolean);
      if (["embed","shorts","live"].includes(parts[0])) return parts[1] || null;
    }
  } catch {}
  return null;
}
function saveVideos() {
  localStorage.setItem("golden-internet-videos", JSON.stringify(videos));
}
function renderVideos() {
  const term = globalSearch.value.trim().toLowerCase();
  const shown = videos.filter(v => (activeVideoFilter === "all" || v.category === activeVideoFilter) &&
    (!term || v.title.toLowerCase().includes(term) || v.category.toLowerCase().includes(term)));
  videoCount.textContent = `${shown.length} ${shown.length === 1 ? "video" : "videos"}`;
  videoGrid.innerHTML = "";
  if (!shown.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<div>▶</div><h3>Your video shelf is ready</h3><p>Add a YouTube video above to create your own collection.</p>";
    videoGrid.append(empty); return;
  }
  shown.forEach(video => {
    const card = document.createElement("article");
    card.className = "video-card";
    const img = document.createElement("img");
    img.className = "video-thumb";
    img.src = `https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`;
    img.alt = `Thumbnail for ${video.title}`;
    img.loading = "lazy";
    const info = document.createElement("div"); info.className = "video-info";
    const details = document.createElement("div");
    const cat = document.createElement("span"); cat.className = "video-category"; cat.textContent = video.category;
    const title = document.createElement("h3"); title.textContent = video.title;
    details.append(cat, title);
    const actions = document.createElement("div"); actions.className = "video-actions";
    const play = document.createElement("button"); play.className = "small-action"; play.textContent = "▶ Play";
    play.addEventListener("click", () => playVideo(video));
    const remove = document.createElement("button"); remove.className = "small-action"; remove.textContent = "✕"; remove.setAttribute("aria-label", `Remove ${video.title}`);
    remove.addEventListener("click", () => { videos = videos.filter(v => v.id !== video.id); saveVideos(); renderVideos(); });
    actions.append(play, remove); info.append(details, actions); card.append(img, info); videoGrid.append(card);
  });
}
function playVideo(video) {
  playerTitle.textContent = `Watching ${video.title}`;
  gameFrame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&rel=0`;
  overlay.hidden = false; document.body.style.overflow = "hidden"; closePlayer.focus();
}
videoForm.addEventListener("submit", e => {
  e.preventDefault();
  const id = getVideoId(videoInput.value);
  if (!id) { videoInput.setCustomValidity("Enter a valid YouTube video URL or 11-character video ID."); videoInput.reportValidity(); return; }
  videoInput.setCustomValidity("");
  if (videos.some(v => v.id === id)) { videoInput.setCustomValidity("That video is already in your shelf."); videoInput.reportValidity(); return; }
  const category = videoCategory.value;
  videos.unshift({id, category, title: `YouTube video (${id})`});
  saveVideos(); renderVideos(); videoInput.value = "";
});
document.getElementById("videoFilters").addEventListener("click", e => {
  const button = e.target.closest("[data-filter]"); if (!button) return;
  activeVideoFilter = button.dataset.filter;
  document.querySelectorAll("#videoFilters .filter-chip").forEach(b => b.classList.toggle("selected", b === button));
  renderVideos();
});
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("night");
  localStorage.setItem("golden-internet-theme", document.body.classList.contains("night") ? "night" : "day");
});
if (localStorage.getItem("golden-internet-theme") === "night") document.body.classList.add("night");
filterGames(); renderVideos();
