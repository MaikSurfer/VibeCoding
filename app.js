const authPanel = document.getElementById("authPanel");
const gamePanel = document.getElementById("gamePanel");
const authMsg = document.getElementById("authMsg");
const gameMsg = document.getElementById("gameMsg");
const fallbackArea = document.getElementById("fallbackArea");
const fallbackHarvest = document.getElementById("fallbackHarvest");

const ui = {
  playerName: document.getElementById("playerName"),
  money: document.getElementById("money"),
  flowers: document.getElementById("flowers"),
  tier: document.getElementById("tier"),
};

const state = {
  currentUser: "Guest",
  money: 0,
  flowers: 0,
  machineLevel: 1,
  fields: 1,
  ownedCards: new Set(),
  selectedCardTier: 1,
};

let flowerMeshes = [];
let renderer, scene, camera, raycaster, mouse;
let THREE_LIB = null;

function setMsg(el, text) {
  el.textContent = text;
  setTimeout(() => {
    if (el.textContent === text) el.textContent = "";
  }, 2600);
}

function updateUI() {
  ui.playerName.textContent = state.currentUser;
  ui.money.textContent = state.money;
  ui.flowers.textContent = state.flowers;
  ui.tier.textContent = Math.min(3, Math.floor(state.money / 90) + 1);
}

function harvestFlower() {
  state.flowers += 1;
  state.money += 5 + state.machineLevel;
  updateUI();
}

async function startGame(playerName) {
  if (!playerName) {
    setMsg(authMsg, "Please enter your name to start.");
    return;
  }

  state.currentUser = playerName;
  authPanel.classList.add("hidden");
  gamePanel.classList.remove("hidden");
  updateUI();
  await boot3D();
  setMsg(gameMsg, `Welcome ${playerName}! Grow love-filled flowers 🌷`);
}

document.getElementById("startForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const playerName = document.getElementById("playerInputName").value.trim();
  await startGame(playerName);
  e.target.reset();
});

fallbackHarvest.addEventListener("click", () => {
  harvestFlower();
  setMsg(gameMsg, "You harvested a flower in simple mode 🌼");
});

function createFlower(x, z) {
  const group = new THREE_LIB.Group();
  const stem = new THREE_LIB.Mesh(
    new THREE_LIB.CylinderGeometry(0.05, 0.06, 0.65),
    new THREE_LIB.MeshStandardMaterial({ color: 0x42b94a })
  );
  stem.position.y = 0.33;

  const petals = new THREE_LIB.Mesh(
    new THREE_LIB.SphereGeometry(0.23, 16, 16),
    new THREE_LIB.MeshStandardMaterial({ color: new THREE_LIB.Color(`hsl(${Math.random() * 60 + 310},80%,70%)`) })
  );
  petals.position.y = 0.7;

  group.add(stem, petals);
  group.position.set(x, 0, z);
  group.userData = { bloom: true };
  scene.add(group);
  flowerMeshes.push(group);
}

function rebuildFlowers() {
  flowerMeshes.forEach((f) => scene.remove(f));
  flowerMeshes = [];
  const total = state.fields * 3 + 3;
  for (let i = 0; i < total; i++) {
    createFlower((i % 4) * 1.9 - 2.8, Math.floor(i / 4) * 1.8 - 1.8);
  }
}

async function boot3D() {
  if (renderer) return;
  const canvas = document.getElementById("farm3d");

  try {
    if (!THREE_LIB) {
      THREE_LIB = await import("https://unpkg.com/three@0.161.0/build/three.module.js");
    }

    renderer = new THREE_LIB.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(devicePixelRatio);
    scene = new THREE_LIB.Scene();

    camera = new THREE_LIB.PerspectiveCamera(58, 1, 0.1, 100);
    camera.position.set(4.8, 5.5, 7.8);
    camera.lookAt(0, 0.5, 0);

    raycaster = new THREE_LIB.Raycaster();
    mouse = new THREE_LIB.Vector2();

    scene.add(new THREE_LIB.AmbientLight(0xffffff, 0.9));
    const sun = new THREE_LIB.DirectionalLight(0xfff2d9, 1.1);
    sun.position.set(5, 8, 3);
    scene.add(sun);

    const ground = new THREE_LIB.Mesh(
      new THREE_LIB.BoxGeometry(10, 0.4, 8),
      new THREE_LIB.MeshStandardMaterial({ color: 0xa8e6a1 })
    );
    ground.position.y = -0.2;
    scene.add(ground);

    rebuildFlowers();

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(flowerMeshes, true);
      if (!intersects.length) return;

      const picked = intersects[0].object.parent;
      if (!picked.userData.bloom) return;

      picked.userData.bloom = false;
      picked.visible = false;
      harvestFlower();

      setTimeout(() => {
        picked.userData.bloom = true;
        picked.visible = true;
      }, 1700);
    });

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function animate() {
      resize();
      flowerMeshes.forEach((f, i) => {
        f.rotation.y += 0.005;
        f.position.y = Math.sin(performance.now() * 0.001 + i) * 0.04;
      });
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  } catch (error) {
    console.warn("3D mode unavailable, using fallback mode:", error);
    canvas.classList.add("hidden");
    fallbackArea.classList.remove("hidden");
    setMsg(gameMsg, "3D not available here, but you can still play in simple mode 🌸");
  }
}

function spend(cost, onSuccess) {
  if (state.money < cost) {
    setMsg(gameMsg, `Need $${cost}. Keep harvesting!`);
    return;
  }

  state.money -= cost;
  onSuccess();
  updateUI();
}

document.getElementById("upgradeMachine").onclick = () => {
  spend(40, () => {
    state.machineLevel += 1;
    setMsg(gameMsg, "Machine upgraded! More money per flower.");
  });
};

document.getElementById("buyField").onclick = () => {
  spend(70, () => {
    state.fields += 1;
    if (scene) rebuildFlowers();
    setMsg(gameMsg, "New field unlocked with extra flowers.");
  });
};

document.getElementById("magicLove").onclick = () => {
  spend(100, () => {
    if (flowerMeshes.length) {
      flowerMeshes.forEach((f) => {
        f.visible = true;
        f.userData.bloom = true;
      });
    }
    setMsg(gameMsg, "Love magic cast! Every flower blooms again ✨");
  });
};

document.querySelectorAll(".buyCard").forEach((btn) => {
  btn.onclick = () => {
    const tier = Number(btn.dataset.tier);
    const costs = { 1: 30, 2: 90, 3: 160 };
    const lockByMoney = { 1: 0, 2: 120, 3: 220 };

    if (state.money < lockByMoney[tier]) {
      setMsg(gameMsg, `Reach $${lockByMoney[tier]} to unlock Tier ${tier}.`);
      return;
    }

    spend(costs[tier], () => {
      state.ownedCards.add(tier);
      state.selectedCardTier = tier;
      setMsg(gameMsg, `Tier ${tier} card purchased! Craft your message 💌`);
    });
  };
});

document.getElementById("sendWish").onclick = () => {
  const name = document.getElementById("toName").value.trim();
  const wish = document.getElementById("wishText").value.trim();

  if (!name || !wish) {
    setMsg(gameMsg, "Please enter name and your wish.");
    return;
  }

  if (!state.ownedCards.size) {
    setMsg(gameMsg, "Buy a greeting card tier first.");
    return;
  }

  const tier = state.selectedCardTier;
  const card = document.getElementById("greetingCard");
  const body = document.getElementById("cardBody");

  card.className = `greeting-card tier-${tier}`;
  card.classList.remove("hidden");
  body.textContent = `To ${name}: ${wish}`;

  setMsg(gameMsg, "Your cute e-greeting card is ready! 💖");
};
