import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, SkipForward, Play } from 'lucide-react';

export default function IntroVideo({ onComplete }) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);

  const handleFinish = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setNeedsManualPlay(false);
          })
          .catch(() => {
            setNeedsManualPlay(true);
          });
      }
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
      tryPlay();
    }

    return () => {
      video.removeEventListener('canplay', tryPlay);
    };
  }, []);

  const handleManualPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video
      .play()
      .then(() => setNeedsManualPlay(false))
      .catch(() => {});
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-300 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleFinish}
        className="w-full h-full object-contain"
      >
        <source src="/intro-video.mp4" type="video/mp4" />
        <source src="./frontend/dist/intro-video.mp4" type="video/mp4" />
      </video>

      {needsManualPlay && (
        <button
          type="button"
          onClick={handleManualPlay}
          className="fixed inset-0 m-auto w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition"
          aria-label="Play intro video"
        >
          <Play className="w-8 h-8 fill-white ml-1" />
        </button>
      )}

      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-10">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute intro video' : 'Mute intro video'}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={handleFinish}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wide transition"
        >
          <span>Skip Intro</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
