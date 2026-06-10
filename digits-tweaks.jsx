// DIGITS — Tweaks panel: hero variant + accent color
const DIGITS_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "lineup",
  "accent": "#B3892F",
  "floaty": true
}/*EDITMODE-END*/;

// Standalone mode (deployed site, no design-tool host): persist tweaks in
// localStorage and show a small launcher button to open the panel.
const DIGITS_STANDALONE = window.parent === window;

function digitsLoadSaved() {
  if (!DIGITS_STANDALONE) return DIGITS_TWEAK_DEFAULTS;
  try {
    const saved = JSON.parse(localStorage.getItem("digits_tweaks") || "{}");
    return { ...DIGITS_TWEAK_DEFAULTS, ...saved };
  } catch (e) {
    return DIGITS_TWEAK_DEFAULTS;
  }
}

function DigitsTweaksApp() {
  const [t, setTweak] = useTweaks(digitsLoadSaved());
  const [panelOpen, setPanelOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.dataset.hero = t.heroVariant;
  }, [t.heroVariant]);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  React.useEffect(() => {
    document.querySelectorAll(".float-char").forEach((el) => {
      el.style.animationPlayState = t.floaty ? "running" : "paused";
    });
  }, [t.floaty, t.heroVariant]);

  // Standalone: save every change to localStorage
  React.useEffect(() => {
    if (!DIGITS_STANDALONE) return;
    const onChange = () => {
      try { localStorage.setItem("digits_tweaks", JSON.stringify(t)); } catch (e) {}
    };
    onChange();
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
      {DIGITS_STANDALONE && !panelOpen && (
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
        <TweakSection label="Hero" />
        <TweakRadio
          label="Layout"
          value={t.heroVariant}
          options={["lineup", "solo", "float"]}
          onChange={(v) => setTweak("heroVariant", v)}
        />
        <TweakToggle
          label="Floating motion"
          value={t.floaty}
          onChange={(v) => setTweak("floaty", v)}
        />
        <TweakSection label="Color" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={["#B3892F", "#4E8F86", "#A0566B", "#5A6FA8"]}
          onChange={(v) => setTweak("accent", v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<DigitsTweaksApp />);
