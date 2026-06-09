// DIGITS — Tweaks panel: hero variant + accent color
const DIGITS_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "lineup",
  "accent": "#B3892F",
  "floaty": true
}/*EDITMODE-END*/;

function DigitsTweaksApp() {
  const [t, setTweak] = useTweaks(DIGITS_TWEAK_DEFAULTS);

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

  return (
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
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<DigitsTweaksApp />);
