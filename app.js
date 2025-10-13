(function () {
  "use strict";

  /**
   * Format a number with specific decimal places, trimming trailing zeros.
   */
  function formatNumber(value, decimals) {
    const fixed = Number(value).toFixed(decimals);
    return fixed.replace(/\.0+$/, "").replace(/(\.[0-9]*?)0+$/, "$1");
  }

  function computeBmi(weightKg, heightCm) {
    const heightMeters = heightCm / 100;
    if (heightMeters <= 0) return NaN;
    return weightKg / (heightMeters * heightMeters);
  }

  function getBmiCategory(bmi) {
    if (Number.isNaN(bmi)) return "—";
    if (bmi < 16) return "Severe thinness";
    if (bmi < 17) return "Moderate thinness";
    if (bmi < 18.5) return "Mild thinness";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    if (bmi < 35) return "Obesity class I";
    if (bmi < 40) return "Obesity class II";
    return "Obesity class III";
  }

  function computeHealthyWeightRange(heightCm) {
    const h = heightCm / 100;
    if (h <= 0) return null;
    const min = 18.5 * h * h;
    const max = 24.9 * h * h;
    return { min, max };
  }

  function showError(message) {
    const errorEl = document.getElementById("formError");
    errorEl.textContent = message;
    errorEl.hidden = !message;
  }

  function clearResults() {
    document.getElementById("results").hidden = true;
    document.getElementById("bmiValue").textContent = "—";
    document.getElementById("bmiCategory").textContent = "—";
    document.getElementById("healthyRange").hidden = true;
    document.getElementById("rangeValue").textContent = "";
    showError("");
  }

  function onSubmit(event) {
    event.preventDefault();

    const gender = /** @type {HTMLSelectElement} */ (document.getElementById("gender")).value;
    const weightInput = /** @type {HTMLInputElement} */ (document.getElementById("weightKg"));
    const heightInput = /** @type {HTMLInputElement} */ (document.getElementById("heightCm"));

    const weightKg = parseFloat(weightInput.value);
    const heightCm = parseFloat(heightInput.value);

    if (!gender) {
      showError("Please select a gender.");
      return;
    }
    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      showError("Please enter a valid weight in kilograms.");
      weightInput.focus();
      return;
    }
    if (!Number.isFinite(heightCm) || heightCm <= 0) {
      showError("Please enter a valid height in centimeters.");
      heightInput.focus();
      return;
    }

    if (weightKg < 10 || weightKg > 500) {
      showError("Weight should be between 10 and 500 kg.");
      weightInput.focus();
      return;
    }
    if (heightCm < 50 || heightCm > 272) {
      showError("Height should be between 50 and 272 cm.");
      heightInput.focus();
      return;
    }

    showError("");

    const bmi = computeBmi(weightKg, heightCm);
    const category = getBmiCategory(bmi);

    const bmiValueEl = document.getElementById("bmiValue");
    const bmiCategoryEl = document.getElementById("bmiCategory");
    const resultsEl = document.getElementById("results");

    bmiValueEl.textContent = Number.isNaN(bmi) ? "—" : formatNumber(bmi, 1);
    bmiCategoryEl.textContent = category;

    const range = computeHealthyWeightRange(heightCm);
    const rangeEl = document.getElementById("healthyRange");
    const rangeValueEl = document.getElementById("rangeValue");

    if (range) {
      rangeValueEl.textContent = `${formatNumber(range.min, 1)} kg – ${formatNumber(range.max, 1)} kg`;
      rangeEl.hidden = false;
    } else {
      rangeEl.hidden = true;
      rangeValueEl.textContent = "";
    }

    resultsEl.hidden = false;
  }

  function onReset() {
    clearResults();
  }

  window.addEventListener("DOMContentLoaded", function () {
    clearResults();
    const form = document.getElementById("bmiForm");
    form.addEventListener("submit", onSubmit);
    document.getElementById("resetBtn").addEventListener("click", onReset);
  });
})();
