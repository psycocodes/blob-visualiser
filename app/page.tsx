"use client";
import { Canvas } from "@react-three/fiber";
import Blob from "./components/Blob";
import { useEffect } from "react";
import { useRef, useState } from "react";

var THEME_INDEX = 1; // Change the theme index to switch between gradients

function useMicrophoneAccess() {
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).catch((err) => {
      console.error("Microphone access denied:", err);
    });
  }, []);
}

export default function Home() {
  useMicrophoneAccess();
  const factor = 0.8;
  function useAudioAnalyser() {
    const [volume, setVolume] = useState(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
      let audioContext: AudioContext | null = null;
      let source: MediaStreamAudioSourceNode | null = null;
      let analyser: AnalyserNode | null = null;
      let dataArray: Uint8Array;

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const process = () => {
          if (!analyser) return;
          analyser.getByteTimeDomainData(dataArray);

          // Volume (RMS)
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const val = (dataArray[i] - 128) / 128;
            sum += val * val;
          }
          const rms = Math.sqrt(sum / dataArray.length);
          setVolume(rms);

          rafRef.current = requestAnimationFrame(process);
        };
        process();
      });

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (audioContext) audioContext.close();
      };
    }, []);

    return { volume };
  }
  const gradients = [
    { name: "Default", colors: ["#e2ffac", "#db8395"] },
    { name: "Ocean", colors: ["#00c6ff", "#0072ff"] },
    { name: "Sunset", colors: ["#ff7e5f", "#feb47b"] },
    { name: "Forest", colors: ["#56ab2f", "#a8e063"] },
  ];
  const [gradient, setGradient] = useState(gradients[THEME_INDEX]);

  const audioData = useAudioAnalyser();
  return (
    <div className="container bg-black h-screen">
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "white",
          zIndex: 10,
        }}
      >
        <div>Volume: {audioData.volume.toFixed(3)}</div>

      </div>
      <Canvas camera={{ position: [0, 0, 8] }}>
        <Blob
          intensity={Math.min(1, audioData.volume * factor)}
          gradient={gradient.colors}
        />
      </Canvas>
    </div>
  );
}
