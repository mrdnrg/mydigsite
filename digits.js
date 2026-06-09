/* DIGITS — raffle form + tasks
   ============================
   XANO SETUP: paste your Xano API endpoint URL below (e.g.
   "https://xxxx-xxxx.xano.io/api:XXXX/raffle"). The form will POST JSON:
   { "wallet": "0x…", "twitter": "handle" }
   While empty, the form simulates success so the site can be previewed. */
var XANO_ENDPOINT = "https://x8ki-letl-twmt.n7.xano.io/api:wgkvOFMI/raffle";

(function () {
  var form = document.getElementById("raffleForm");
  if (!form) return;

  var walletInput = document.getElementById("wallet");
  var twitterInput = document.getElementById("twitter");
  var enterBtn = document.getElementById("enterBtn");
  var errorEl = document.getElementById("formError");

  // Dev helper: open the site with ?reset to clear your entry and test again
  try {
    if (location.search.indexOf("reset") !== -1) {
      localStorage.removeItem("digits_raffle_entered");
      localStorage.removeItem("digits_task_like");
      localStorage.removeItem("digits_task_repost");
      localStorage.removeItem("digits_task_comment");
    }
  } catch (e) {}

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
  }

  function validWallet(w) {
    return /^0x[a-fA-F0-9]{40}$/.test(w) || /^[a-zA-Z0-9-_.]+\.eth$/.test(w);
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    clearError();

    var wallet = walletInput.value.trim();
    var twitter = twitterInput.value.trim().replace(/^@/, "");

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
      body: JSON.stringify({ wallet: wallet, twitter: twitter })
    })
      .then(function (res) {
        if (res.ok) success();
        else fail();
      })
      .catch(fail);
  });
})();
