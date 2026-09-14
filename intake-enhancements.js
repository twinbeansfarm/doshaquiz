"use strict";

const intakeEnhancementCopy = {
  en: {
    requiredLegend: "* Required information",
    consultationNote: "For a consultation, please email your quiz results, Health Intake, and photos to Twin Beans Farm:",
    validationMessage: "Please complete the required fields (*) before sharing or printing your Health Intake."
  },
  vi: {
    requiredLegend: "* Thông tin bắt buộc",
    consultationNote: "Để được tư vấn, vui lòng gửi email kết quả trắc nghiệm, hồ sơ y tế và hình ảnh về email Twin Beans:",
    validationMessage: "Vui lòng hoàn thành các thông tin bắt buộc (*) trước khi chia sẻ hoặc in Hồ sơ y tế."
  }
};

function intakeEnhancementLanguage() {
  return document.documentElement.lang === "en" ? "en" : "vi";
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

// The form already marks required fields with *, so no separate legend is needed.
document.getElementById("required-legend")?.remove();

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
