import { useEffect, useRef } from "preact/hooks";

export const MediaPlayer = ({ src, onResize, onLoadedMetadata }) => {
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
      const { clientWidth, clientHeight, videoWidth, videoHeight} = videoRef.current
      onResize({ width: clientWidth, height: clientHeight });
      onLoadedMetadata({
        duration: videoRef.current.duration,
        playbackRate: videoRef.current.playbackRate,
        clientWidth, 
        clientHeight,
        videoWidth,
        videoHeight
      });
    };

    window.addEventListener("resize", () => {
      const { clientWidth, clientHeight} = videoRef.current
      onResize({ width: clientWidth, height: clientHeight });
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
