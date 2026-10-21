/*
 * Voto Simulado Brasil — simulação local.
 * CONFIGURAÇÃO: coloque sua chave Pix na constante PIX_KEY abaixo.
 * Não adicione CPF, senhas ou dados bancários privados ao site.
 */
const PIX_KEY = ""; // Ex.: "sua-chave-pix-aleatoria-aqui"
const STORAGE_KEY = "votoSimuladoBrasil.v1";
const choices = [
  { id: "1", label: "Opção Aurora" },
  { id: "2", label: "Opção Horizonte" },
  { id: "3", label: "Opção Semente" },
  { id: "blank", label: "Voto em branco" }
];

let selectedChoice = "1";
const options = [...document.querySelectorAll(".option")];
const feedback = document.getElementById("feedback");
const totalCount = document.getElementById("totalCount");
const resultsList = document.getElementById("resultsList");

function loadCounts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return Object.fromEntries(choices.map(c => [c.id, Math.max(0, Number(parsed[c.id]) || 0)]));
  } catch {
    return Object.fromEntries(choices.map(c => [c.id, 0]));
  }
}
function saveCounts(counts) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(counts)); }
  catch { feedback.textContent = "Não foi possível salvar neste navegador. Você ainda pode testar a interface."; }
}
function renderResults() {
  const counts = loadCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  totalCount.textContent = total;
  resultsList.innerHTML = "";
  choices.forEach(choice => {
    const count = counts[choice.id];
    const percent = total ? Math.round(count / total * 100) : 0;
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
  feedback.textContent = "Seleção atualizada. Confirme para registrar uma participação fictícia neste navegador.";
}
options.forEach(button => button.addEventListener("click", () => setSelected(button.dataset.choice)));
document.getElementById("clearBtn").addEventListener("click", () => {
  selectedChoice = null;
  options.forEach(button => {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
  });
  feedback.textContent = "Seleção limpa. Escolha uma opção antes de confirmar.";
});
document.getElementById("confirmBtn").addEventListener("click", () => {
  if (!selectedChoice) {
    feedback.textContent = "Escolha uma opção antes de confirmar.";
    return;
  }
  const counts = loadCounts();
  counts[selectedChoice] = (counts[selectedChoice] || 0) + 1;
  saveCounts(counts);
  renderResults();
  const chosen = choices.find(c => c.id === selectedChoice);
  feedback.textContent = `Participação fictícia registrada: ${chosen.label}. Os dados ficam apenas neste navegador.`;
});
document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Zerar todas as participações salvas neste navegador? Essa ação não pode ser desfeita.")) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  renderResults();
  feedback.textContent = "Os dados locais foram zerados.";
});

if (PIX_KEY.trim()) {
  document.getElementById("pixStatus").textContent = "Chave Pix configurada. Confira o destinatário no aplicativo do seu banco antes de concluir qualquer transferência.";
  document.getElementById("pixKeyDisplay").textContent = PIX_KEY;
  document.getElementById("pixActions").hidden = false;
  document.getElementById("copyPixBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      document.getElementById("copyPixBtn").textContent = "Chave copiada!";
    } catch {
      document.getElementById("pixStatus").textContent = "Copie manualmente a chave exibida abaixo.";
    }
  });
}
renderResults();
