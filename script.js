const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");
const searchInput = document.getElementById("cardSearch");
const cards = [...document.querySelectorAll(".feature-card")];
const noResults = document.getElementById("noResults");

function applyTheme(theme) {
  document.body.classList.toggle("night", theme === "night");
  themeLabel.textContent = theme === "night" ? "Moonlight" : "Daylight";
  themeToggle.querySelector(".sun-icon").textContent = theme === "night" ? "☾" : "☼";
  try { localStorage.setItem("goldeninternet-theme", theme); } catch (_) {}
}

let savedTheme = "day";
try { savedTheme = localStorage.getItem("goldeninternet-theme") || "day"; } catch (_) {}
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  applyTheme(document.body.classList.contains("night") ? "day" : "night");
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  cards.forEach(card => {
    const text = `${card.dataset.search} ${card.innerText}`.toLowerCase();
    const match = text.includes(query);
    card.hidden = !match;
    if (match) visible++;
  });
  noResults.hidden = visible !== 0;
});
