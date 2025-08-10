// Seleciona o modal e o conteúdo interno
const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal-content");

// Fecha o modal ao clicar fora do modal-content
modal.addEventListener("click", function (e) {
  if (!modalContent.contains(e.target)) {
    modal.classList.add("hidden");
  }
});

let allAgents = {};
let currentCard = null;

async function loadAgents() {
  const res = await fetch("./assets/data/agents.json");
  const data = await res.json();
  allAgents = data;
}

loadAgents();

function getAllAgents() {
  // Flatten o objeto allAgents para uma lista única
  const agents = Object.values(allAgents).flat();
  const unique = [];
  const seen = new Set();

  for (const agent of agents) {
    if (!seen.has(agent.name)) {
      seen.add(agent.name);
      unique.push(agent);
    }
  }
  return unique;
}

function filterByRole(role) {
  // Retorna agentes pela role (lowercase)
  return allAgents[role.toLowerCase()] || [];
}

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => {
    const modal = document.getElementById("agentModal");
    const searchInput = document.getElementById("searchInput");
    const agentList = document.getElementById("agentList");

    let agents = getAllAgents();
    let currentAgents = agents;

    currentCard = card;

    renderAgentList(agents, agentList, card, modal);

    modal.classList.remove("hidden");
    searchInput.value = "";
    searchInput.focus();

    // Atualiza lista ao digitar no input
    searchInput.oninput = () => {
      const filtered = currentAgents.filter((agent) =>
        agent.name.toLowerCase().includes(searchInput.value.toLowerCase())
      );
      renderAgentList(filtered, agentList, card, modal);
    };

    // Configura filtro por roles nos ícones
    document.querySelectorAll(".roles-valorant img").forEach((icon) => {
      icon.onclick = () => {
        const alt = icon.alt.toLowerCase();

        if (
          icon.classList.contains("all-roles") ||
          alt.includes("todos") ||
          alt.includes("flex")
        ) {
          currentAgents = getAllAgents();
          renderAgentList(currentAgents, agentList, currentCard, modal);
          return;
        }

        const role = alt.includes("controlador")
          ? "controlador"
          : alt.includes("iniciador")
          ? "iniciador"
          : alt.includes("flex")
          ? "flex"
          : alt.includes("sentinela")
          ? "sentinela"
          : alt.includes("duelista")
          ? "duelista"
          : "";

        if (!role) return;

        currentAgents = filterByRole(role);
        renderAgentList(currentAgents, agentList, currentCard, modal);
      };
    });
  });
});

function renderAgentList(agents, listElement, card, modal) {
  listElement.innerHTML = "";

  const playerNames = {
    card1: "pANcada",
    card2: "Cauanzin",
    card3: "RobbieBk",
    card4: "LukXo",
    card5: "Virtyy",
  };

  agents
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((agent) => {
      const li = document.createElement("li");
      li.innerText = agent.name;

      li.onclick = () => {
        card.style.backgroundImage = `url(${agent.image})`;
        card.classList.add("champion-selected");
        card.innerText = "";

        // Remove antigo role-info se existir
        const oldInfo = card.querySelector(".role-info");
        if (oldInfo) oldInfo.remove();

        const roleInfo = document.createElement("div");
        roleInfo.className = "role-info h-regular2 col-wh";

        const role = card.dataset.role.toLowerCase();

        const img = document.createElement("img");
        img.src = `./assets/img/roles/role-${role}.webp`;
        img.alt = role;
        img.width = 24;
        img.height = 24;

        const name = document.createElement("p");
        const cardId = card.id;
        name.innerText = playerNames[cardId] || agent.name;

        roleInfo.appendChild(img);
        roleInfo.appendChild(name);
        card.appendChild(roleInfo);

        modal.classList.add("hidden");
      };

      listElement.appendChild(li);
    });
}

// Definindo os backgrounds das cards (cor clara primeiro, depois escura)
const cardBackgrounds = {
  card1: ["#1c60c0ff", "#19212c"], // Controlador (claro, escuro)
  card2: ["#5cc468ff", "#19212c"], // Iniciador
  card3: ["#2e3841", "#19212c"], // Flex
  card4: ["#df9f0aff", "#19212c"], // Sentinela
  card5: ["#db244eff", "#19212c"], // Duelista
};

document
  .querySelector(".button-container")
  .addEventListener("click", async () => {
    const cards = document.querySelectorAll(".card.champion-selected");

    if (cards.length < 5) {
      alert("Selecione todos os 5 agentes antes de gerar a imagem.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    const playerNames = {
      card1: "pANcada",
      card2: "Cauanzin",
      card3: "RobbieBk",
      card4: "LukXo",
      card5: "Virtyy",
    };

    for (let i = 0; i < 5; i++) {
      const card = cards[i];
      const style = getComputedStyle(card);
      const bgImage = style.backgroundImage;

      const urlMatch = bgImage.match(/url\("?(.+?)"?\)/);
      if (!urlMatch) continue;
      const imageUrl = urlMatch[1];

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      await new Promise((resolve) => {
        img.onload = () => {
          const slotWidth = 384;
          const slotHeight = 1080;

          // Desenha o fundo do card com gradiente (60% claro embaixo, 40% escuro em cima)
          const [lightColor, darkColor] = cardBackgrounds[card.id];

          const gradient = ctx.createLinearGradient(
            i * slotWidth,
            0,
            i * slotWidth,
            slotHeight
          );
          gradient.addColorStop(0, darkColor);
          gradient.addColorStop(0.3, darkColor);
          gradient.addColorStop(0.9, lightColor);
          gradient.addColorStop(1, lightColor);

          ctx.fillStyle = gradient;
          ctx.fillRect(i * slotWidth, 0, slotWidth, slotHeight);

          // Ajusta crop centralizado na proporção 384x1080
          const imgRatio = img.width / img.height;
          const slotRatio = slotWidth / slotHeight;

          let srcX = 0,
            srcY = 0,
            srcWidth = img.width,
            srcHeight = img.height;

          if (imgRatio > slotRatio) {
            // imagem mais larga, corta horizontalmente
            const newWidth = img.height * slotRatio;
            srcX = (img.width - newWidth) / 2;
            srcWidth = newWidth;
          } else {
            // imagem mais alta, corta verticalmente
            const newHeight = img.width / slotRatio;
            srcY = (img.height - newHeight) / 2;
            srcHeight = newHeight;
          }

          ctx.drawImage(
            img,
            srcX,
            srcY,
            srcWidth,
            srcHeight,
            i * slotWidth,
            0,
            slotWidth,
            slotHeight
          );

          resolve();
        };
        img.onerror = () => {
          console.error("Erro ao carregar imagem: ", imageUrl);
          resolve();
        };
      });

      // Desenha fundo e ícone com nome do player na parte inferior
      const roleName = card.dataset.role.toLowerCase();
      const playerName = playerNames[card.id] || "";

      await new Promise((resolveIcon) => {
        const roleImg = new Image();
        roleImg.src = `./assets/img/roles/role-${roleName}.webp`;
        roleImg.onload = () => {
          const iconSize = 48;
          const padding = 10;
          const bgHeight = iconSize + 28 + padding * 3;

          const centerX = i * 384 + 384 / 2;
          const bgY = 1080 - bgHeight;

          // Fundo sem espaço embaixo (transparência 0.7)
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(i * 384, bgY, 384, bgHeight);

          ctx.drawImage(
            roleImg,
            centerX - iconSize / 2,
            bgY + padding,
            iconSize,
            iconSize
          );

          ctx.font = "bold 28px Space Grotesk";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.fillText(playerName, centerX, bgY + padding + iconSize + 28);

          resolveIcon();
        };
        roleImg.onerror = () => {
          console.error("Erro ao carregar ícone da role: ", roleName);
          resolveIcon();
        };
      });
    }

    // Gera e baixa a imagem final
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "VALORANT_DRAFT.png";
    link.click();
  });
