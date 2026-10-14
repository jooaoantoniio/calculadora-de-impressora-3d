const form = document.getElementById("calculator-form");
const result = document.getElementById("result");
const themeToggle = document.getElementById("theme-toggle");
const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const formatCurrency = (amount) => `R$${numberFormatter.format(amount)}`;

const fields = {
  filamentPricePerKg: document.getElementById("preco-filamento"),
  materialGrams: document.getElementById("material"),
  printHours: document.getElementById("duracao"),
  energyRatePerKwh: document.getElementById("taxa-energia"),
  printerWatts: document.getElementById("consumo"),
  marginPercent: document.getElementById("margem")
};

const resultFields = {
  filamentCost: document.getElementById("filament-cost"),
  energyCost: document.getElementById("energy-cost"),
  costPerGram: document.getElementById("cost-per-gram"),
  totalCost: document.getElementById("total-cost"),
  suggestedPrice: document.getElementById("suggested-price")
};

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("calculator-theme");
} catch {
  savedTheme = null;
}

const systemPrefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
const initialTheme = savedTheme === "dark" || savedTheme === "light"
  ? savedTheme
  : systemPrefersDark ? "dark" : "light";

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const nextTheme = theme === "dark" ? "light" : "dark";
  const nextThemeLabel = nextTheme === "dark" ? "escuro" : "claro";
  const nextThemeDescription = `Alterar para tema ${nextThemeLabel}`;
  themeToggle.setAttribute("aria-label", nextThemeDescription);
  themeToggle.setAttribute("title", nextThemeDescription);

  try {
    localStorage.setItem("calculator-theme", theme);
  } catch {
    return;
  }
}

setTheme(initialTheme);
themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const values = Object.fromEntries(
    Object.entries(fields).map(([name, input]) => [name, input.valueAsNumber])
  );

  if (!Object.values(values).every(Number.isFinite)) {
    return;
  }

  const filamentCost = values.filamentPricePerKg * values.materialGrams / 1000;
  const energyCost = values.printerWatts * values.printHours / 1000 * values.energyRatePerKwh;
  const totalCost = filamentCost + energyCost;
  const costPerGram = totalCost / values.materialGrams;
  const suggestedPrice = totalCost * (1 + values.marginPercent / 100);

  resultFields.filamentCost.textContent = formatCurrency(filamentCost);
  resultFields.energyCost.textContent = formatCurrency(energyCost);
  resultFields.costPerGram.textContent = formatCurrency(costPerGram);
  resultFields.totalCost.textContent = formatCurrency(totalCost);
  resultFields.suggestedPrice.textContent = formatCurrency(suggestedPrice);
  result.hidden = false;
});

form.addEventListener("input", () => {
  result.hidden = true;
});