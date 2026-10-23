
/*
 * Voto Simulado Brasil
 * Simulação fictícia, sem vínculo com o TSE.
 * Resultados armazenados somente neste navegador.
 */

const PIX_KEY = "70df6774-9247-464e-b627-f098e87d73b7";
const STORAGE_KEY = "votoSimuladoBrasil.v1";
const VOTED_KEY = "votoSimuladoBrasil.participacaoRegistrada.v1";

const choices = [
  {
    id: "1",
    label: "Flávio Bolsonaro",
    number: "22",
    image: "images/Screenshot_2026-10-21-22-10-01-051_com.openai.chatgpt.jpg"
  },
  {
    id: "2",
    label: "Luiz Inácio Lula da Silva",
    number: "13",
    image: "images/Screenshot_2026-10-21-22-10-05-868_com.openai.chatgpt.jpg"
  },
  { id: "blank", label: "BRANCO", number: "" },
  { id: "null", label: "NULO", number: "" }
];

let selectedChoice = null;
let typedNumber = "";
let participationRegistered = false;

const $ = id => document.getElementById(id);

const options = [...document.querySelectorAll(".option")];
const feedback = $("feedback");
const totalCount = $("totalCount");
const resultsList = $("resultsList");
const display = $("urnaDisplay");
const keypad = $("urnaKeypad");
const previewPhoto = $("previewPhoto");
const previewPlaceholder = $("previewPlaceholder");
const previewName = $("previewName");
const previewNumber = $("previewNumber");
const previewStatus = $("previewStatus");
const previewPrompt = $("previewPrompt");

try {
  participationRegistered = localStorage.getItem(VOTED_KEY) === "1";
} catch (error) {
  participationRegistered = false;
}

function getCounts() {
  let saved = {};

  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (error) {
    saved = {};
  }

  const counts = {};

  choices.forEach(choice => {
    counts[choice.id] = Math.max(0, Number(saved[choice.id]) || 0);
  });

  return counts;
}

function saveCounts(counts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    return true;
  } catch (error) {
    if (feedback) {
      feedback.textContent = "Não foi possível salvar os resultados neste navegador.";
    }
    return false;
  }
}

function renderResults() {
  const counts = getCounts();
  const total = choices.reduce((sum, choice) => sum + counts[choice.id], 0);

  if (totalCount) totalCount.textContent = total;
  if (!resultsList) return;

  resultsList.replaceChildren();

  choices.forEach(choice => {
    const count = counts[choice.id];
    const percent = total ? (count / total) * 100 : 0;

    const row = document.createElement("div");
    row.className = "result-row";

    const label = document.createElement("strong");
    label.textContent = choice.number
      ? `${choice.label} — ${choice.number}`
      : choice.label;

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${percent}%`;
    track.appendChild(fill);

    const value = document.createElement("span");
    value.className = "result-value";
    value.textContent =
      `${count} · ${percent.toFixed(1).replace(".", ",")}%`;

    row.append(label, track, value);
    resultsList.appendChild(row);
  });
}

function updatePreview(choice) {
  if (!previewName) return;

  if (previewPhoto) {
    previewPhoto.hidden = true;
    previewPhoto.removeAttribute("src");
    previewPhoto.alt = "";
  }

  if (previewPlaceholder) {
    previewPlaceholder.hidden = false;
    previewPlaceholder.textContent = "VS";
  }

  if (!choice) {
    previewName.textContent = "AGUARDANDO ESCOLHA";
    if (previewNumber) previewNumber.textContent = "Número: --";
    if (previewStatus) previewStatus.textContent = "SIMULAÇÃO FICTÍCIA";
    if (previewPrompt) previewPrompt.textContent = "SIMULAÇÃO DE VOTO";
    return;
  }

  previewName.textContent = choice.label;

  if (previewNumber) {
    previewNumber.textContent = choice.number
      ? `Número: ${choice.number}`
      : "Opção sem número";
  }

  if (previewStatus) previewStatus.textContent = "SIMULAÇÃO FICTÍCIA";
  if (previewPrompt) previewPrompt.textContent = "OPÇÃO SELECIONADA";

  if (choice.image && previewPhoto) {
    previewPhoto.alt = `Foto de ${choice.label}`;

    previewPhoto.onload = () => {
      previewPhoto.hidden = false;
      if (previewPlaceholder) previewPlaceholder.hidden = true;
    };

    previewPhoto.onerror = () => {
      previewPhoto.hidden = true;
      if (previewPlaceholder) {
        previewPlaceholder.hidden = false;
        previewPlaceholder.textContent = "Foto indisponível";
      }
    };

    previewPhoto.src = choice.image;
  } else if (previewPlaceholder) {
    previewPlaceholder.textContent = choice.label;
  }
}

function updateDisplay(message = "") {
  if (!display) return;
  if (message) {
    display.textContent = message;
    return;
  }

  if (typedNumber) {
    display.textContent = `Número digitado: ${typedNumber}`;
    return;
  }

  const choice = choices.find(item => item.id === selectedChoice);

  display.textContent = choice
    ? `Selecionado: ${choice.label}${choice.number ? ` — ${choice.number}` : ""}`
    : "Digite 22 ou 13, ou escolha BRANCO/NULO.";
}

function selectChoice(id) {
  if (participationRegistered) return;

  selectedChoice = id;

  options.forEach(button => {
    const active = button.dataset.choice === id;
    button.classList.toggle("selected", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const choice = choices.find(item => item.id === id);
  updatePreview(choice);

  if (feedback && choice) {
    feedback.textContent = `${choice.label} selecionado. Confira a tela.`;
  }

  updateDisplay();
}

function clearSelection() {
  if (participationRegistered) return;

  selectedChoice = null;

  options.forEach(button => {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
  });

  updatePreview(null);
}

function lockControls() {
  if (!participationRegistered) return;

  options.forEach(button => {
    button.disabled = true;
  });

  if (keypad) {
    keypad.querySelectorAll("button").forEach(button => {
      button.disabled = true;
    });
  }

  ["clearBtn", "confirmBtn"].forEach(id => {
    const button = $(id);
    if (button) button.disabled = true;
  });

  if (display) {
    display.textContent = "PARTICIPAÇÃO JÁ REGISTRADA NESTE NAVEGADOR";
  }

  if (feedback) {
    feedback.textContent =
      "Simulação concluída neste navegador. Os resultados são locais.";
  }
}

function registerParticipation() {
  if (participationRegistered) return;

  if (!selectedChoice) {
    if (feedback) feedback.textContent = "Escolha uma opção primeiro.";
    return;
  }

  const counts = getCounts();
  counts[selectedChoice] += 1;

  if (!saveCounts(counts)) return;

  try {
    localStorage.setItem(VOTED_KEY, "1");
  } catch (error) {
    counts[selectedChoice] -= 1;
    saveCounts(counts);
    if (feedback) feedback.textContent = "Não foi possível registrar neste navegador.";
    return;
  }

  participationRegistered = true;
  renderResults();

  if (display) display.textContent = "FINALIZADO — SIMULAÇÃO FICTÍCIA";
  if (feedback) feedback.textContent = "Participação fictícia registrada!";
  if (previewStatus) previewStatus.textContent = "SIMULAÇÃO FINALIZADA";

  lockControls();
}

// Seleção pelas opções na tela.
options.forEach(button => {
  button.addEventListener("click", () => {
    typedNumber = "";
    selectChoice(button.dataset.choice);
  });
});

// Teclado numérico.
if (keypad) {
  keypad.querySelectorAll("[data-digit]").forEach(button => {
    button.addEventListener("click", () => {
      if (participationRegistered || typedNumber.length >= 2) return;

      typedNumber += button.dataset.digit;

      const match = choices.find(choice =>
        choice.number && choice.number.startsWith(typedNumber)
      );

      if (match) {
        updatePreview(match);
      } else {
        updatePreview(null);
        if (previewName) previewName.textContent = "NÚMERO DIGITADO";
        if (previewNumber) previewNumber.textContent = `Número: ${typedNumber}`;
      }

      updateDisplay();
    });
  });
}

function selectSpecial(id) {
  typedNumber = "";
  selectChoice(id);
}

if ($("urnaBranco")) {
  $("urnaBranco").addEventListener("click", () => selectSpecial("blank"));
}

if ($("urnaNulo")) {
  $("urnaNulo").addEventListener("click", () => selectSpecial("null"));
}

if ($("urnaCorrige")) {
  $("urnaCorrige").addEventListener("click", () => {
    typedNumber = "";
    clearSelection();
    updateDisplay("Seleção apagada. Digite 22 ou 13, ou escolha BRANCO/NULO.");
  });
}

if ($("urnaConfirma")) {
  $("urnaConfirma").addEventListener("click", () => {
    if (participationRegistered) return;

    if (typedNumber) {
      const ids = { "22": "1", "13": "2" };
      const id = ids[typedNumber];

      if (!id) {
        typedNumber = "";
        clearSelection();
        updateDisplay("Número inválido. Digite 22 ou 13.");
        return;
      }

      typedNumber = "";
      selectChoice(id);
      updateDisplay("Confira a opção e use o botão verde para registrar.");
      return;
    }

    updateDisplay(
      selectedChoice
        ? "Confira a opção e use o botão verde para registrar."
        : "Nenhuma opção selecionada."
    );
  });
}

if ($("clearBtn")) {
  $("clearBtn").addEventListener("click", () => {
    typedNumber = "";
    clearSelection();
    updateDisplay();
    if (feedback) feedback.textContent = "Seleção limpa.";
  });
}

if ($("confirmBtn")) {
  $("confirmBtn").addEventListener("click", registerParticipation);
}

// Configuração do Pix.
const pixStatus = $("pixStatus");
const pixKeyDisplay = $("pixKeyDisplay");
const pixActions = $("pixActions");
const copyPixBtn = $("copyPixBtn");

if (PIX_KEY && pixKeyDisplay) {
  pixKeyDisplay.textContent = PIX_KEY;
}

if (pixStatus) {
  pixStatus.textContent =
    "Contribuição voluntária. Confira os dados do destinatário no aplicativo do banco.";
}

if (pixActions) pixActions.hidden = false;

if (copyPixBtn) {
  copyPixBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      copyPixBtn.textContent = "Chave copiada!";
      if (pixStatus) pixStatus.textContent = "Chave copiada. Confira o destinatário antes de pagar.";
    } catch (error) {
      window.prompt("Copie sua chave Pix:", PIX_KEY);
    }
  });
}

// Inicialização.
if ($("resetBtn")) {
  $("resetBtn").hidden = true;
}

renderResults();
updatePreview(null);
updateDisplay();
lockControls();
    
