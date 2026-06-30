"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  CloudRain, 
  Compass, 
  Music, 
  CheckCircle2, 
  Clock 
} from "lucide-react";

type TimerMode = "work" | "shortBreak" | "longBreak";

interface ThemePreset {
  name: string;
  id: string;
  bgClass: string;
  accentColor: string;
  effect: "rain" | "stars" | "neon" | "cozy";
}

const THEMES: ThemePreset[] = [
  {
    name: "Rainy Window",
    id: "rainy",
    bgClass: "bg-gradient-to-br from-[#0c0f1d] via-[#07080f] to-[#121324]",
    accentColor: "#89ceff",
    effect: "rain"
  },
  {
    name: "Cosmic Study",
    id: "cosmic",
    bgClass: "bg-gradient-to-br from-[#0a051b] via-[#03010a] to-[#1a0c2e]",
    accentColor: "#c0c1ff",
    effect: "stars"
  },
  {
    name: "Cyberpunk Alley",
    id: "cyberpunk",
    bgClass: "bg-gradient-to-br from-[#1b0511] via-[#080208] to-[#0c0d1a]",
    accentColor: "#ff91cc",
    effect: "neon"
  },
  {
    name: "Cozy Library",
    id: "cozy",
    bgClass: "bg-gradient-to-br from-[#120a06] via-[#060302] to-[#1e140d]",
    accentColor: "#ffb982",
    effect: "cozy"
  }
];

export default function FocusSessionPage() {
  const { tasks, updateTask } = useTaskStore();
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(THEMES[0]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  
  // Timer States
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);
  
  // Sound States
  const [isMuted] = useState(false);
  const [soundVolumes, setSoundVolumes] = useState({
    rain: 0.3,
    camp: 0.0,
    lofi: 0.0
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Web Audio Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rainNodeRef = useRef<AudioNode | null>(null);
  const campNodeRef = useRef<AudioNode | null>(null);
  const lofiAudioRef = useRef<HTMLAudioElement | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const campGainRef = useRef<GainNode | null>(null);

  const activeTask = tasks.find(t => t.id === selectedTaskId);

  // Initialize Timer duration
  useEffect(() => {
    if (mode === "work") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(customWorkTime * 60);
    } else if (mode === "shortBreak") {
      setTimeLeft(customBreakTime * 60);
    } else {
      setTimeLeft(15 * 60);
    }
    setIsRunning(false);
  }, [mode, customWorkTime, customBreakTime]);

  function playCompletionTone() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1);
    } catch {
      // Audio context might be restricted
    }
  }

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    // Play a gentle buzzer sound using synthesized tone
    playCompletionTone();

    // Log progress if working on a task
    if (mode === "work" && activeTask) {
      const currentProgress = activeTask.progress;
      // Increment progress by 10% or complete it
      const newProgress = Math.min(currentProgress + 20, 100);
      updateTask(activeTask.id, {
        progress: newProgress,
        status: newProgress === 100 ? "Done" : "In Progress"
      });
    }

    // Toggle Modes
    if (mode === "work") {
      setMode("shortBreak");
    } else {
      setMode("work");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activeTask]);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode]);
  function getAudioContext(): AudioContext {
    if (!audioCtxRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }

  // Synthesize Procedural Noise (White Noise -> Bandpassed/filtered for Rain/Campfire)
  const startProceduralNoise = () => {
    try {
      const ctx = getAudioContext();
      
      // Buffer generation for white noise
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      // Rain Synthesizer Node
      const rainSource = ctx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = "lowpass";
      rainFilter.frequency.setValueAtTime(800, ctx.currentTime);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(isMuted ? 0 : soundVolumes.rain, ctx.currentTime);

      rainSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(ctx.destination);
      rainSource.start();

      rainNodeRef.current = rainSource;
      rainGainRef.current = rainGain;

      // Campfire Synthesizer Node
      const campSource = ctx.createBufferSource();
      campSource.buffer = noiseBuffer;
      campSource.loop = true;

      const campFilter = ctx.createBiquadFilter();
      campFilter.type = "bandpass";
      campFilter.frequency.setValueAtTime(300, ctx.currentTime);

      const campGain = ctx.createGain();
      campGain.gain.setValueAtTime(isMuted ? 0 : soundVolumes.camp, ctx.currentTime);

      campSource.connect(campFilter);
      campFilter.connect(campGain);
      campGain.connect(ctx.destination);
      campSource.start();

      campNodeRef.current = campSource;
      campGainRef.current = campGain;

    } catch {
      console.warn("Audio Context init failed");
    }
  };

  // Handle ambient volume adjustments
  useEffect(() => {
    if (rainGainRef.current) {
      rainGainRef.current.gain.setValueAtTime(isMuted ? 0 : soundVolumes.rain, audioCtxRef.current?.currentTime || 0);
    }
    if (campGainRef.current) {
      campGainRef.current.gain.setValueAtTime(isMuted ? 0 : soundVolumes.camp, audioCtxRef.current?.currentTime || 0);
    }
  }, [soundVolumes, isMuted]);

  // Start Ambient player
  const toggleAmbientSounds = () => {
    if (!rainNodeRef.current) {
      startProceduralNoise();
      // Setup Lo-fi audio source
      const lofi = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
      lofi.loop = true;
      lofi.volume = isMuted ? 0 : soundVolumes.lofi;
      lofi.play().catch(() => console.log("Lofi audio requires user gesture"));
      lofiAudioRef.current = lofi;
    } else {
      // Toggle Play/Pause on audio nodes
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === "running") {
          audioCtxRef.current.suspend();
          lofiAudioRef.current?.pause();
        } else {
          audioCtxRef.current.resume();
          lofiAudioRef.current?.play().catch(console.log);
        }
      }
    }
  };

  // Sync lofi audio volume
  useEffect(() => {
    if (lofiAudioRef.current) {
      lofiAudioRef.current.volume = isMuted ? 0 : soundVolumes.lofi;
    }
  }, [soundVolumes.lofi, isMuted]);

  // Format Timer String
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remains = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remains.toString().padStart(2, "0")}`;
  };

  // Radial Progress Ring values
  const totalDuration = mode === "work" ? customWorkTime * 60 : mode === "shortBreak" ? customBreakTime * 60 : 15 * 60;
  const progressRatio = timeLeft / totalDuration;
  const strokeDashoffset = 565 - 565 * progressRatio;

  // Cleanup synthesizer nodes on unmount
  useEffect(() => {
    return () => {
      try {
        rainNodeRef.current?.disconnect();
        campNodeRef.current?.disconnect();
        audioCtxRef.current?.close();
        lofiAudioRef.current?.pause();
      } catch {}
    };
  }, []);

  return (
    <div className={`h-full flex-1 rounded-3xl p-6 transition-all duration-1000 relative overflow-hidden ${selectedTheme.bgClass} flex flex-col justify-between border border-white/5`}>
      
      {/* Background Interactive Effects Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {selectedTheme.effect === "rain" && (
          <div className="absolute inset-0 overflow-hidden opacity-30">
            {/* Simple CSS simulated rain columns */}
            <div className="absolute top-[-10%] w-full h-[120%] bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(137,206,255,0.15))] animate-pulse duration-[3000ms]" />
          </div>
        )}
        {selectedTheme.effect === "stars" && (
          <div className="absolute inset-0 opacity-40">
            {/* Pulsing neon dots */}
            <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-ping duration-1000" />
            <div className="absolute top-1/2 left-2/3 w-1 h-1 bg-white rounded-full animate-ping duration-3000" />
            <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-ping duration-[2000ms]" />
          </div>
        )}
        {selectedTheme.effect === "neon" && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#ff91cc]/20 rounded-full blur-[120px] animate-pulse duration-[4000ms]" />
            <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[140px] animate-pulse duration-[6000ms]" />
          </div>
        )}
        {selectedTheme.effect === "cozy" && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#ffb982]/10 to-transparent blur-xl" />
          </div>
        )}
      </div>

      {/* Header Presets & Custom Configuration */}
      <div className="z-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 animate-pulse" />
            Focus Sanctuary
          </h1>
          <p className="text-xs text-white/60">Tune out distractions and commit to your work.</p>
        </div>

        {/* Wallpaper Picker */}
        <div className="flex gap-2 bg-white/[0.03] border border-white/10 p-1 rounded-xl">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={`px-3 py-1 rounded-lg text-[10px] font-heading font-semibold transition-all ${
                selectedTheme.id === theme.id 
                  ? "bg-white text-black shadow-lg" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Sanctuary Panel */}
      <div className="z-10 my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Timer & Controls */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-6">
          
          {/* Circular Countdown Progress Ring */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="144"
                cy="144"
                r="90"
                className="stroke-white/5 fill-transparent"
                strokeWidth="10"
              />
              <circle
                cx="144"
                cy="144"
                r="90"
                className="fill-transparent transition-all duration-300"
                stroke={selectedTheme.accentColor}
                strokeWidth="10"
                strokeDasharray="565"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">{mode === 'work' ? 'Working Session' : 'Rest Break'}</span>
              <span className="text-5xl font-heading font-extrabold text-white tracking-tighter tabular-nums">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-white/40 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-primary/10 text-primary" />
                <span>Streak Active</span>
              </span>
            </div>
          </div>

          {/* Mode Switchers */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("work")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-heading transition-all ${
                mode === "work" ? "bg-white/10 text-white border border-white/20" : "text-white/60 hover:text-white"
              }`}
            >
              Focus Task
            </button>
            <button
              onClick={() => setMode("shortBreak")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-heading transition-all ${
                mode === "shortBreak" ? "bg-white/10 text-white border border-white/20" : "text-white/60 hover:text-white"
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => setMode("longBreak")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-heading transition-all ${
                mode === "longBreak" ? "bg-white/10 text-white border border-white/20" : "text-white/60 hover:text-white"
              }`}
            >
              Long Break
            </button>
          </div>

          {/* Controls Play, Pause, Reset */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setTimeLeft(totalDuration);
                setIsRunning(false);
              }}
              className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                getAudioContext(); // Resume Web Audio on user gesture
                setIsRunning(!isRunning);
              }}
              className="w-16 h-16 bg-white hover:bg-white/95 text-black rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              {isRunning ? <Pause className="w-7 h-7 fill-black" /> : <Play className="w-7 h-7 fill-black ml-1" />}
            </button>

            <button
              onClick={toggleAmbientSounds}
              className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full transition-all hover:scale-105 active:scale-95 relative group/tooltip"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#131315] border border-white/10 rounded text-[9px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Play Ambient Music
              </span>
            </button>
          </div>

        </div>

        {/* Right Column: Task Selector & Ambient Music Mixer */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Current Commitment Picker */}
          <div className="glass-panel bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Focus Commitment Target
            </h3>
            
            <div className="space-y-3">
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 [color-scheme:dark]"
              >
                <option value="" className="text-black">No Task - Just Zen Out</option>
                {tasks.filter(t => t.status !== "Done").map(task => (
                  <option key={task.id} value={task.id} className="text-black">
                    {task.title} ({task.progress}% complete)
                  </option>
                ))}
              </select>

              {activeTask && (
                <div className="border border-white/5 bg-white/[0.01] p-3 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-white/50 uppercase tracking-widest font-semibold">Active Objective</span>
                    <h4 className="text-xs font-bold text-white">{activeTask.title}</h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-white">{activeTask.progress}%</span>
                    <span className="text-[9px] text-white/40">Pomodoro syncs here</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ambient Sounds Mixer */}
          <div className="glass-panel bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" />
              Ambient Sanctuary Soundboard
            </h3>

            <div className="space-y-4">
              {/* Rain Sound */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/80 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5" />
                    Rain Noise (Synth)
                  </span>
                  <span className="text-white/40 text-[10px]">{Math.round(soundVolumes.rain * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolumes.rain}
                  onChange={(e) => {
                    getAudioContext(); // Resume Web Audio
                    setSoundVolumes(prev => ({ ...prev, rain: parseFloat(e.target.value) }));
                  }}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              {/* Fire Sound */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/80 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    White Noise (Campfire Synth)
                  </span>
                  <span className="text-white/40 text-[10px]">{Math.round(soundVolumes.camp * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolumes.camp}
                  onChange={(e) => {
                    getAudioContext(); // Resume Web Audio
                    setSoundVolumes(prev => ({ ...prev, camp: parseFloat(e.target.value) }));
                  }}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              {/* Lofi Sound */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/80 flex items-center gap-1">
                    <Music className="w-3.5 h-3.5" />
                    Chill Lofi beats (SoundHelix Loop)
                  </span>
                  <span className="text-white/40 text-[10px]">{Math.round(soundVolumes.lofi * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolumes.lofi}
                  onChange={(e) => {
                    getAudioContext();
                    setSoundVolumes(prev => ({ ...prev, lofi: parseFloat(e.target.value) }));
                  }}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>
            </div>
            
            <p className="text-[9px] text-white/40 italic leading-relaxed text-center pt-2">
              Note: Click the speaker icon to start audio. Adjust sliders to mix. All synthesized audio runs 100% locally.
            </p>
          </div>

        </div>

      </div>

      {/* Pomodoro Timer Configuration */}
      <div className="z-10 border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/50">
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <span>Work Time:</span>
            <input
              type="number"
              min="1"
              max="120"
              value={customWorkTime}
              onChange={(e) => setCustomWorkTime(Math.max(1, parseInt(e.target.value) || 25))}
              className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-center text-white text-xs"
            />
            <span>min</span>
          </label>
          <label className="flex items-center gap-2">
            <span>Break Time:</span>
            <input
              type="number"
              min="1"
              max="60"
              value={customBreakTime}
              onChange={(e) => setCustomBreakTime(Math.max(1, parseInt(e.target.value) || 5))}
              className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-center text-white text-xs"
            />
            <span>min</span>
          </label>
        </div>

        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
          <span>Completing focus session will log +20% progress on target task automatically.</span>
        </div>
      </div>

    </div>
  );
}
