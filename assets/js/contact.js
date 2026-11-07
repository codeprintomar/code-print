// ---------- Contact form submit (index.html) ----------
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("contact-form-status");

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwiDLlKdDCCsYV-Wc0UG99OV2CXiOZbAJOMHoGwYCmI5M6aZQ4_FwyCJKiCUZU5eyMP/exec"; // Google Apps Script (backup copy)
const FORMSPREE_URL = "https://formspree.io/f/xjyvkdld"; // Formspree (sends the email)

if (contactForm) {
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    var hp = contactForm.querySelector('.form-honeypot');
    if (hp && hp.value) return;

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = {
      name: document.getElementById("cf-name").value.trim(),
      email: document.getElementById("cf-email").value.trim(),
      message: document.getElementById("cf-message").value.trim()
    };

    submitButton.disabled = true;
    submitButton.innerHTML = "<span>جارٍ الإرسال...</span>";
    formStatus.textContent = "جارٍ إرسال رسالتك...";

    try {
      const googleRequest = fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(formData)
      });

      const formspreeRequest = fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(formData)
      });

      const results = await Promise.all([googleRequest, formspreeRequest]);
      if (!results[1].ok) throw new Error("Formspree submission failed");

      formStatus.textContent = "✓ تم إرسال رسالتك بنجاح! تحقق من بريدك الإلكتروني.";
      contactForm.reset();
    } catch (error) {
      console.error(error);
      formStatus.textContent = "حدث خطأ أثناء الإرسال. حاول مرة أخرى.";
    }

    submitButton.disabled = false;
    submitButton.innerHTML = "<span>إرسال</span>";
  });
}