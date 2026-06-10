// DIGITS — Tweaks panel: accent color + motion
// Hero layout is now fixed: float on desktop, lineup on mobile (see digits.js).
const DIGITS_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#B3892F",
  "floaty": true
}/*EDITMODE-END*/;

// Standalone mode (deployed site, no design-tool host): persist tweaks in
// localStorage. Set to true to bring back the floating ⚙ launcher button
// on the live site.
const DIGITS_SHOW_LAUNCHER = false;
const DIGITS_STANDALONE = window.parent === window;

function digitsLoadSaved() {
  if (!DIGITS_STANDALONE) return DIGITS_TWEAK_DEFAULTS;
  try {
    const saved = JSON.parse(localStorage.getItem("digits_tweaks") || "{}");
    delete saved.heroVariant; // legacy key — hero is no longer a tweak
    return { ...DIGITS_TWEAK_DEFAULTS, ...saved };
  } catch (e) {
    return DIGITS_TWEAK_DEFAULTS;
  }
}

function DigitsTweaksApp() {
  const [t, setTweak] = useTweaks(digitsLoadSaved());
  const [panelOpen, setPanelOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  React.useEffect(() => {
    document.querySelectorAll(".float-char").forEach((el) => {
      el.style.animationPlayState = t.floaty ? "running" : "paused";
    });
  }, [t.floaty]);

  // Standalone: save every change to localStorage
  React.useEffect(() => {
    if (!DIGITS_STANDALONE) return;
    try { localStorage.setItem("digits_tweaks", JSON.stringify(t)); } catch (e) {}
  }, [t]);

  // Standalone: track open/closed so the launcher button can toggle
  React.useEffect(() => {
    if (!DIGITS_STANDALONE) return;
    const onMsg = (e) => {
      const type = e?.data?.type;
      if (type === "__edit_mode_dismissed" || type === "__deactivate_edit_mode") setPanelOpen(false);
      else if (type === "__activate_edit_mode") setPanelOpen(true);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const togglePanel = () => {
    window.postMessage({ type: panelOpen ? "__deactivate_edit_mode" : "__activate_edit_mode" }, "*");
  };

  return (
    <React.Fragment>
      {DIGITS_STANDALONE && DIGITS_SHOW_LAUNCHER && !panelOpen && (
        <button
          onClick={togglePanel}
          title="Design tweaks"
          style={{
            position: "fixed", right: "16px", bottom: "16px", zIndex: 9000,
            width: "44px", height: "44px", borderRadius: "50%",
            border: "1px solid rgba(42,37,30,0.15)", background: "#faf8f2",
            color: "#2a251e", cursor: "pointer", fontSize: "18px",
            boxShadow: "0 8px 20px -8px rgba(42,37,30,0.4)",
          }}
        >&#9881;</button>
      )}
      <TweaksPanel>
        <TweakSection label="Color" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={["#B3892F", "#4E8F86", "#A0566B", "#5A6FA8"]}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakSection label="Motion" />
        <TweakToggle
          label="Floating characters"
          value={t.floaty}
          onChange={(v) => setTweak("floaty", v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<DigitsTweaksApp />);
