document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (menuToggle && nav) {
    const mobileMenu = window.matchMedia("(max-width: 900px)");
    const menuLabel = menuToggle.querySelector(".sr-only");
    const setMenuOpen = (open, restoreFocus = false) => {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuLabel.textContent = open ? "Zatvoriť menu" : "Otvoriť menu";
      nav.classList.toggle("open", open);
      document.documentElement.classList.toggle("menu-open", open);
      document.body.classList.toggle("menu-open", open);
      if (open) {
        nav.querySelector("a").focus();
      } else if (restoreFocus) {
        menuToggle.focus();
      }
    };

    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false, true);
      } else if (event.key === "Tab" && menuToggle.getAttribute("aria-expanded") === "true") {
        const links = [...nav.querySelectorAll("a[href]")];
        const firstLink = links[0];
        const lastLink = links[links.length - 1];
        if (event.shiftKey && document.activeElement === firstLink) {
          event.preventDefault();
          lastLink.focus();
        } else if (!event.shiftKey && document.activeElement === lastLink) {
          event.preventDefault();
          firstLink.focus();
        }
      }
    });

    window.addEventListener("resize", () => {
      if (!mobileMenu.matches && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
      }
    });
  }

  const page = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === page) link.classList.add("active");
  });

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const deviceSelect = document.querySelector("#typ-zariadenia");
  const countField = document.querySelector("#pole-pocet-zariadeni");
  const countInput = document.querySelector("#pocet-zariadeni");
  const form = document.querySelector("#objednavkovy-formular");
  if (deviceSelect && countField && countInput) {
    const updateCountField = () => {
      const show = deviceSelect.value === "Viac zariadení";
      countField.hidden = !show;
      countInput.required = show;
      if (!show) {
        countInput.value = "";
        countInput.removeAttribute("aria-invalid");
        document.querySelector("#chyba-pocet-zariadeni").textContent = "";
      }
    };
    deviceSelect.addEventListener("change", updateCountField);
    updateCountField();
  }

  if (form) {
    const errorSummary = document.querySelector("#prehled-chyb");
    const errorList = errorSummary.querySelector("ul");
    const fields = [
      { input: form.elements.meno, errorId: "chyba-meno", label: "Meno a priezvisko" },
      { input: form.elements.telefon, errorId: "chyba-telefon", label: "Telefón" },
      { input: form.elements.email, errorId: "chyba-email", label: "E-mail" },
      { input: form.elements.typ_zariadenia, errorId: "chyba-typ-zariadenia", label: "Typ zariadenia" },
      { input: form.elements.pocet_zariadeni, errorId: "chyba-pocet-zariadeni", label: "Počet zariadení", conditional: true },
      { input: form.elements.sluzba, errorId: "chyba-sluzba", label: "Požadovaná služba" },
      { input: form.elements.popis, errorId: "chyba-popis-problemu", label: "Popis problému" },
      { input: form.elements.suhlas, errorId: "chyba-suhlas", label: "Súhlas so spracovaním osobných údajov" }
    ];
    let hasSubmitted = false;

    const getError = (field) => {
      const { input } = field;
      if (field.conditional && deviceSelect.value !== "Viac zariadení") return "";
      if (input.type === "checkbox" && !input.checked) return "Toto pole je povinné.";
      if (input.type === "number") {
        if (!input.value) return "Zadajte počet zariadení.";
        if (!Number.isInteger(input.valueAsNumber) || input.valueAsNumber < 1) return "Zadajte kladné celé číslo.";
        return "";
      }
      if (!input.value.trim()) return "Toto pole je povinné.";
      if (input.type === "email" && input.validity.typeMismatch) return "Zadajte e-mail v správnom formáte (napr. meno@domena.sk).";
      return "";
    };

    const validate = () => {
      const errors = [];
      fields.forEach((field) => {
        const message = getError(field);
        const errorNode = document.getElementById(field.errorId);
        errorNode.textContent = message;
        if (message) {
          field.input.setAttribute("aria-invalid", "true");
          errors.push({ ...field, message });
        } else {
          field.input.removeAttribute("aria-invalid");
        }
      });

      errorList.replaceChildren();
      errors.forEach((field) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${field.input.id}`;
        link.textContent = `${field.label}: ${field.message}`;
        link.addEventListener("click", () => field.input.focus());
        item.append(link);
        errorList.append(item);
      });
      errorSummary.hidden = errors.length === 0;
      return errors;
    };

    form.addEventListener("input", () => {
      if (hasSubmitted) validate();
    });
    form.addEventListener("change", () => {
      if (hasSubmitted) validate();
    });
    const submitForm = () => {
      hasSubmitted = true;
      const errors = validate();
      if (errors.length) {
        errorSummary.focus();
        return;
      }
      window.location.assign("potvrdenie.html");
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitForm();
    });
  }
});
