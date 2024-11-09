import "./app.css";
import { signal } from "@preact/signals";
import { MarkableMediaPlayer } from "./MarkableMediaPlayer";
import { useState, useEffect } from "preact/hooks";
import { FfmpegWorker } from "./ffmpeg";
import { RegionManager } from "./RegionManager";

const objectUrl = signal(null);
const selectedFile = signal(null);
const videoMetadata = signal(null);

export function App() {
  const [regions, setRegions] = useState([]);
  const [worker, setWorker] = useState(null);
  const [progress, setProgress] = useState(-1);

  useEffect(() => {
    FfmpegWorker.initialize({
      onProgress: (percent) => setProgress(percent),
    }).then((worker) => {
      console.log("worker set", worker);
      setWorker(worker);
    });
  }, []);

  const transcode = async () => {
    if (!worker) return;

    setProgress(0);
    worker
      .transcode({
        file: selectedFile.value,
        regions,
        metadata: videoMetadata.value,
        blurRadius: 10,
      })
      .then((url) => {
        objectUrl.value = url;
        setProgress(-1);
      });
  };

  const handleOnAddRegion = ({ x, y, width, height }) => {
    const nextRegionId = regions.at(-1)?.id + 1 || 0;
    const trueX = width < 0 ? x + width : x;
    const trueY = height < 0 ? y + height : y;
    const trueWidth = Math.abs(width);
    const trueHeight = Math.abs(height);
    const region = {
      id: nextRegionId,
      x: trueX,
      y: trueY,
      width: trueWidth,
      height: trueHeight,
    };
    setRegions((s) => [...s, region]);
    console.log("region added", region);
  };

  const handleOnRemoveRegion = (regionId) => {
    console.log("region removed", regionId);
    setRegions((s) => s.filter((region) => region.id !== regionId));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("file changed", file.name);
      setRegions([]);
      const url = URL.createObjectURL(file);
      console.log(url);
      objectUrl.value = url;
      selectedFile.value = file;
    }
  };

  const handleOnReset = () => {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = null;
    setRegions([]);
  };

  return (
    <div className="column">
      {!objectUrl.value ? (
        <label htmlFor="fileInput">
          Choose a video:
          <input
            type="file"
            id="fileInput"
            accept="video/*"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div>
          {progress >= 0 ? (
            <progress style={{ width: "100%" }} value={progress} />
          ) : (
            <>
              <button onClick={handleOnReset}>reset</button>
              <button onClick={transcode} disabled={!worker || !regions.length}>
                transcode
              </button>
              <RegionManager
                regions={regions}
                onClickRegion={handleOnRemoveRegion}
              />
            </>
          )}
          <MarkableMediaPlayer
            src={objectUrl.value}
            onAddRegion={handleOnAddRegion}
            regions={regions}
            onLoadedMetadata={(md) => (videoMetadata.value = md)}
          />
        </div>
      )}
    </div>
  );
}
