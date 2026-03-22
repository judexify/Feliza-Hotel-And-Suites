const CSV_URLS = {
  food: CONFIG.CSV_FOOD,
  drinks: CONFIG.CSV_DRINKS,
};

const CAROUSEL_IMAGES = [
  "img/hero1.jpeg",
  "img/hero2.jpeg",
  "img/hero3.jpeg",
  "img/hero4.jpeg",
];

const TIMEOUT_MS = 5000;

let menuData = [];
let pillsByTab = { food: [], drinks: [] };
let currentSlide = 0;

const DOM = {
  slidesContainer: document.querySelector(".hero__slides"),
  dotsContainer: document.querySelector(".hero__dots"),
  overlay: document.querySelector(".hero__overlay"),
  heroContent: document.getElementById("heroContent"),
  pillBar: document.getElementById("pillBar"),
  menuBody: document.getElementById("menuBody"),
  tabs: document.querySelectorAll(".tab-btn"),
  searchInput: document.getElementById("searchInput"),
  searchClear: document.getElementById("searchClear"),
  themeToggle: document.getElementById("themeToggle"),
  toggleIcon: document.getElementById("toggleIcon"),
  footerYear: document.getElementById("footerYear"),
  backToTop: document.getElementById("backToTop"),
};

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const formatPrice = (amount) => "₦" + amount.toLocaleString("en-NG") + ".00";

const getActiveTab = () =>
  document.querySelector(".tab-btn.active").dataset.tab;

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(isDark) {
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light",
  );
  DOM.toggleIcon.textContent = isDark ? "☀" : "☽";
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  applyTheme(!isDark);
}

function createSlide(url, isFirst) {
  const slide = document.createElement("div");
  slide.classList.add("hero__slide");
  if (isFirst) slide.classList.add("active");
  slide.style.backgroundImage = `url('${url}')`;
  const img = new Image();
  img.src = url;
  img.onload = () => slide.classList.add("loaded");
  return slide;
}

function createDot(isFirst) {
  const dot = document.createElement("span");
  dot.classList.add("hero__dot");
  if (isFirst) dot.classList.add("active");
  return dot;
}

function goToSlide(index, slides, dots) {
  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");
  currentSlide = index % slides.length;
  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
  DOM.overlay.style.opacity = "1";
  DOM.heroContent.classList.remove("hidden");
}

function initCarousel() {
  CAROUSEL_IMAGES.forEach((url, i) => {
    DOM.slidesContainer.appendChild(createSlide(url, i === 0));
    DOM.dotsContainer.appendChild(createDot(i === 0));
  });

  const slides = document.querySelectorAll(".hero__slide");
  const dots = document.querySelectorAll(".hero__dot");

  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => goToSlide(i, slides, dots)),
  );
  setInterval(() => goToSlide(currentSlide + 1, slides, dots), 4500);
}

function getScrollOffset() {
  const navbarH = document.querySelector(".navbar").offsetHeight;
  const pillBarH = document.querySelector(".pill-bar").offsetHeight;
  return navbarH + pillBarH + 16;
}

function scrollToSection(label) {
  const target = document.getElementById(slugify(label));
  if (!target) return;
  const top =
    target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
  window.scrollTo({ top, behavior: "smooth" });
}

function createPill(label, isFirst) {
  const btn = document.createElement("button");
  btn.className = "pill" + (isFirst ? " active" : "");
  btn.textContent = label;
  btn.addEventListener("click", () => onPillClick(btn, label));
  return btn;
}

function onPillClick(btn, label) {
  document
    .querySelectorAll(".pill")
    .forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  if (DOM.searchInput.value) clearSearch();
  scrollToSection(label);
}

function renderPills(tab) {
  DOM.pillBar.innerHTML = "";
  pillsByTab[tab].forEach((label, i) => {
    DOM.pillBar.appendChild(createPill(label, i === 0));
  });
}

function clearSearch() {
  DOM.searchInput.value = "";
  DOM.searchClear.classList.remove("visible");
  renderMenu(getActiveTab());
}

function onSearchInput() {
  const query = DOM.searchInput.value;
  DOM.searchClear.classList.toggle("visible", query.length > 0);
  renderMenu(getActiveTab(), query);
}

function filterSection(section, q) {
  if (!q) return section;
  if (section.label.toLowerCase().includes(q)) return section;
  const matchedItems = section.items.filter((item) =>
    item.name.toLowerCase().includes(q),
  );
  return matchedItems.length ? { ...section, items: matchedItems } : null;
}

function filterSections(tab, q) {
  return menuData
    .filter((section) => (q ? true : section.tab === tab))
    .map((section) => filterSection(section, q))
    .filter(Boolean);
}

function createPriceEl(price) {
  const el = document.createElement("span");
  el.className = "menu-item__price";
  el.textContent = formatPrice(price);
  return el;
}

function createNameEl(name) {
  const el = document.createElement("span");
  el.className = "menu-item__name";
  el.textContent = name;

  el.addEventListener("click", () => {
    const isTruncated = el.scrollWidth > el.clientWidth;
    if (isTruncated || el.classList.contains("expanded")) {
      el.classList.toggle("expanded");
    }
  });

  requestAnimationFrame(() => {
    if (el.scrollWidth > el.clientWidth) el.classList.add("expandable");
  });

  return el;
}

function createMenuItem(item) {
  const row = document.createElement("div");
  row.className = "menu-item";
  const dots = document.createElement("span");
  dots.className = "menu-item__dots";
  row.appendChild(createNameEl(item.name));
  row.appendChild(dots);
  row.appendChild(createPriceEl(item.price));
  return row;
}

function createMenuGrid(items) {
  const grid = document.createElement("div");
  grid.className = "menu-grid";
  [...items]
    .sort((a, b) => a.price - b.price)
    .forEach((item) => {
      grid.appendChild(createMenuItem(item));
    });
  return grid;
}

function createBadge(tab) {
  const badge = document.createElement("span");
  badge.className = "menu-section__badge";
  badge.textContent = tab === "food" ? "FOOD" : "DRINKS";
  return badge;
}

function createSectionHeader(section, q) {
  const header = document.createElement("div");
  header.className = "menu-section__header";
  header.textContent = section.label;
  if (q) header.appendChild(createBadge(section.tab));
  return header;
}

function renderSection(section, q) {
  const sec = document.createElement("div");
  sec.className = "menu-section";
  sec.id = slugify(section.label);
  sec.appendChild(createSectionHeader(section, q));
  sec.appendChild(createMenuGrid(section.items));
  sectionObserver.observe(sec);
  DOM.menuBody.appendChild(sec);
}

function renderMenu(tab, query = "") {
  DOM.menuBody.innerHTML = "";
  const q = query.toLowerCase().trim();
  const filtered = filterSections(tab, q);

  if (filtered.length === 0) {
    renderEmpty(query);
    return;
  }

  filtered.forEach((section) => renderSection(section, q));
}

function renderLoading() {
  DOM.menuBody.innerHTML = `
    <div class="menu-loading">
      <div class="menu-loading__spinner"></div>
      <p class="menu-loading__text">Loading menu...</p>
    </div>
  `;
}

function renderEmpty(query) {
  DOM.menuBody.innerHTML = `
    <div class="menu-empty">
      <div class="menu-empty__icon">🍽</div>
      <p class="menu-empty__text">No results for "<strong>${query}</strong>"</p>
      <p class="menu-empty__sub">Try searching by item name or category</p>
    </div>
  `;
}

function renderError() {
  DOM.menuBody.innerHTML = `
    <div class="menu-empty">
      <div class="menu-empty__icon">⚠️</div>
      <p class="menu-empty__text">Failed to load menu</p>
      <p class="menu-empty__sub">Please check your connection and refresh the page</p>
    </div>
  `;
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        sectionObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

function parseCSVLine(line) {
  const cols = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cols.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cols.push(current.trim());
  return cols;
}

function parseCSV(text, tab) {
  const lines = text.trim().split("\n").slice(2);
  const sections = {};

  lines.forEach((line) => {
    const cols = parseCSVLine(line.replace(/\r/g, ""));
    const label = cols[0];
    const name = cols[1];

    const priceRaw = [...cols].reverse().find((c) => c.trim() !== "");
    const price = parseInt(priceRaw?.replace(/,/g, ""), 10);
    if (!label || !name || isNaN(price)) return;
    if (!sections[label]) sections[label] = [];
    sections[label].push({ name, price });
  });

  return Object.entries(sections).map(([label, items]) => ({
    tab,
    label,
    items,
  }));
}

function createTimeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms),
  );
}

async function fetchCSV(url) {
  const res = await fetch(url);
  return res.text();
}

function applyMenuData(foodData, drinksData) {
  menuData = [...foodData, ...drinksData];
  pillsByTab.food = foodData.map((s) => s.label);
  pillsByTab.drinks = drinksData.map((s) => s.label);
}

function applyFallback() {
  console.warn("Falling back to local data");
  menuData = FALLBACK_DATA;
  pillsByTab.food = FALLBACK_DATA.filter((s) => s.tab === "food").map(
    (s) => s.label,
  );
  pillsByTab.drinks = FALLBACK_DATA.filter((s) => s.tab === "drinks").map(
    (s) => s.label,
  );
}

async function loadMenuData() {
  renderLoading();
  try {
    const [foodText, drinksText] = await Promise.race([
      Promise.all([fetchCSV(CSV_URLS.food), fetchCSV(CSV_URLS.drinks)]),
      createTimeout(TIMEOUT_MS),
    ]);

    const foodData = parseCSV(foodText, "food");
    const drinksData = parseCSV(drinksText, "drinks");

    if (!foodData.length && !drinksData.length) throw new Error("empty");

    applyMenuData(foodData, drinksData);
  } catch {
    applyFallback();
  }

  renderPills("food");
  renderMenu("food");
}

function onTabClick(btn) {
  DOM.tabs.forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
  const tab = btn.dataset.tab;
  DOM.searchInput.value = "";
  DOM.searchClear.classList.remove("visible");
  renderPills(tab);
  renderMenu(tab);
}

const FALLBACK_DATA = [
  {
    tab: "food",
    label: "Starters & Small Bites",
    items: [
      { name: "Peppered Ponmo", price: 3000 },
      { name: "Fried Goat Meat / Snail", price: 4500 },
      { name: "Fried Chicken Wings", price: 5000 },
      { name: "BBQ Chicken Wings", price: 7000 },
      { name: "Assorted Pepper Soup", price: 7500 },
      { name: "Peppered Beef", price: 8000 },
      { name: "Canada Way (Pancake, syrup & fruit)", price: 8500 },
      { name: "Peppered Snail (with veggies & salad)", price: 18500 },
    ],
  },
  {
    tab: "food",
    label: "Rice Dishes",
    items: [
      { name: "White Rice", price: 3000 },
      { name: "Smokey Jollof Rice", price: 4500 },
      { name: "Chinese Rice", price: 4500 },
      { name: "Regular Fried Rice", price: 5500 },
      { name: "Coconut Rice", price: 5500 },
      { name: "Jambalaya Rice", price: 5500 },
      { name: "Signature Native Rice", price: 6500 },
      { name: "White Basmati Rice", price: 5000 },
      { name: "Basmati Jollof", price: 7000 },
      { name: "Basmati Fried Rice", price: 8000 },
      { name: "Special Fried Rice", price: 8000 },
      { name: "Asun Rice", price: 8000 },
      { name: "Ofada Rice & Sauce", price: 9500 },
    ],
  },
  {
    tab: "food",
    label: "Pasta & Noodles",
    items: [
      { name: "White Pasta", price: 3000 },
      { name: "White Spaghetti", price: 3000 },
      { name: "Jollof Pasta", price: 5000 },
      { name: "Arrabiata Pasta", price: 4500 },
      { name: "Stir-fried Pasta", price: 6000 },
      { name: "Noodles & Egg", price: 8000 },
    ],
  },
  {
    tab: "food",
    label: "Sides",
    items: [
      { name: "Egg", price: 700 },
      { name: "Bread", price: 1500 },
      { name: "Fried Plantain", price: 1500 },
      { name: "Chips", price: 2000 },
      { name: "Yam Fritters", price: 2000 },
      { name: "Akara", price: 2000 },
      { name: "Moimoi", price: 2500 },
      { name: "Coleslaw", price: 3000 },
    ],
  },
  {
    tab: "food",
    label: "Other Dishes",
    items: [{ name: "Yam and Egg Sauce", price: 8000 }],
  },
  {
    tab: "food",
    label: "Soups",
    items: [
      { name: "Ewedu / Gbegiri", price: 5000 },
      { name: "Egusi / Okra / Ogbono / Eforiro", price: 15000 },
      { name: "Afang / Edikaikong / Bitter Leaf", price: 15000 },
      { name: "Omi-Obe (Assorted)", price: 15000 },
      { name: "Vegetable Soup", price: 20000 },
      { name: "Fisherman Soup", price: 30000 },
      { name: "Seafood Okra", price: 30000 },
    ],
  },
  {
    tab: "food",
    label: "Swallow",
    items: [
      { name: "Fufu", price: 500 },
      { name: "Semo Wraps", price: 700 },
      { name: "Eba / Wheat", price: 700 },
      { name: "Pounded Yam", price: 1000 },
      { name: "Poundo Yam", price: 1000 },
    ],
  },
  {
    tab: "food",
    label: "Beans",
    items: [
      { name: "White Beans", price: 3000 },
      { name: "Beans Pottage", price: 4000 },
    ],
  },
  {
    tab: "food",
    label: "Pepper Soup",
    items: [
      { name: "Tilapia Pepper Soup", price: 5000 },
      { name: "Assorted Pepper Soup", price: 7000 },
      { name: "Cow Leg Pepper Soup", price: 7000 },
      { name: "Cat Fish Pepper Soup", price: 8500 },
      { name: "Croaker Fish Pepper Soup", price: 11000 },
      { name: "Goat Meat Pepper Soup", price: 12000 },
    ],
  },
  {
    tab: "food",
    label: "Grills",
    items: [
      { name: "Grilled Titus Fish (with chips or yam fries)", price: 7000 },
      { name: "Barbecue Chicken (with chips or yam fries)", price: 11000 },
      { name: "Grilled Tilapia (with chips or yam fries)", price: 11000 },
      { name: "Grilled Turkey (with chips or yam fries)", price: 13000 },
      { name: "Grilled Catfish (with chips or yam fries)", price: 16000 },
    ],
  },
  {
    tab: "food",
    label: "Fried",
    items: [
      { name: "Fish (Kote)", price: 3000 },
      { name: "Fish (Titus)", price: 3000 },
      { name: "Croaker", price: 4000 },
      { name: "Chicken", price: 4000 },
      { name: "Turkey", price: 8000 },
      { name: "Goat Meat", price: 8000 },
      { name: "Beef", price: 8000 },
    ],
  },
  {
    tab: "food",
    label: "Shawarma",
    items: [
      { name: "Chicken Shawarma", price: 4500 },
      { name: "Beef Shawarma", price: 5500 },
      { name: "Asun Shawarma", price: 7000 },
    ],
  },
  {
    tab: "drinks",
    label: "Soft Drinks",
    items: [
      { name: "Water 75cl", price: 1000 },
      { name: "Coke", price: 1400 },
      { name: "Sprite", price: 1400 },
      { name: "Fanta", price: 1400 },
      { name: "Pepsi", price: 1400 },
      { name: "Water 150cl", price: 1500 },
      { name: "Predator", price: 3000 },
      { name: "Active Chivita", price: 4000 },
    ],
  },
  {
    tab: "drinks",
    label: "Beers",
    items: [
      { name: "Star Radler", price: 2500 },
      { name: "Trophy", price: 2500 },
      { name: "Heineken", price: 3000 },
      { name: "Budweiser", price: 3000 },
      { name: "Origin Beer", price: 3000 },
      { name: "Big Ice", price: 3000 },
      { name: "Goldberg", price: 3000 },
      { name: "Desperado", price: 3000 },
      { name: "Maltina Stout", price: 3500 },
      { name: "Black Bullet", price: 4000 },
    ],
  },
  {
    tab: "drinks",
    label: "Mocktails",
    items: [
      { name: "Chapman", price: 5000 },
      { name: "Strawberry Lemonade", price: 5000 },
      { name: "Virgin Piña Colada", price: 5000 },
      { name: "Virgin Mojito", price: 5000 },
    ],
  },
  {
    tab: "drinks",
    label: "Classic Cocktails",
    items: [
      { name: "Margarita", price: 7000 },
      { name: "Cosmopolitan", price: 7000 },
      { name: "Piña Colada", price: 7000 },
      { name: "Sex on the Beach", price: 7000 },
      { name: "Tequila Sunrise", price: 7000 },
      { name: "Chapman (Alcoholic)", price: 7000 },
    ],
  },
  {
    tab: "drinks",
    label: "Signature Cocktails",
    items: [
      { name: "Feliza Royal Punch", price: 8000 },
      { name: "Abeokuta Sunrise", price: 8000 },
      { name: "Classic Mojito", price: 8000 },
      { name: "Long Island Iced Tea", price: 8000 },
    ],
  },
  {
    tab: "drinks",
    label: "Wine",
    items: [
      { name: "House Wine (Glass)", price: 5000 },
      { name: "Amabile di Rosa", price: 15000 },
      { name: "Valeta Small", price: 15000 },
      { name: "Chamdor (Bottle)", price: 20000 },
      { name: "Drostdy Hof Claret (Bottle)", price: 20000 },
      { name: "Whispering Angel", price: 21000 },
      { name: "Four Cousins", price: 35000 },
      { name: "Carlo Rossi", price: 25000 },
      { name: "Frontera", price: 15000 },
      { name: "Valeta Big", price: 28000 },
      { name: "Terrazas Malbec (Bottle)", price: 28000 },
      { name: "4th Street", price: 30000 },
      { name: "Thomas Barton (Bottle)", price: 70000 },
    ],
  },
  {
    tab: "drinks",
    label: "Champagne & Sparkling",
    items: [
      { name: "Bottega Gold", price: 20000 },
      { name: "Andre Brut", price: 35000 },
      { name: "Talking Parrot", price: 40000 },
      { name: "Martini Asti", price: 45000 },
      { name: "Veuve Brut Small", price: 100000 },
      { name: "Veuve de Verney Ice Rose", price: 150000 },
      { name: "Moët & Chandon", price: 200000 },
      { name: "Veuve Brut Big", price: 190000 },
      { name: "Veuve Clicquot", price: 190000 },
      { name: "Dom Pérignon", price: 710000 },
      { name: "Ace of Spades", price: 800000 },
      { name: "Cristal Champagne", price: 850000 },
    ],
  },
  {
    tab: "drinks",
    label: "Spirits",
    items: [
      { name: "Gordon Gin", price: 90000 },
      { name: "Jameson Whiskey", price: 35000 },
      { name: "Jameson Green", price: 42500 },
      { name: "Jameson Black", price: 65000 },
      { name: "William Lawson", price: 35000 },
      { name: "Bacardi", price: 45000 },
      { name: "Absolut", price: 50000 },
      { name: "Bailey", price: 55000 },
      { name: "Black Label", price: 80000 },
      { name: "Red Label", price: 42000 },
      { name: "Black Barrel", price: 65000 },
      { name: "Brown and Burk", price: 40000 },
      { name: "Olmeca Tequila", price: 55000 },
      { name: "Martel VS", price: 90000 },
      { name: "Martel Blue Swift", price: 205000 },
      { name: "Smirnoff", price: 95000 },
      { name: "Ciroc", price: 100000 },
      { name: "Jack Daniel 750ml", price: 100000 },
      { name: "Remy Martin", price: 110000 },
      { name: "Bombay Sapphire", price: 130000 },
      { name: "Hennessy VS", price: 160000 },
      { name: "Casamigo 750ml", price: 230000 },
      { name: "Origin Bitters Bottle", price: 20000 },
      { name: "Sierra Tequila", price: 37500 },
    ],
  },
  {
    tab: "drinks",
    label: "Ultra Premium Spirits",
    items: [
      { name: "Glenfiddich 18yrs", price: 350000 },
      { name: "Don Julio", price: 650000 },
      { name: "Glenfiddich 21yrs", price: 700000 },
      { name: "Clase Azul", price: 700000 },
      { name: "Azul", price: 700000 },
      { name: "Don Julio 1942", price: 800000 },
    ],
  },
  {
    tab: "drinks",
    label: "Shots",
    items: [
      { name: "Jameson", price: 3000 },
      { name: "Ciroc", price: 3000 },
      { name: "Jack Daniel", price: 5000 },
      { name: "Casamigo", price: 5000 },
      { name: "Glenfiddich", price: 5500 },
      { name: "Azul", price: 10000 },
    ],
  },
];

function init() {
  applyTheme(getInitialTheme());
  initCarousel();
  loadMenuData();
  DOM.footerYear.textContent = new Date().getFullYear();

  DOM.themeToggle.addEventListener("click", toggleTheme);
  DOM.searchInput.addEventListener("input", onSearchInput);
  DOM.searchClear.addEventListener("click", clearSearch);
  DOM.tabs.forEach((btn) =>
    btn.addEventListener("click", () => onTabClick(btn)),
  );
  DOM.backToTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

init();
