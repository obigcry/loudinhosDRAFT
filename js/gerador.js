let allChamps = {};
let currentCard = null;

async function loadChampions() {
  const res = await fetch("./assets/data/champions.json");
  const data = await res.json();
  allChamps = data;
}

loadChampions();

function getAllChampions() {
  return Object.values(allChamps).flat();
}

function filterByRole(role) {
  return allChamps[role.toLowerCase()] || [];
}

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => {
    const modal = document.getElementById("championModal");
    const searchInput = document.getElementById("searchInput");
    const championList = document.getElementById("championList");

    let champs = getAllChampions();
    let currentChamps = champs;

    currentCard = card;

    renderChampionList(champs, championList, card, modal);

    modal.classList.remove("hidden");
    searchInput.value = "";
    searchInput.focus();

    searchInput.oninput = () => {
      const filtered = currentChamps.filter((champ) =>
        champ.name.toLowerCase().includes(searchInput.value.toLowerCase())
      );
      renderChampionList(filtered, championList, card, modal);
    };

    document.querySelectorAll(".roles-lol img").forEach((icon) => {
      icon.onclick = () => {
        const alt = icon.alt.toLowerCase();

        if (icon.classList.contains("all-roles") || alt.includes("todos")) {
          currentChamps = getAllChampions();
          renderChampionList(currentChamps, championList, currentCard, modal);
          return;
        }

        const role = alt.includes("top")
          ? "top"
          : alt.includes("jungle")
          ? "jungle"
          : alt.includes("mid")
          ? "mid"
          : alt.includes("adc")
          ? "adc"
          : alt.includes("support")
          ? "support"
          : "";

        if (!role) return;

        currentChamps = filterByRole(role);
        renderChampionList(currentChamps, championList, currentCard, modal);
      };
    });
  });
});

function renderChampionList(champs, listElement, card, modal) {
  listElement.innerHTML = "";

  const playerNames = {
    card1: "Robo",
    card2: "Gryffinn",
    card3: "Jool",
    card4: "Route",
    card5: "Redbert",
  };

  champs
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((champ) => {
      const li = document.createElement("li");
      li.innerText = champ.name;

      li.onclick = () => {
        card.style.backgroundImage = `url(${champ.image})`;
        card.classList.add("champion-selected");
        card.innerText = "";

        const oldInfo = card.querySelector(".role-info");
        if (oldInfo) oldInfo.remove();

        const roleInfo = document.createElement("div");
        roleInfo.className = "role-info h-regular2 col-wh";

        const role = card.dataset.role.toLowerCase();

        const img = document.createElement("img");
        img.src = `./assets/img/roles/role-${role}.png`;
        img.alt = role;
        img.width = 24;
        img.height = 24;

        const name = document.createElement("p");
        const cardId = card.id;
        name.innerText = playerNames[cardId] || champ.name;

        roleInfo.appendChild(img);
        roleInfo.appendChild(name);
        card.appendChild(roleInfo);

        modal.classList.add("hidden");
      };

      listElement.appendChild(li);
    });
}

document
  .querySelector(".button-container")
  .addEventListener("click", async () => {
    const cards = document.querySelectorAll(".card.champion-selected");

    if (cards.length < 5) {
      alert("Selecione todos os 5 campeões antes de gerar a imagem.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    const playerNames = {
      card1: "Robo",
      card2: "Gryffinn",
      card3: "Jool",
      card4: "Route",
      card5: "Redbert",
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

          const imgRatio = img.width / img.height;
          const slotRatio = slotWidth / slotHeight;

          let srcX = 0,
            srcY = 0,
            srcWidth = img.width,
            srcHeight = img.height;

          if (imgRatio > slotRatio) {
            const newWidth = img.height * slotRatio;
            srcX = (img.width - newWidth) / 2;
            srcWidth = newWidth;
          } else {
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
      });

      const roleName = card.dataset.role.toLowerCase();
      const playerName = playerNames[card.id] || "";

      await new Promise((resolveIcon) => {
        const roleImg = new Image();
        roleImg.src = `./assets/img/roles/role-${roleName}.png`;
        roleImg.onload = () => {
          const iconSize = 48;
          const padding = 10;
          const bgHeight = iconSize + 28 + padding * 3;

          const centerX = i * 384 + 384 / 2;
          const bgY = 1080 - bgHeight;

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
      });
    }

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "Loud DRAFT.png";
    link.click();
  });
