import { useEffect, useRef } from "preact/hooks";

export const MediaPlayer = ({ src, onSetVideoDimensions }) => {
  const videoRef = useRef();
  const audioRef = useRef();
  const linked = useRef(false);

  useEffect(() => {
    if (linked.current) {
      return;
    }

    linked.current = true;
    audioRef.current.ontimeupdate = () => {
      videoRef.current.currentTime = audioRef.current.currentTime;
    };

    audioRef.current.onratechange = () => {
      videoRef.current.playbackRate = audioRef.current.playbackRate;
    };

    audioRef.current.onplay = () => {
      videoRef.current.play();
    };

    audioRef.current.onpause = () => {
      videoRef.current.pause();
    };

    videoRef.current.onloadedmetadata = () => {
      const rect = videoRef.current.getBoundingClientRect();
      const { width, height } = rect;
      onSetVideoDimensions({ width, height });
    };

    window.addEventListener("resize", () => {
      const rect = videoRef.current.getBoundingClientRect();
      const { width, height } = rect;
      onSetVideoDimensions({ width, height });
    });
  }, [src]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <video ref={videoRef} src={src} style={{ maxHeight: "80vh" }}></video>
      <audio
        ref={audioRef}
        src={src}
        controls
        controlsList="nodownload"
        style={{ width: "100%" }}
      ></audio>
    </div>
  );
};
