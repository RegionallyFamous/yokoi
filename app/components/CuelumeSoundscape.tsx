"use client";

import { useEffect, useState } from "react";
import { bind, play, setEnabled } from "cuelume";

const soundPreferenceKey = "yokoi-cuelume-enabled";

export default function CuelumeSoundscape() {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(soundPreferenceKey);
    const enabled = storedPreference !== "false";

    setSoundOn(enabled);
    setEnabled(enabled);
    bind();
  }, []);

  const toggleSound = () => {
    const enabled = !soundOn;

    if (enabled) {
      setEnabled(true);
      play("ready");
    } else {
      play("droplet");
      setEnabled(false);
    }

    setSoundOn(enabled);
    window.localStorage.setItem(soundPreferenceKey, String(enabled));
  };

  return (
    <button
      className="sound-control"
      type="button"
      aria-label={`Turn Yokoi interaction sounds ${soundOn ? "off" : "on"}`}
      aria-pressed={soundOn}
      title="Interface sounds by Cuelume"
      onClick={toggleSound}
    >
      <span className="sound-meter" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>CUELUME</span>
      <strong>{soundOn ? "ON" : "OFF"}</strong>
    </button>
  );
}
