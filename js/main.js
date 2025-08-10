function isIndexPage() {
  const path = window.location.pathname;
  return path.endsWith("/") || path.endsWith("/index.html");
}

window.addEventListener("load", function () {
  const loadingEl = document.getElementById("loading");
  const siteContentEl = document.getElementById("site-content");

  if (!loadingEl || !siteContentEl) return;

  if (!isIndexPage()) {
    setTimeout(function () {
      loadingEl.style.display = "none";
      siteContentEl.style.display = "block";
    }, 750);
  } else {
    loadingEl.style.display = "none";
    siteContentEl.style.display = "block";
  }
});

document.querySelectorAll("a").forEach(function (link) {
  const href = link.getAttribute("href");

  // Ignorar links inválidos ou vazios
  const isFakeLink = !href || href === "#" || href === "";

  // Ignorar links que abrem em nova aba ou são scripts
  const isExternal = link.target === "_blank" || href.startsWith("javascript:");

  if (!isFakeLink && !isExternal) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("site-content").style.display = "none";
      document.getElementById("loading").style.display = "flex";

      setTimeout(() => {
        window.location.href = href;
      }, 1000);
    });
  }
});

// CARREGAR HEADER E FOOTER
async function loadHTML(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro ao carregar ${url}`);
    const html = await res.text();
    el.innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}
// Carrega header e footer
loadHTML("#header-container", "./header.html");
loadHTML("#footer-container", "./footer.html");

//  Todos os links abrem em outra aba
const links = document.querySelectorAll(".links");
links.forEach(function (link) {
  link.setAttribute("target", "_blank");
});

// ANIMACAO ABAIXO DO HEADER
const marquee = document.getElementById("marquee-content");
const originalHTML = marquee.innerHTML;

function cloneMarquee() {
  marquee.innerHTML = originalHTML; // Reset
  const containerWidth = marquee.parentElement.offsetWidth;

  while (marquee.scrollWidth < containerWidth * 2) {
    marquee.innerHTML += originalHTML;
  }
}

function applyPageSpecificStyles() {
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf("/") + 1);

  const buttonContainer = document.querySelector(".button-container");
  let gradient = "";

  if (page === "valorant.html") {
    gradient = "linear-gradient(to right, var(--col-red), var(--col-reddark))";
  } else if (page === "brawl.html") {
    gradient = "linear-gradient(to right, #00BFFF, #0000CD)";
  } else if (page === "lol.html") {
    gradient =
      "linear-gradient(to right, var(--col-dourado), var(--col-douradodark))";
  }

  if (gradient) {
    marquee.parentElement.style.background = gradient;
    if (buttonContainer) {
      buttonContainer.style.background = gradient;
    }
  } else {
    marquee.parentElement.style.background = "";
    if (buttonContainer) {
      buttonContainer.style.background = "";
    }
  }
}

window.addEventListener("load", () => {
  cloneMarquee();
  applyPageSpecificStyles();
});

window.addEventListener("resize", cloneMarquee);
