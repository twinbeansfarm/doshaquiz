"use strict";

const intakeEnhancementCopy = {
  en: {
    requiredLegend: "* Required information",
    consultationNote: "For a consultation, please email your quiz results, Health Intake, and photos to Twin Beans Farm:",
    validationMessage: "Please complete the required fields (*) before sharing or printing your Health Intake."
  },
  vi: {
    requiredLegend: "* Thông tin bắt buộc",
    consultationNote: "Để được tư vấn, vui lòng gửi email kết quả trắc nghiệm, hồ sơ sức khoẻ và hình ảnh về email Twin Beans:",
    validationMessage: "Vui lòng hoàn thành các thông tin bắt buộc (*) trước khi chia sẻ hoặc in Hồ sơ sức khoẻ."
  }
};

const objectiveValues = [
  "alternative_medicine",
  "general_wellness",
  "lifestyle_diet",
  "relationships",
  "stress_management"
];

function intakeEnhancementLanguage() {
  return document.documentElement.lang === "en" ? "en" : "vi";
}

function applyHealthIntakeCopy() {
  if (typeof t !== "undefined") {
    t.vi.viewForm = "Hồ sơ sức khoẻ";
    t.vi.printIntake = "In Hồ sơ sức khoẻ";
  }

  if (typeof intakeVi !== "undefined") {
    intakeVi["Print Intake Form"] = "In Hồ sơ sức khoẻ";
    intakeVi["Select the item below that reflects your main objective (one only)."] = "Chọn một mục phản ánh mục tiêu chính của bạn.";
    intakeVi["Note:"] = "Lưu ý:";
    intakeVi["Ayurvedic consultations do not include medical diagnosis or medical treatment. Your wellness facilitator is not a medical professional, but a trained teacher who supports balanced lifestyle practices and natural approaches to improving health in ways that are appropriate for the individual constitution. If you are concerned about a medical condition, you should consult a medical doctor."] = "Tư vấn Ayurveda không bao gồm chẩn đoán hay điều trị y khoa. Người đồng hành không phải nhân viên y tế, mà các giáo viên được đào tạo để hướng dẫn lối sống cân bằng và phương pháp cải thiện sức khoẻ thuận tự nhiên phù hợp với thể trạng cá nhân. Nếu lo ngại về một tình trạng bệnh lý, bạn nên gặp bác sĩ.";
    intakeVi["Objective *"] = "Mục tiêu *";
    intakeVi["What do you want to achieve in terms of your health and wellness? Please also tell us your current concerns. *"] = "Bạn muốn đạt được điều gì về sức khỏe và sự an lành? Vui lòng chia sẻ những mối quan tâm hiện tại. *";
    intakeVi["Please write down all food you have eaten and drank for the last three days, with timing. *"] = "Vui lòng ghi lại toàn bộ thức ăn, đồ uống và thời điểm sử dụng trong ba ngày gần đây. *";
    intakeVi["When and how often do you eliminate? What does your poop look like (color, shape, quantity, odor)? *"] = "Bạn đi tiêu khi nào và bao lâu một lần? Phân có màu sắc, hình dạng, lượng và mùi như thế nào? *";
  }
}

function updateIntakeEnhancementLanguage(lang = intakeEnhancementLanguage()) {
  const copy = intakeEnhancementCopy[lang === "en" ? "en" : "vi"];

  ["quiz-consultation-note", "intake-consultation-note"].forEach(id => {
    const note = document.getElementById(id);
    const text = note?.querySelector("span");
    if (text) text.textContent = copy.consultationNote;
    if (note) note.style.textAlign = "center";
  });
}

function formBlockByHeading(...headings) {
  return [...document.querySelectorAll("#form-view .form-block")].find(block => {
    const heading = block.querySelector(".form-title")?.textContent.trim();
    return headings.includes(heading);
  });
}

function addEnhancementStyles() {
  if (document.getElementById("health-intake-refinement-styles")) return;
  const style = document.createElement("style");
  style.id = "health-intake-refinement-styles";
  style.textContent = `
    .objective-instruction{margin:0 0 14px;color:var(--muted)}
    .objective-note{margin:0 0 22px;padding:16px 18px;background:var(--green-light);border-left:3px solid var(--green)}
    .objective-note strong{display:block;margin-bottom:5px;color:var(--green)}
    .objective-note p{margin:0}
    .objective-required-label{margin-bottom:8px}
  `;
  document.head.appendChild(style);
}

function applyHealthIntakeRefinements() {
  const objectiveRadios = [...document.querySelectorAll('#form-view input[name="objective"]')];
  const objectiveBlock = objectiveRadios[0]?.closest(".form-block");

  if (objectiveBlock) {
    const instruction = objectiveBlock.querySelector("p");
    if (instruction) {
      instruction.className = "objective-instruction print-hide";
      instruction.textContent = "Select the item below that reflects your main objective (one only).";

      let note = objectiveBlock.querySelector(".objective-note");
      if (!note) {
        note = document.createElement("div");
        note.className = "objective-note";
        note.innerHTML = "<strong>Note:</strong><p>Ayurvedic consultations do not include medical diagnosis or medical treatment. Your wellness facilitator is not a medical professional, but a trained teacher who supports balanced lifestyle practices and natural approaches to improving health in ways that are appropriate for the individual constitution. If you are concerned about a medical condition, you should consult a medical doctor.</p>";
        instruction.after(note);
      }
    }

    const objectiveGroup = objectiveRadios[0]?.closest(".form-group");
    if (objectiveGroup && !objectiveGroup.querySelector(".objective-required-label")) {
      const label = document.createElement("div");
      label.className = "form-label objective-required-label";
      label.textContent = "Objective *";
      objectiveGroup.prepend(label);
    }

    objectiveRadios.forEach((radio, index) => {
      radio.value = objectiveValues[index] || `objective_${index + 1}`;
      radio.classList.add("new-intake-field");
      radio.required = index === 0;
    });

    const goal = objectiveBlock.querySelector("textarea");
    const goalLabel = goal?.closest(".form-group")?.querySelector(".form-label");
    if (goal) {
      goal.name = "health_wellness_goal";
      goal.classList.add("new-intake-field");
      goal.required = true;
    }
    if (goalLabel) goalLabel.textContent = "What do you want to achieve in terms of your health and wellness? Please also tell us your current concerns. *";
  }

  const dietBlock = formBlockByHeading("Diet & Elimination", "Chế độ ăn và bài tiết");
  if (dietBlock) {
    const groups = [...dietBlock.querySelectorAll(".form-group")];
    const diet = groups[0]?.querySelector("textarea");
    const elimination = groups[1]?.querySelector("textarea");
    const dietLabel = groups[0]?.querySelector(".form-label");
    const eliminationLabel = groups[1]?.querySelector(".form-label");

    if (diet) {
      diet.name = "diet_three_day_log";
      diet.classList.add("new-intake-field");
      diet.required = true;
    }
    if (elimination) {
      elimination.name = "elimination_pattern";
      elimination.classList.add("new-intake-field");
      elimination.required = true;
    }
    if (dietLabel) dietLabel.textContent = "Please write down all food you have eaten and drank for the last three days, with timing. *";
    if (eliminationLabel) eliminationLabel.textContent = "When and how often do you eliminate? What does your poop look like (color, shape, quantity, odor)? *";
  }

  document.getElementById("required-legend")?.remove();
  addEnhancementStyles();

  if (typeof prepareIntakeControls === "function") prepareIntakeControls();
  if (typeof renderChrome === "function") renderChrome();
  if (typeof saveIntakeData === "function" && !isSharedView) saveIntakeData();
}

function enhanceObjectivePdfLabel() {
  if (typeof buildIntakePdfDocument !== "function") return;
  const originalBuildIntakePdfDocument = buildIntakePdfDocument;
  buildIntakePdfDocument = function() {
    const selected = document.querySelector('#form-view input[name="objective"]:checked');
    const group = selected?.closest(".form-group");
    const groupLabel = group?.querySelector(".objective-required-label");
    const optionLabel = selected?.closest("label")?.textContent.trim();
    const originalLabel = groupLabel?.textContent;

    if (groupLabel && optionLabel) groupLabel.textContent = `${originalLabel} — ${optionLabel}`;
    try {
      return originalBuildIntakePdfDocument();
    } finally {
      if (groupLabel && originalLabel) groupLabel.textContent = originalLabel;
    }
  };
}

function validateIntakeForExport() {
  const form = document.getElementById("form-view");
  if (!form) return true;

  if (typeof updateYogaTeacherRequirement === "function") updateYogaTeacherRequirement();

  const requiredControls = [...form.querySelectorAll("input[required], textarea[required], select[required]")]
    .filter(control => !control.disabled && !control.hasAttribute("data-intake-ignore"));
  const firstInvalid = requiredControls.find(control => !control.checkValidity());

  if (!firstInvalid && form.checkValidity()) {
    if (typeof showActionFeedback === "function") showActionFeedback("", false, "intake");
    return true;
  }

  const copy = intakeEnhancementCopy[intakeEnhancementLanguage()];
  if (typeof showActionFeedback === "function") showActionFeedback(copy.validationMessage, true, "intake");

  const focusTarget = firstInvalid?.id === "intake-date-of-birth"
    ? document.getElementById("intake-date-of-birth-display")
    : firstInvalid;

  if (focusTarget) {
    focusTarget.focus({ preventScroll: true });
    focusTarget.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (firstInvalid?.reportValidity) firstInvalid.reportValidity();
  return false;
}

applyHealthIntakeCopy();
applyHealthIntakeRefinements();
enhanceObjectivePdfLabel();

// Default the consultation guidance to Vietnamese. It changes to English only
// when the user explicitly switches to English, and back to Vietnamese on VN.
updateIntakeEnhancementLanguage("vi");

if (typeof setLang === "function") {
  const originalSetLang = setLang;
  setLang = function(lang) {
    originalSetLang(lang);
    updateIntakeEnhancementLanguage(lang);
  };
}
