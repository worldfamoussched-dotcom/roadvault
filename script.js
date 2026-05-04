(function () {
  const splashIntro = document.querySelector("#splashIntro");
  const splashIntroVideo = document.querySelector("#splashIntroVideo");
  const productStage = document.querySelector(".product-stage");
  const founderForm = document.querySelector("#founderForm");
  const confirmationPanel = document.querySelector("#confirmationPanel");
  const founderIdValue = document.querySelector("#founderIdValue");
  const founderFormNote = document.querySelector("#founderFormNote");
  const trackChoices = Array.from(document.querySelectorAll(".track-choice"));
  const interestInput = founderForm?.querySelector('input[name="interest"]');
  const submittedAtInput = founderForm?.querySelector('input[name="submittedAt"]');
  const roleSelect = founderForm?.querySelector('select[name="role"]');
  const interestButtons = Array.from(document.querySelectorAll("[data-founder-interest]"));

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function setupSplashIntro(intro, video) {
    if (!intro || !video) {
      document.body.classList.remove("splash-lock");
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dismissed = false;

    function dismissIntro() {
      if (dismissed) {
        return;
      }

      dismissed = true;
      intro.classList.add("is-exiting");
      document.body.classList.remove("splash-lock");

      setTimeout(() => {
        intro.classList.add("is-hidden");
        video.pause();
      }, 1250);
    }

    if (reducedMotion.matches) {
      dismissIntro();
      return;
    }

    video.addEventListener("ended", dismissIntro, { once: true });
    video.addEventListener(
      "error",
      () => {
        setTimeout(dismissIntro, 900);
      },
      { once: true },
    );

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        setTimeout(dismissIntro, 1400);
      });
    }

    setTimeout(dismissIntro, 9200);
  }

  function setupProductStage(stage) {
    if (!stage) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function setCenterState() {
      stage.style.setProperty("--pointer-x", "50%");
      stage.style.setProperty("--pointer-y", "48%");
      stage.style.setProperty("--stage-tilt-x", "0deg");
      stage.style.setProperty("--stage-tilt-y", "0deg");
      stage.style.setProperty("--photo-shift-x", "0px");
      stage.style.setProperty("--photo-shift-y", "0px");
      stage.style.setProperty("--grid-shift-x", "0px");
      stage.style.setProperty("--grid-shift-y", "0px");
      stage.style.setProperty("--scan-y", "44%");
    }

    function updateStage(event) {
      const rect = stage.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      const shiftX = (x - 0.5) * 22;
      const shiftY = (y - 0.5) * 16;

      stage.classList.add("is-active");
      stage.style.setProperty("--pointer-x", `${x * 100}%`);
      stage.style.setProperty("--pointer-y", `${y * 100}%`);
      stage.style.setProperty("--scan-y", `${y * 100}%`);

      if (reducedMotion.matches) {
        stage.style.setProperty("--stage-tilt-x", "0deg");
        stage.style.setProperty("--stage-tilt-y", "0deg");
        stage.style.setProperty("--photo-shift-x", "0px");
        stage.style.setProperty("--photo-shift-y", "0px");
        stage.style.setProperty("--grid-shift-x", "0px");
        stage.style.setProperty("--grid-shift-y", "0px");
        return;
      }

      stage.style.setProperty("--stage-tilt-x", `${(0.5 - y) * 5}deg`);
      stage.style.setProperty("--stage-tilt-y", `${(x - 0.5) * 6}deg`);
      stage.style.setProperty("--photo-shift-x", `${shiftX * -0.32}px`);
      stage.style.setProperty("--photo-shift-y", `${shiftY * -0.32}px`);
      stage.style.setProperty("--grid-shift-x", `${shiftX * 0.42}px`);
      stage.style.setProperty("--grid-shift-y", `${shiftY * 0.42}px`);
    }

    function resetStage() {
      stage.classList.remove("is-active");
      setCenterState();
    }

    stage.addEventListener("pointerenter", updateStage);
    stage.addEventListener("pointermove", updateStage);
    stage.addEventListener("pointerleave", resetStage);
    stage.addEventListener("focus", () => {
      stage.classList.add("is-active");
      setCenterState();
    });
    stage.addEventListener("blur", resetStage);
  }

  function setInterest(value) {
    if (!interestInput) {
      return;
    }

    interestInput.value = value;

    trackChoices.forEach((choice) => {
      const isActive = choice.dataset.choice === value;
      choice.classList.toggle("active", isActive);
      choice.setAttribute("aria-checked", String(isActive));
    });
  }

  function moveRadioSelection(items, currentItem, direction, onSelect) {
    const currentIndex = items.indexOf(currentItem);
    const nextIndex = (currentIndex + direction + items.length) % items.length;
    const nextItem = items[nextIndex];
    onSelect(nextItem);
    nextItem.focus();
  }

  function handleRadioKeydown(event, items, onSelect) {
    const keys = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];
    if (!keys.includes(event.key)) {
      return;
    }

    event.preventDefault();
    const direction = ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1;
    moveRadioSelection(items, event.currentTarget, direction, onSelect);
  }

  function generateFounderId(role) {
    const prefixMap = {
      Creator: "CR",
      Investor: "IN",
      Sponsor: "SP",
      Press: "PR",
      Manufacturer: "MF",
      Other: "OT",
    };
    const prefix = prefixMap[role] || "FD";
    const stamp = Date.now().toString(36).slice(-6).toUpperCase();
    return `RV-${prefix}-${stamp}`;
  }

  function saveLocalBackup(entry) {
    const existingEntries = JSON.parse(
      window.localStorage.getItem("roadvaultFounderLeads") || "[]",
    );
    existingEntries.push(entry);
    window.localStorage.setItem(
      "roadvaultFounderLeads",
      JSON.stringify(existingEntries),
    );
  }

  function showConfirmation(founderId, role, interest) {
    if (!confirmationPanel || !founderIdValue) {
      return;
    }

    founderIdValue.textContent = founderId;
    confirmationPanel.classList.add("is-visible");
    confirmationPanel.querySelector(
      "#confirmationSummary",
    ).textContent = `${role} / ${interest} / dossier received`;
  }

  function getFounderEntry(formData, founderId) {
    return {
      founderId,
      submittedAt: formData.get("submittedAt"),
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      interest: formData.get("interest"),
      message: formData.get("message"),
      consent: formData.get("consent") === "on",
    };
  }

  function encodeFormData(formData) {
    return new URLSearchParams(formData).toString();
  }

  function prefillFounderForm() {
    if (!founderForm) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const interest = params.get("interest");
    const role = params.get("role");

    if (interest) {
      setInterest(interest);
    }

    if (role && roleSelect) {
      roleSelect.value = role;
    }
  }

  setupSplashIntro(splashIntro, splashIntroVideo);
  setupProductStage(productStage);
  prefillFounderForm();

  interestButtons.forEach((button) => {
    button.addEventListener("click", () => setInterest(button.dataset.choice));
    button.addEventListener("keydown", (event) => {
      handleRadioKeydown(event, interestButtons, (nextButton) => {
        setInterest(nextButton.dataset.choice);
      });
    });
  });

  if (founderForm) {
    founderForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      submittedAtInput.value = new Date().toISOString();

      const formData = new FormData(founderForm);
      const founderId = generateFounderId(formData.get("role"));
      formData.append("founderId", founderId);

      const entry = getFounderEntry(formData, founderId);
      const isLocalPreview =
        window.location.protocol === "file:" ||
        ["127.0.0.1", "localhost"].includes(window.location.hostname);

      founderFormNote.textContent = "Securing dossier...";

      if (isLocalPreview) {
        saveLocalBackup(entry);
        showConfirmation(founderId, entry.role, entry.interest);
        founderFormNote.textContent =
          "Preview saved locally. Deploy on Netlify to capture live submissions.";
        founderForm.reset();
        setInterest("Founder Kit");
        return;
      }

      try {
        const response = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encodeFormData(formData),
        });

        if (!response.ok) {
          throw new Error("Founder submission failed");
        }

        saveLocalBackup(entry);
        showConfirmation(founderId, entry.role, entry.interest);
        founderFormNote.textContent = "Founder ID generated. Dossier received.";
        founderForm.reset();
        setInterest("Founder Kit");
      } catch (error) {
        founderFormNote.textContent =
          "Submission did not go through. Please try again in a moment.";
      }
    });
  }
})();
