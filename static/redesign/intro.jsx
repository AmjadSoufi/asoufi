// Full-screen intro overlay: plays the intro video once per session,
// then fades out and unlocks scrolling. Skip button (or Esc) exits early.

function Intro({ variant, onDone, forcePlay = false }) {
  // Decide whether to show the intro:
  // - Skipped automatically if user has seen it this session (unless forcePlay).
  // - Forced via Tweak / replay button.
  const seenKey = "asoufi.intro.seen";
  const initialShow = forcePlay || !(typeof localStorage !== "undefined" && localStorage.getItem(seenKey));
  const [phase, setPhase] = React.useState(initialShow ? "playing" : "done");
  const videoRef = React.useRef(null);
  const timerRef = React.useRef(null);

  // Lock scroll while intro is on-screen
  React.useEffect(() => {
    if (phase === "playing" || phase === "fading") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [phase]);

  // When the video ends or skip is pressed, run the fade then notify.
  const finish = React.useCallback(() => {
    if (phase !== "playing") return;
    setPhase("fading");
    try { localStorage.setItem(seenKey, "1"); } catch (e) {}
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPhase("done");
      onDone && onDone();
    }, 900);
  }, [phase, onDone]);

  // Safety timeout in case the video never fires `ended` (e.g. autoplay blocked).
  const skipBtnRef = React.useRef(null);
  const prevActiveRef = React.useRef(null);

  React.useEffect(() => {
    if (phase !== "playing") return;
    const v = videoRef.current;
    const onEnded = () => finish();
    if (v) {
      v.addEventListener("ended", onEnded);
      // Try to start playback (muted, so autoplay is allowed).
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
    // Hard cap at 8s
    const cap = setTimeout(finish, 8000);

    // Focus trap: park focus on the Skip button so screen readers /
    // keyboard users can dismiss the overlay; restore focus when it closes.
    prevActiveRef.current = document.activeElement;
    if (skipBtnRef.current) skipBtnRef.current.focus();

    // Skip on Esc / Space / Enter. Also intercept Tab so focus can't leave
    // the dialog while it's open.
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        finish();
        return;
      }
      if (e.key === "Tab" && skipBtnRef.current) {
        e.preventDefault();
        skipBtnRef.current.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      v && v.removeEventListener("ended", onEnded);
      window.removeEventListener("keydown", onKey);
      clearTimeout(cap);
      // Return focus to wherever the user was before we hijacked it.
      if (prevActiveRef.current && typeof prevActiveRef.current.focus === "function") {
        prevActiveRef.current.focus();
      }
    };
  }, [phase, finish]);

  // Re-enter when forcePlay flips true (used by the replay button).
  React.useEffect(() => {
    if (forcePlay && phase === "done") {
      setPhase("playing");
      try { localStorage.removeItem(seenKey); } catch (e) {}
    }
  }, [forcePlay]); // eslint-disable-line

  if (phase === "done") return null;

  // Time-of-day micro-string
  const greet = () => {
    const h = new Date().getHours();
    if (h < 5)  return "Working late.";
    if (h < 12) return "Good morning.";
    if (h < 18) return "Good afternoon.";
    return "Good evening.";
  };

  return (
    <div
      className={"intro " + (phase === "fading" ? "is-fading" : "")}
      role="dialog"
      aria-modal="true"
      aria-label="Intro — press Escape to skip"
    >
      <video
        ref={videoRef}
        className="intro-video"
        src="static/media/intro.mp4"
        muted
        playsInline
        autoPlay
        preload="metadata"
      />

      <button ref={skipBtnRef} className="intro-skip" onClick={finish} aria-label="Skip intro (Esc)">
        <span aria-hidden="true">Skip</span>
        <span className="intro-kbd" aria-hidden="true">esc</span>
      </button>
    </div>
  );
}

Object.assign(window, { Intro });
