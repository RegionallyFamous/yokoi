"use client";

import { useEffect, useSyncExternalStore } from "react";
import { bind, play, setEnabled } from "cuelume";

const soundPreferenceKey = "yokoi-cuelume-enabled";
const soundPreferenceEvent = "yokoi-cuelume-change";

function subscribeToSoundPreference(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(soundPreferenceEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(soundPreferenceEvent, onStoreChange);
  };
}

function getSoundPreference() {
  return window.localStorage.getItem(soundPreferenceKey) !== "false";
}

function getServerSoundPreference() {
  return true;
}

export default function CuelumeSoundscape() {
  const soundOn = useSyncExternalStore(
    subscribeToSoundPreference,
    getSoundPreference,
    getServerSoundPreference,
  );

  useEffect(() => {
    bind();
  }, []);

  useEffect(() => {
    setEnabled(soundOn);
  }, [soundOn]);

  const toggleSound = () => {
    const enabled = !soundOn;

    if (enabled) {
      setEnabled(true);
      play("ready");
    } else {
      play("droplet");
      setEnabled(false);
    }

    window.localStorage.setItem(soundPreferenceKey, String(enabled));
    window.dispatchEvent(new Event(soundPreferenceEvent));
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
