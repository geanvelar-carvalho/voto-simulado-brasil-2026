  
/*
 * Voto Simulado Brasil — simulação local.
 * Participações fictícias armazenadas somente neste navegador.
 */
const PIX_KEY = "70df6774-9247-464e-b627-f098e87d73b7";
const STORAGE_KEY = "votoSimuladoBrasil.v1";

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
  { id: "blank", label: "Voto em branco", number: "" },
  { id: "null", label: "Voto nulo", number: "" }
];

let selectedChoice = null;
let urnaNumeroDigitado = "";

const options = [...document.querySelectorAll(".option")];
const feedback = document.getElementById("feedback");
const totalCount = document.getElementById("totalCount");
const resultsList = document.getElementById("resultsList");

const urnaDisplay = document.getElementById("urnaDisplay");
const urnaKeypad = document.getElementById("urnaKeypad");
const urnaCorrige = document.getElementById("urnaCorrige");
const urnaConfirma = document.getElementById("urnaConfirma");
const urnaBranco = document.getElementById("urnaBranco");
const urnaNulo = document.getElementById("urnaNulo");
const confirmBtn = document.getElementById("confirmBtn");
const clearBtn = document.getElementById("clearBtn");

/* Cria a área de foto e identificação na tela lateral. */
const screenContent = document.querySelector(".screen-content");
let preview = null;

if (screenContent) {
  const style = document.createElement("style");
  style.textContent = `
    .candidate-preview {
      margin: 14px auto;
      padding: 14px;
      border: 1px solid #b9d4c3;
      border-radius: 12px;
      background: rgba(18, 61, 43, 0.07);
      text-align: center;
    }
    .candidate-preview img {
      display: none;
      width: 112px;
      height: 132px;
      object-fit: cover;
      object-position: center top;
      border-radius: 10px;
      border: 2px solid #b9d4c3;
      margin: 0 auto 10px;
    }
    .candidate-preview .preview-placeholder {
      display: block;
      font-size: 38px;
      margin: 8px;
    }
    .candidate-preview strong {
      display: block;
      overflow-wrap: anywhere;
      margin-bottom: 5px;
    }
    .candidate-preview small {
      display: block;
      line-height: 1.4;
    }
    .candidate-preview .preview-number {
      font-size: 24px;
      font-weight: 800;
      margin: 5px 0;
    }
  `;
  document.head.appendChild(style);

  preview = document.createElement("div");
  preview.className = "candidate-preview";
  preview.setAttribute("aria-live", "polite");
  preview.innerHTML = `
    <span class="preview-placeholder">🗳️</span>
    <img alt="" />
    <strong class="preview-name">Nenhuma opção selecionada</strong>
    <div class="preview-number"></div>
    <small class="preview-status">Escolha uma opção na urna simulada.</small>
  `;

  const screenIcon = screenContent.querySelector(".screen-icon");
  if (screenIcon) {
    screenContent.insertBefore(preview, screenIcon);
  } else {
    screenContent.prepend(preview);
  }
}

function loadCounts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return Object.fromEntries(
      choices.map(choice => [
        choice.id,
        Math.max(0, Number(parsed[choice.id]) || 0)
      ])
    );
  } catch {
    return Object.fromEntries(choices.map(choice => [choice.id, 0]));
  }
}

function saveCounts(counts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    return true;
  } catch {
    if (feedback) {
      feedback.textContent =
        "Não foi possível salvar neste navegador. A participação não foi registrada.";
    }
    return false;
  }
}

function renderResults() {
  const counts = loadCounts();
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  if (totalCount) totalCount.textContent = total;
  if (!resultsList) return;

  resultsList.innerHTML = "";

  choices.forEach(choice => {
    const count = counts[choice.id];
    const percent = total ? Math.round((count / total) * 100) : 0;

    const row = document.createElement("div");
    row.className = "result-row";

    const label = document.createElement("strong");
    label.textContent = choice.id === "1"
      ? `${choice.label} — 22`
      : choice.id === "2"
        ? `${choice.label} — 13`
        : choice.label;

    const track = document.createElement("div");
    track.className = "bar-track";
    track.setAttribute("aria-label", `${percent}%`);

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${percent}%`;
    track.appendChild(fill);

    const value = document.createElement("span");
    value.className = "result-value";
    value.textContent = count;

    row.append(label, track, value);
    resultsList.appendChild(row);
  });
}

/* Som curto de finalização, gerado pelo próprio navegador. */
function tocarSomFinalizado() {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const audio = new AudioContextClass();

    audio.resume().then(() => {
      const agora = audio.currentTime;

      [880, 1175].forEach((frequencia, indice) => {
        const oscillator = audio.createOscillator();
        const volume = audio.createGain();
        const inicio = agora + indice * 0.16;

        oscillator.type = "sine";
        oscillator.frequency.value = frequencia;

        volume.gain.setValueAtTime(0.0001, inicio);
        volume.gain.exponentialRampToValueAtTime(0.18, inicio + 0.02);
        volume.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.13);

        oscillator.connect(volume);
        volume.connect(audio.destination);

        oscillator.start(inicio);
        oscillator.stop(inicio + 0.14);
      });

      window.setTimeout(() => audio.close().catch(() => {}), 700);
    }).catch(() => {});
  } catch {
    // O navegador pode não permitir áudio; a simulação continua funcionando.
  }
}

function atualizarPrevia() {
  if (!preview) return;

  const chosen = choices.find(choice => choice.id === selectedChoice);
  const img = preview.querySelector("img");
  const placeholder = preview.querySelector(".preview-placeholder");
  const name = preview.querySelector(".preview-name");
  const number = preview.querySelector(".preview-number");
  const status = preview.querySelector(".preview-status");

  if (!chosen) {
    img.style.display = "none";
    img.removeAttribute("src");
    placeholder.style.display = "block";
    name.textContent = "Nenhuma opção selecionada";
    number.textContent = "";
    status.textContent = "Escolha uma opção na urna simulada.";
    return;
  }

  name.textContent = chosen.label;
  number.textContent = chosen.number ? `Número ${chosen.number}` : "";
  status.textContent = "Opção selecionada — simulação fictícia.";

  if (chosen.image) {
    img.onerror = () => {
      img.style.display = "none";
      placeholder.style.display = "block";
      placeholder.textContent = "📷";
      status.textContent =
        "Foto indisponível. Confira o arquivo na pasta images.";
    };
    img.onload = () => {
      img.style.display = "block";
      placeholder.style.display = "none";
    };
    img.src = chosen.image;
    img.alt = `Foto de ${chosen.label}`;
  } else {
    img.style.display = "none";
    img.removeAttribute("src");
    placeholder.style.display = "block";
    placeholder.textContent = chosen.id === "blank" ? "⬜" : "🚫";
  }
}

function atualizarDisplay(mensagem) {
  if (!urnaDisplay) return;

  if (mensagem) {
    urnaDisplay.textContent = mensagem;
    return;
  }

  if (urnaNumeroDigitado) {
    urnaDisplay.textContent = `Número digitado: ${urnaNumeroDigitado}`;
    return;
  }

  const chosen = choices.find(choice => choice.id === selectedChoice);

  urnaDisplay.textContent = chosen
    ? `Selecionado: ${chosen.label}${chosen.number ? ` — ${chosen.number}` : ""}`
    : "Digite 22 ou 13, ou escolha BRANCO/NULO.";
}

function setSelected(id) {
  selectedChoice = id;

  options.forEach(button => {
    const active = button.dataset.choice === id;
    button.classList.toggle("selected", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const chosen = choices.find(choice => choice.id === id);
  if (feedback && chosen) {
    feedback.textContent =
      `${chosen.label}${chosen.number ? ` — ${chosen.number}` : ""} selecionado. Confira a tela e confirme a participação fictícia no botão verde.`;
  }

  atualizarPrevia();
}

function clearSelection() {
  selectedChoice = null;

  options.forEach(button => {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
  });

  atualizarPrevia();
}

/* Seleção pelas opções da página. */
options.forEach(button => {
  button.addEventListener("click", () => {
    urnaNumeroDigitado = "";
    setSelected(button.dataset.choice);
    atualizarDisplay();
  });
});

/* Limpar seleção. */
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    urnaNumeroDigitado = "";
    clearSelection();
    atualizarDisplay();

    if (feedback) {
      feedback.textContent =
        "Seleção limpa. Escolha uma opção antes de confirmar.";
    }
  });
}

/* Somente o botão verde registra uma participação fictícia. */
if (confirmBtn) {
  confirmBtn.addEventListener("click", () => {
    if (!selectedChoice) {
      if (feedback) feedback.textContent =
        "Escolha uma opção antes de confirmar.";
      return;
    }

    const chosen = choices.find(choice => choice.id === selectedChoice);
    const counts = loadCounts();
    counts[selectedChoice] = (counts[selectedChoice] || 0) + 1;

    if (!saveCounts(counts)) return;

    renderResults();
    tocarSomFinalizado();

    if (feedback) {
      feedback.textContent =
        `Bip! Participação fictícia registrada: ${chosen.label}. Os dados ficam apenas neste navegador.`;
    }

    if (urnaDisplay) {
      urnaDisplay.textContent = "✓ FINALIZADO — SIMULAÇÃO FICTÍCIA";
    }

    if (preview) {
      preview.querySelector(".preview-status").textContent =
        "✓ Participação fictícia finalizada.";
    }
  });
}

/* Zerar resultados locais. */
const resetBtn = document.getElementById("resetBtn");

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (!confirm(
      "Zerar todas as participações salvas neste navegador? Essa ação não pode ser desfeita."
    )) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}

    renderResults();
    if (feedback) feedback.textContent = "Os dados locais foram zerados.";
  });
}

/* Configuração do Pix. */
if (PIX_KEY.trim()) {
  const pixStatus = document.getElementById("pixStatus");
  const pixKeyDisplay = document.getElementById("pixKeyDisplay");
  const pixActions = document.getElementById("pixActions");
  const copyPixBtn = document.getElementById("copyPixBtn");

  if (pixStatus) {
    pixStatus.textContent =
      "Chave Pix configurada. Confira o destinatário no aplicativo do seu banco antes de concluir qualquer transferência.";
  }

  if (pixKeyDisplay) pixKeyDisplay.textContent = PIX_KEY;
  if (pixActions) pixActions.hidden = false;

  if (copyPixBtn) {
    copyPixBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(PIX_KEY);
        copyPixBtn.textContent = "Chave copiada!";
      } catch {
        if (pixStatus) {
          pixStatus.textContent =
            "Copie manualmente a chave exibida abaixo.";
        }
      }
    });
  }
}

/* Teclado da urna simulada. */
function selecionarPeloTeclado(id) {
  urnaNumeroDigitado = "";
  setSelected(id);
  atualizarDisplay();
}

if (urnaKeypad) {
  urnaKeypad.querySelectorAll("[data-digit]").forEach(botao => {
    botao.addEventListener("click", () => {
      if (urnaNumeroDigitado.length >= 2) return;

      if (urnaNumeroDigitado.length === 0) {
        clearSelection();
      }

      urnaNumeroDigitado += botao.dataset.digit;
      atualizarDisplay();
    });
  });
}

if (urnaBranco) {
  urnaBranco.addEventListener("click", () => {
    selecionarPeloTeclado("blank");
  });
}

if (urnaNulo) {
  urnaNulo.addEventListener("click", () => {
    selecionarPeloTeclado("null");
  });
}

if (urnaCorrige) {
  urnaCorrige.addEventListener("click", () => {
    urnaNumeroDigitado = "";
    clearSelection();
    atualizarDisplay("Seleção apagada. Digite 22 ou 13, ou escolha BRANCO/NULO.");

    if (feedback) {
      feedback.textContent =
        "Seleção apagada. Escolha uma opção antes de confirmar.";
    }
  });
}

/* CONFIRMA do teclado seleciona a opção, sem registrar participação. */
if (urnaConfirma) {
  urnaConfirma.addEventListener("click", () => {
    const opcoes = { "22": "1", "13": "2" };

    if (urnaNumeroDigitado) {
      const numero = urnaNumeroDigitado;
      const id = opcoes[numero];

      if (!id) {
        urnaNumeroDigitado = "";
        clearSelection();
        atualizarDisplay(
          "Número inválido. Digite 22 para Flávio ou 13 para Lula."
        );
        return;
      }

      selecionarPeloTeclado(id);
      return;
    }

    if (selectedChoice) {
      atualizarDisplay(
        "Opção selecionada. Use o botão verde para registrar a participação fictícia."
      );
      return;
    }

    atualizarDisplay(
      "Nenhuma opção selecionada. Digite 22 ou 13, ou escolha BRANCO/NULO."
    );
  });
}

renderResults();
clearSelection();
atualizarDisplay();
