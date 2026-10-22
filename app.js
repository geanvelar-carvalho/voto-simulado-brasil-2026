/* Voto Simulado Brasil — simulação fictícia local.

* Os dados ficam somente neste navegador.
* Não é votação oficial nem tem vínculo com o TSE.
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
let urnaNumeroDigitado = "";
let participacaoRegistrada = localStorage.getItem(VOTED_KEY) === "1";

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
const resetBtn = document.getElementById("resetBtn");

/* Elementos da telinha já existentes no index.html. */
const previewPhoto = document.getElementById("previewPhoto");
const previewPlaceholder = document.getElementById("previewPlaceholder");
const previewName = document.getElementById("previewName");
const previewNumber = document.getElementById("previewNumber");
const previewStatus = document.getElementById("previewStatus");
const previewPrompt = document.getElementById("previewPrompt");

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
"Não foi possível salvar os dados neste navegador.";
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
const percent = total ? (count / total) * 100 : 0;

const row = document.createElement("div");
row.className = "result-row";

const label = document.createElement("strong");
label.textContent =
  choice.id === "1" ? `${choice.label} — 22` :
  choice.id === "2" ? `${choice.label} — 13` :
  choice.label;

const track = document.createElement("div");
track.className = "bar-track";
track.setAttribute(
  "aria-label",
  `${percent.toFixed(1).replace(".", ",")}%`
);

const fill = document.createElement("div");
fill.className = "bar-fill";
fill.style.width = `${percent}%`;
track.appendChild(fill);

const value = document.createElement("span");
value.className = "result-value";
value.textContent = `${count} (${percent.toFixed(1).replace(".", ",")}%)`;

row.append(label, track, value);
resultsList.appendChild(row);

});
}

/* Atualiza a telinha com foto, nome e número ao digitar. */
function atualizarPrevia(choice) {
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
? "Número: ${choice.number}"
: "Opção sem número";
}
if (previewStatus) previewStatus.textContent = "SIMULAÇÃO FICTÍCIA";
if (previewPrompt) previewPrompt.textContent = "OPÇÃO SELECIONADA";

if (choice.image && previewPhoto) {
previewPhoto.alt = "Foto de ${choice.label}";
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
previewPlaceholder.textContent = choice.id === "blank" ? "BRANCO" : "NULO";
}
}

function atualizarDisplay(mensagem) {
if (!urnaDisplay) return;

if (mensagem) {
urnaDisplay.textContent = mensagem;
return;
}

if (urnaNumeroDigitado) {
urnaDisplay.textContent = "Número digitado: ${urnaNumeroDigitado}";
return;
}

const chosen = choices.find(choice => choice.id === selectedChoice);
urnaDisplay.textContent = chosen
? "Selecionado: ${chosen.label}${chosen.number ? " — ${chosen.number}" : ""}"
: "Digite 22 ou 13, ou escolha BRANCO/NULO.";
}

function setSelected(id) {
if (participacaoRegistrada) return;

selectedChoice = id;

options.forEach(button => {
const active = button.dataset.choice === id;
button.classList.toggle("selected", active);
button.setAttribute("aria-pressed", String(active));
});

const chosen = choices.find(choice => choice.id === id);
atualizarPrevia(chosen);

if (feedback && chosen) {
feedback.textContent =
"${chosen.label}${chosen.number ? " — ${chosen.number}" : ""} selecionado. Confira a telinha.";
}
}

function clearSelection() {
if (participacaoRegistrada) return;

selectedChoice = null;
options.forEach(button => {
button.classList.remove("selected");
button.setAttribute("aria-pressed", "false");
});
atualizarPrevia(null);
}

function tocarSomFinalizado() {
try {
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
if (!AudioContextClass) return;

const audio = new AudioContextClass();

audio.resume().then(() => {
  const agora = audio.currentTime;

  [880, 1175, 1568].forEach((frequencia, indice) => {
    const oscillator = audio.createOscillator();
    const volume = audio.createGain();
    const inicio = agora + indice * 0.17;

    oscillator.type = "sine";
    oscillator.frequency.value = frequencia;

    volume.gain.setValueAtTime(0.0001, inicio);
    volume.gain.exponentialRampToValueAtTime(0.16, inicio + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.13);

    oscillator.connect(volume);
    volume.connect(audio.destination);
    oscillator.start(inicio);
    oscillator.stop(inicio + 0.14);
  });

  window.setTimeout(() => audio.close().catch(() => {}), 800);
}).catch(() => {});

} catch {
/* O navegador pode bloquear áudio sem impedir o funcionamento do site. */
}
}

function atualizarEstadoBloqueio() {
if (!participacaoRegistrada) return;

options.forEach(button => {
button.disabled = true;
button.setAttribute("aria-disabled", "true");
});

if (urnaKeypad) {
urnaKeypad.querySelectorAll("button").forEach(button => {
button.disabled = true;
});
}

if (confirmBtn) confirmBtn.disabled = true;
if (clearBtn) clearBtn.disabled = true;
if (urnaDisplay) {
urnaDisplay.textContent = "PARTICIPAÇÃO JÁ REGISTRADA NESTE NAVEGADOR";
}
if (feedback) {
feedback.textContent =
"Esta simulação já foi concluída neste navegador. Os dados são locais e não representam votação real.";
}
if (previewStatus) {
previewStatus.textContent = "PARTICIPAÇÃO FICTÍCIA JÁ REGISTRADA";
}
}

options.forEach(button => {
button.addEventListener("click", () => {
if (participacaoRegistrada) return;
urnaNumeroDigitado = "";
setSelected(button.dataset.choice);
atualizarDisplay();
});
});

if (clearBtn) {
clearBtn.addEventListener("click", () => {
if (participacaoRegistrada) return;
urnaNumeroDigitado = "";
clearSelection();
atualizarDisplay();
if (feedback) feedback.textContent = "Seleção limpa. Escolha uma opção.";
});
}

function registrarParticipacao() {
if (participacaoRegistrada) {
atualizarEstadoBloqueio();
return;
}

if (!selectedChoice) {
if (feedback) feedback.textContent =
"Escolha uma opção antes de confirmar a participação fictícia.";
return;
}

const chosen = choices.find(choice => choice.id === selectedChoice);
const counts = loadCounts();
counts[selectedChoice] = (counts[selectedChoice] || 0) + 1;

/* Grava primeiro os resultados e o bloqueio local. */
if (!saveCounts(counts)) return;

try {
localStorage.setItem(VOTED_KEY, "1");
} catch {
if (feedback) {
feedback.textContent =
"Não foi possível guardar o bloqueio neste navegador. A participação não foi finalizada.";
}
return;
}

participacaoRegistrada = true;
renderResults();
tocarSomFinalizado();

if (feedback) {
feedback.textContent =
"Participação fictícia registrada: ${chosen.label}. Esta simulação é local.";
}

if (urnaDisplay) {
urnaDisplay.textContent = "✓ FINALIZADO — SIMULAÇÃO FICTÍCIA";
}

if (previewStatus) {
previewStatus.textContent = "✓ PARTICIPAÇÃO FICTÍCIA FINALIZADA";
}

atualizarEstadoBloqueio();
}

if (confirmBtn) {
confirmBtn.addEventListener("click", registrarParticipacao);
}

if (urnaKeypad) {
urnaKeypad.querySelectorAll("[data-digit]").forEach(button => {
button.addEventListener("click", () => {
if (participacaoRegistrada || urnaNumeroDigitado.length >= 2) return;

  urnaNumeroDigitado += button.dataset.digit;

  const partialChoice = choices.find(choice =>
    choice.number && choice.number.startsWith(urnaNumeroDigitado)
  );

  if (partialChoice) {
    atualizarPrevia(partialChoice);
    if (previewStatus) {
      previewStatus.textContent = "DIGITANDO — SIMULAÇÃO FICTÍCIA";
    }
  } else {
    atualizarPrevia(null);
    if (previewName) previewName.textContent = "NÚMERO DIGITADO";
    if (previewNumber) previewNumber.textContent = urnaNumeroDigitado;
    if (previewStatus) previewStatus.textContent = "Confira o número digitado";
  }

  atualizarDisplay();
});

});
}

function selecionarPeloTeclado(id) {
if (participacaoRegistrada) return;
urnaNumeroDigitado = "";
setSelected(id);
atualizarDisplay();
}

if (urnaBranco) {
urnaBranco.addEventListener("click", () => selecionarPeloTeclado("blank"));
}

if (urnaNulo) {
urnaNulo.addEventListener("click", () => selecionarPeloTeclado("null"));
}

if (urnaCorrige) {
urnaCorrige.addEventListener("click", () => {
if (participacaoRegistrada) return;
urnaNumeroDigitado = "";
clearSelection();
atualizarDisplay("Seleção apagada. Digite 22 ou 13, ou escolha BRANCO/NULO.");
if (feedback) feedback.textContent = "Seleção apagada.";
});
}

if (urnaConfirma) {
urnaConfirma.addEventListener("click", () => {
if (participacaoRegistrada) return;

const idsPorNumero = { "22": "1", "13": "2" };

if (urnaNumeroDigitado) {
  const id = idsPorNumero[urnaNumeroDigitado];

  if (!id) {
    urnaNumeroDigitado = "";
    clearSelection();
    atualizarDisplay("Número inválido. Digite 22 ou 13.");
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

atualizarDisplay("Nenhuma opção selecionada.");

});
}

if (resetBtn) {
resetBtn.addEventListener("click", () => {
if (!confirm(
"Zerar os resultados locais? Isso apaga as contagens deste navegador."
)) return;

try {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(VOTED_KEY);
} catch {
  if (feedback) feedback.textContent =
    "Não foi possível alterar o armazenamento deste navegador.";
  return;
}

participacaoRegistrada = false;
urnaNumeroDigitado = "";
selectedChoice = null;

options.forEach(button => {
  button.disabled = false;
  button.classList.remove("selected");
  button.setAttribute("aria-pressed", "false");
  button.removeAttribute("aria-disabled");
});

if (urnaKeypad) {
  urnaKeypad.querySelectorAll("button").forEach(button => {
    button.disabled = false;
  });
}

if (confirmBtn) confirmBtn.disabled = false;
if (clearBtn) clearBtn.disabled = false;

atualizarPrevia(null);
atualizarDisplay();
renderResults();

if (feedback) {
  feedback.textContent = "Dados locais zerados. A simulação está liberada novamente neste navegador.";
}

});
}

/* Configuração da chave Pix e botão de cópia. */
if (PIX_KEY.trim()) {
const pixStatus = document.getElementById("pixStatus");
const pixKeyDisplay = document.getElementById("pixKeyDisplay");
const pixActions = document.getElementById("pixActions");
const copyPixBtn = document.getElementById("copyPixBtn");

if (pixStatus) {
pixStatus.textContent =
"Chave Pix configurada. Confira o destinatário no aplicativo do banco antes de transferir.";
}

if (pixKeyDisplay) pixKeyDisplay.textContent = PIX_KEY;
if (pixActions) pixActions.hidden = false;

if (copyPixBtn) {
copyPixBtn.addEventListener("click", async () => {
try {
await navigator.clipboard.writeText(PIX_KEY);
copyPixBtn.textContent = "Chave copiada!";
} catch {
if (pixStatus) pixStatus.textContent =
"Copie manualmente a chave exibida na tela.";
}
});
}
}

renderResults();
atualizarPrevia(null);
atualizarDisplay();
atualizarEstadoBloqueio();
