const slidesContainer = document.querySelector(".hero__slides");
const dotsContainer = document.querySelector(".hero__dots");
const overlay = document.querySelector(".hero__overlay");
const heroContent = document.getElementById("heroContent");
const pillBar = document.getElementById("pillBar");
const tabs = document.querySelectorAll(".tab-btn");

const carouselImages = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80",
  "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1400&q=80",
];

const brandDot = document.createElement("span");
brandDot.classList.add("hero__dot", "active");
dotsContainer.appendChild(brandDot);

carouselImages.forEach((url) => {
  const slide = document.createElement("div");
  slide.classList.add("hero__slide");
  slide.style.backgroundImage = `url('${url}')`;

  const img = new Image();
  img.src = url;
  img.onload = () => slide.classList.add("loaded");

  slidesContainer.appendChild(slide);

  const dot = document.createElement("span");
  dot.classList.add("hero__dot");
  dotsContainer.appendChild(dot);
});

const slides = document.querySelectorAll(".hero__slide");
const dots = document.querySelectorAll(".hero__dot");
let current = 0;

function goToSlide(index) {
  slides[current].classList.remove("active");
  dots[current].classList.remove("active");
  current = index % slides.length;
  slides[current].classList.add("active");
  dots[current].classList.add("active");

  const isBrand = slides[current].dataset.type === "brand";
  overlay.style.opacity = isBrand ? "0" : "1";
  heroContent.classList.toggle("hidden", isBrand);
}

dots.forEach((dot, i) => dot.addEventListener("click", () => goToSlide(i)));
setInterval(() => goToSlide(current + 1), 4500);

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function scrollToSection(label) {
  const target = document.getElementById(slugify(label));
  if (!target) return;

  const navbarHeight = document.querySelector(".navbar").offsetHeight;
  const pillBarHeight = document.querySelector(".pill-bar").offsetHeight;
  const offset = navbarHeight + pillBarHeight + 16;

  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

function formatPrice(amount) {
  return "₦" + amount.toLocaleString("en-NG") + ".00";
}

// MENU TYPE
const pillsByTab = {
  food: [
    "Starters & Small Bites",
    "Rice Dishes",
    "Pasta & Noodles",
    "Soups",
    "Swallow",
  ],
  drinks: [
    "Signature Cocktails",
    "Classic Cocktails",
    "Wine",
    "Champagne & Sparkling",
    "Ultra Premium Spirits",
  ],
};

function renderPills(tab) {
  pillBar.innerHTML = "";
  pillsByTab[tab].forEach((label, i) => {
    const btn = document.createElement("button");
    btn.className = "pill" + (i === 0 ? " active" : "");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".pill")
        .forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      scrollToSection(label);
    });
    pillBar.appendChild(btn);
  });
}

// MENU DATA
const menuData = [
  {
    tab: "food",
    label: "Starters & Small Bites",
    items: [
      { name: "Fried Chicken Wings", price: 5000 },
      { name: "BBQ Chicken Wings", price: 7000 },
      { name: "Assorted Pepper Soup", price: 7500 },
      { name: "Fried Goat Meat / Snail", price: 4500 },
      { name: "Peppered Snail (with veggies & salad)", price: 13500 },
      { name: "Canada Way (Pancake, syrup & fruit)", price: 8500 },
      { name: "Boiled Egg", price: 500 },
    ],
  },
  {
    tab: "food",
    label: "Rice Dishes",
    items: [
      { name: "Coconut Rice", price: 5500 },
      { name: "Smokey Jollof Rice", price: 4500 },
      { name: "Chinese Rice", price: 4500 },
      { name: "Jambalaya Rice", price: 5500 },
      { name: "Signature Native Rice", price: 6500 },
      { name: "Ofada Rice & Sauce", price: 9500 },
      { name: "White Rice", price: 3000 },
    ],
  },
  {
    tab: "food",
    label: "Pasta & Noodles",
    items: [
      { name: "Jollof Pasta", price: 4500 },
      { name: "Arabiata Pasta", price: 4500 },
      { name: "Stir-fried Pasta", price: 5000 },
      { name: "White Pasta", price: 3000 },
      { name: "Noodles & Egg", price: 8500 },
      { name: "Beans Pottage", price: 4000 },
      { name: "White Beans", price: 3000 },
    ],
  },
  {
    tab: "food",
    label: "Soups",
    items: [
      { name: "Egusi / Okra / Ogbono / Eforiro", price: 15000 },
      { name: "Vegetable Soup", price: 20000 },
      { name: "Ewedo / Abegiri", price: 5000 },
      { name: "Omi-Obe (Assorted)", price: 15000 },
      { name: "Fisherman Soup", price: 30000 },
      { name: "Seafood Okra", price: 30000 },
    ],
  },
  {
    tab: "food",
    label: "Swallow",
    items: [
      { name: "Pounded Yam", price: 1000 },
      { name: "Semo Wraps", price: 700 },
      { name: "Fufu", price: 500 },
      { name: "Eba / Wheat", price: 700 },
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
    label: "Wine",
    items: [
      { name: "Drostdy Hof Claret (Bottle)", price: 14000 },
      { name: "Chamdor (Bottle)", price: 12000 },
      { name: "Terrazas Malbec (Bottle)", price: 28000 },
      { name: "Thomas Barton (Bottle)", price: 70000 },
      { name: "House Wine (Glass)", price: 5000 },
    ],
  },
  {
    tab: "drinks",
    label: "Champagne & Sparkling",
    items: [
      { name: "Moët & Chandon", price: 200000 },
      { name: "Veuve Clicquot", price: 190000 },
      { name: "Martini Asti", price: 45000 },
      { name: "Andre Brut", price: 35000 },
      { name: "Cristal Champagne", price: 850000 },
      { name: "Ace of Spades", price: 1000000 },
      { name: "Dom Pérignon", price: 710000 },
    ],
  },
  {
    tab: "drinks",
    label: "Ultra Premium Spirits",
    items: [
      { name: "Don Julio 1942", price: 800000 },
      { name: "Glenfiddich 21yrs", price: 700000 },
      { name: "Clase Azul", price: 700000 },
    ],
  },
];

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

// MENU RENDER
function renderMenu(tab) {
  const menuBody = document.getElementById("menuBody");
  menuBody.innerHTML = "";

  menuData
    .filter((section) => section.tab === tab)
    .forEach((section) => {
      const sec = document.createElement("div");
      sec.className = "menu-section";
      sec.id = slugify(section.label);

      const header = document.createElement("div");
      header.className = "menu-section__header";
      header.textContent = section.label;

      const grid = document.createElement("div");
      grid.className = "menu-grid";

      section.items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "menu-item";

        const nameEl = document.createElement("span");
        nameEl.className = "menu-item__name";
        nameEl.textContent = item.name;

        const dotsEl = document.createElement("span");
        dotsEl.className = "menu-item__dots";

        const priceEl = document.createElement("span");
        priceEl.className = "menu-item__price";
        priceEl.textContent = formatPrice(item.price);

        row.appendChild(nameEl);
        row.appendChild(dotsEl);
        row.appendChild(priceEl);

        nameEl.addEventListener("click", () => {
          const isTruncated = nameEl.scrollWidth > nameEl.clientWidth;
          if (isTruncated || nameEl.classList.contains("expanded")) {
            nameEl.classList.toggle("expanded");
          }
        });

        requestAnimationFrame(() => {
          if (nameEl.scrollWidth > nameEl.clientWidth) {
            nameEl.classList.add("expandable");
          }
        });

        grid.appendChild(row);
      });

      sec.appendChild(header);
      sec.appendChild(grid);
      sectionObserver.observe(sec);
      menuBody.appendChild(sec);
    });
}

// TABS
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    btn.classList.add("active");
    const activeTab = btn.dataset.tab;
    renderPills(activeTab);
    renderMenu(activeTab);
  });
});

renderPills("food");
renderMenu("food");
document.getElementById("footerYear").textContent = new Date().getFullYear();
document.getElementById("backToTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
