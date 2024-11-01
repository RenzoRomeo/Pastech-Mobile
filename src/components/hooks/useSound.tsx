import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { useEffect, useRef, useState } from "react";

export default function useSound() {
  const audioRef = useRef<Sound | null>(null);

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("../../../assets/sound.mp3"),
    );
    audioRef.current = sound;
    await sound.playAsync();
  }

  useEffect(() => {
    return () => {
      if (audioRef.current !== null) {
        audioRef.current.unloadAsync();
      }
    };
  }, []);

  return { playSound };
}
