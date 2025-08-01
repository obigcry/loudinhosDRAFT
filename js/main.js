//  Todos os links abrem em outra aba
const links = document.querySelectorAll(".links");
links.forEach(function (link) {
  link.setAttribute("target", "_blank");
});

// Seleciona o modal e o conteúdo interno
const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal-content");

// Fecha o modal ao clicar fora do modal-content
modal.addEventListener("click", function (e) {
  if (!modalContent.contains(e.target)) {
    modal.classList.add("hidden");
  }
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

window.addEventListener("load", cloneMarquee);
window.addEventListener("resize", cloneMarquee);
