/* DIGITS — raffle form + tasks
   ============================
   XANO SETUP: paste your Xano API endpoint URL below (e.g.
   "https://xxxx-xxxx.xano.io/api:XXXX/raffle"). The form will POST JSON:
   { "wallet": "0x…", "twitter": "handle" }
   While empty, the form simulates success so the site can be previewed. */
var XANO_ENDPOINT = "https://x8ki-letl-twmt.n7.xano.io/api:wgkvOFMI/raffle";

/* ---- Hero by device: float on desktop, lineup on mobile ---- */
(function () {
  function updateHero() {
    document.body.dataset.hero = window.innerWidth <= 920 ? "lineup" : "float";
  }
  window.addEventListener("resize", updateHero);
  updateHero();
})();

/* ---- Auto-zoom for wide screens ----
   The layout is designed around ~1440px. On wide monitors we scale the whole
   page up (like browser zoom) so it doesn't look small and spread out.
   Each hero variant has its own "design width" so e.g. float gets ~175%
   and lineup ~140% on a 2560px screen. Never scales below 1. */
(function () {
  var BASE_WIDTH = { float: 1460, lineup: 1830, solo: 1640 };
  var MAX_ZOOM = 2;

  function updateZoom() {
    var hero = document.body.dataset.hero || "lineup";
    var base = BASE_WIDTH[hero] || 1640;
    var z = Math.min(MAX_ZOOM, Math.max(1, window.innerWidth / base));

    // The full zoom is only needed for the hero (floating digits stage).
    // The rest of the page gets just a gentle bump so it doesn't feel cramped.
    var zPage = 1 + (z - 1) * 0.65;
    document.body.style.zoom = zPage === 1 ? "" : zPage;

    var heroEl = document.querySelector(".hero");
    if (heroEl) {
      var zHero = z / zPage; // compounds with body zoom -> hero ends up at full z
      heroEl.style.zoom = Math.abs(zHero - 1) < 0.005 ? "" : zHero;
    }
  }

  window.addEventListener("resize", updateZoom);
  window.addEventListener("tweakchange", updateZoom);
  new MutationObserver(updateZoom).observe(document.body, {
    attributes: true,
    attributeFilter: ["data-hero"]
  });
  updateZoom();
})();

(function () {
  var form = document.getElementById("raffleForm");
  if (!form) return;

  var walletInput = document.getElementById("wallet");
  var twitterInput = document.getElementById("twitter");
  var commentInput = document.getElementById("commentLink");
  var enterBtn = document.getElementById("enterBtn");
  var errorEl = document.getElementById("formError");

  // Already entered on this device?
  try {
    if (localStorage.getItem("digits_raffle_entered") === "1") {
      form.classList.add("entered");
    }
  } catch (e) {}

  // Task buttons: open X, mark done (no verification needed)
  var tasks = form.querySelectorAll(".task");
  tasks.forEach(function (task) {
    task.addEventListener("click", function () {
      task.classList.add("done");
      try {
        localStorage.setItem("digits_task_" + task.dataset.task, "1");
      } catch (e) {}
    });
    try {
      if (localStorage.getItem("digits_task_" + task.dataset.task) === "1") {
        task.classList.add("done");
      }
    } catch (e) {}
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = "block";
  }
  function clearError() {
    errorEl.style.display = "none";
    walletInput.classList.remove("invalid");
    twitterInput.classList.remove("invalid");
    commentInput.classList.remove("invalid");
  }

  function validWallet(w) {
    return /^0x[a-fA-F0-9]{40}$/.test(w) || /^[a-zA-Z0-9-_.]+\.eth$/.test(w);
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    clearError();

    var wallet = walletInput.value.trim();
    var twitter = twitterInput.value.trim().replace(/^@/, "");
    var comment = commentInput.value.trim();

    if (!validWallet(wallet)) {
      walletInput.classList.add("invalid");
      showError("That doesn't look like an ETH wallet (0x… or name.eth).");
      return;
    }
    if (!/^[A-Za-z0-9_]{1,15}$/.test(twitter)) {
      twitterInput.classList.add("invalid");
      showError("Drop a valid X handle, like @digits_nft.");
      return;
    }
    if (!/^https?:\/\/(www\.)?(x\.com|twitter\.com)\/.+/i.test(comment)) {
      commentInput.classList.add("invalid");
      showError("Paste the link to your comment — it should start with https://x.com/…");
      return;
    }

    enterBtn.disabled = true;
    enterBtn.textContent = "Entering…";

    function success() {
      try { localStorage.setItem("digits_raffle_entered", "1"); } catch (e) {}
      form.classList.add("entered");
    }
    function fail() {
      enterBtn.disabled = false;
      enterBtn.textContent = "Enter the Raffle";
      showError("Something broke. Try again in a sec.");
    }

    if (!XANO_ENDPOINT) {
      // No backend wired yet — simulate success for preview
      setTimeout(success, 700);
      return;
    }

    fetch(XANO_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: wallet, twitter: twitter, comment_url: comment })
    })
      .then(function (res) {
        if (res.ok) success();
        else fail();
      })
      .catch(fail);
  });
})();
