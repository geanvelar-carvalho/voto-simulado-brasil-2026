/*
 * Voto Simulado Brasil — simulação local.
 * CONFIGURAÇÃO: coloque sua chave Pix na constante PIX_KEY abaixo.
 * Não adicione CPF, senhas ou dados bancários privados ao site.
 */
const PIX_KEY = "70df6774-9247-464e-b627-f098e87d73b7";
const STORAGE_KEY = "votoSimuladoBrasil.v1";

const choices = [
  { id: "1", label: "Flávio Bolsonaro — 22" },
  { id: "2", label: "Luiz Inácio Lula da Silva — 13" },
  { id: "blank", label: "Voto em branco" },
  { id: "null", label: "Voto nulo" }
];

// Nenhuma opção fica selecionada automaticamente.
let selectedChoice = null;

const options = [...document.querySelectorAll(".option")];
const feedback = document.getElementById("feedback");
const totalCount = document.getElementById("totalCount");
const resultsList = document.getElementById("resultsList");

function loadCounts() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    return Object.fromEntries(
      choices.map(choice => [
        choice.id,
        Math.max(0, Number(parsed[choice.id]) || 0)
      ])
    );
  } catch {
    return Object.fromEntries(
      choices.map(choice => [choice.id, 0])
    );
  }
}

function saveCounts(counts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch {
    feedback.textContent =
      "Não foi possível salvar neste navegador. Você ainda pode testar a interface.";
  }
}

function renderResults() {
  const counts = loadCounts();
  const total = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0
  );

  totalCount.textContent = total;
  resultsList.innerHTML = "";

  choices.forEach(choice => {
    const count = counts[choice.id];
    const percent = total
      ? Math.round((count / total) * 100)
      : 0;

    const row = document.createElement("div");
    row.className = "result-row";

    const label = document.createElement("strong");
    label.textContent = choice.label;

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
      `${chosen.label} selecionado. Aperte o botão verde para registrar a participação fictícia.`;
  }
}

function clearSelection() {
  selectedChoice = null;

  options.forEach(button => {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
  });
}

// Seleção pelas opções da página.
options.forEach(button => {
  button.addEventListener("click", () => {
    urnaNumeroDigitado = "";
    setSelected(button.dataset.choice);
    atualizarDisplay();
  });
});

// Botão para limpar a seleção.
document.getElementById("clearBtn").addEventListener("click", () => {
  urnaNumeroDigitado = "";
  clearSelection();
  atualizarDisplay();

  feedback.textContent =
    "Seleção limpa. Escolha uma opção antes de confirmar.";
});

// Somente este botão registra uma participação fictícia.
document.getElementById("confirmBtn").addEventListener("click", () => {
  if (!selectedChoice) {
    feedback.textContent =
      "Escolha uma opção antes de confirmar.";
    return;
  }

  const counts = loadCounts();
  counts[selectedChoice] = (counts[selectedChoice] || 0) + 1;

  saveCounts(counts);
  renderResults();

  const chosen = choices.find(
    choice => choice.id === selectedChoice
  );

  feedback.textContent =
    `Participação fictícia registrada: ${chosen.label}. Os dados ficam apenas neste navegador.`;
});

// Zerar resultados locais.
document.getElementById("resetBtn").addEventListener("click", () => {
  if (
    !confirm(
      "Zerar todas as participações salvas neste navegador? Essa ação não pode ser desfeita."
    )
  ) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}

  renderResults();
  feedback.textContent = "Os dados locais foram zerados.";
});

// Configuração do Pix.
if (PIX_KEY.trim()) {
  document.getElementById("pixStatus").textContent =
    "Chave Pix configurada. Confira o destinatário no aplicativo do seu banco antes de concluir qualquer transferência.";

  document.getElementById("pixKeyDisplay").textContent = PIX_KEY;
  document.getElementById("pixActions").hidden = false;

  document.getElementById("copyPixBtn").addEventListener(
    "click",
    async () => {
      try {
        await navigator.clipboard.writeText(PIX_KEY);
        document.getElementById("copyPixBtn").textContent =
          "Chave copiada!";
      } catch {
        document.getElementById("pixStatus").textContent =
          "Copie manualmente a chave exibida abaixo.";
      }
    }
  );
}

renderResults();

/* Teclado da urna simulada */
let urnaNumeroDigitado = "";

const urnaDisplay = document.getElementById("urnaDisplay");
const urnaKeypad = document.getElementById("urnaKeypad");
const urnaCorrige = document.getElementById("urnaCorrige");
const urnaConfirma = document.getElementById("urnaConfirma");
const urnaBranco = document.getElementById("urnaBranco");
const urnaNulo = document.getElementById("urnaNulo");

function atualizarDisplay(mensagem) {
  if (!urnaDisplay) return;

  if (mensagem) {
    urnaDisplay.textContent = mensagem;
  } else if (urnaNumeroDigitado) {
    urnaDisplay.textContent =
      `Número digitado: ${urnaNumeroDigitado}`;
  } else if (selectedChoice) {
    const chosen = choices.find(
      choice => choice.id === selectedChoice
    );

    urnaDisplay.textContent = chosen
      ? `Selecionado: ${chosen.label}`
      : "Digite 22 (Flávio) ou 13 (Lula).";
  } else {
    urnaDisplay.textContent =
      "Digite 22 (Flávio) ou 13 (Lula), ou escolha BRANCO/NULO.";
  }
}

function selecionarPeloTeclado(id) {
  urnaNumeroDigitado = "";
  setSelected(id);
  atualizarDisplay();
}

// Teclas numéricas: apenas digitam o número.
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

// BRANCO seleciona voto em branco, sem registrar participação.
if (urnaBranco) {
  urnaBranco.addEventListener("click", () => {
    selecionarPeloTeclado("blank");
  });
}

// NULO seleciona voto nulo, sem registrar participação.
if (urnaNulo) {
  urnaNulo.addEventListener("click", () => {
    selecionarPeloTeclado("null");
  });
}

// CORRIGE apaga o número e limpa a seleção.
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

// CONFIRMA na urna seleciona a opção digitada.
// Não registra a participação; isso é feito pelo botão verde.
if (urnaConfirma) {
  urnaConfirma.addEventListener("click", () => {
    const opcoes = {
      "22": "1",
      "13": "2"
    };

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

      urnaNumeroDigitado = "";
      setSelected(id);

      const chosen = choices.find(choice => choice.id === id);

      atualizarDisplay(
        `${chosen.label} selecionado. Use o botão verde para registrar a participação fictícia.`
      );
      return;
    }

    if (selectedChoice === "blank" || selectedChoice === "null") {
      const chosen = choices.find(
        choice => choice.id === selectedChoice
      );

      atualizarDisplay(
        `${chosen.label} selecionado. Use o botão verde para registrar a participação fictícia.`
      );
      return;
    }

    if (selectedChoice) {
      const chosen = choices.find(
        choice => choice.id === selectedChoice
      );

      atualizarDisplay(
        `${chosen.label} selecionado. Use o botão verde para registrar a participação fictícia.`
      );
      return;
    }

    atualizarDisplay(
      "Nenhuma opção selecionada. Digite 22 ou 13, ou escolha BRANCO/NULO."
    );
  });
}

// Deixa as opções visuais sincronizadas com a seleção inicial.
clearSelection();
atualizarDisplay();
                        
