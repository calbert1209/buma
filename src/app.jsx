import "./app.css";
import { MarkableMediaPlayer } from "./MarkableMediaPlayer";
import { useState, useEffect, useCallback } from "preact/hooks";
import { FfmpegWorker } from "./ffmpeg";
import { RegionManager } from "./RegionManager";

export function App() {
  const [regions, setRegions] = useState([]);
  const [worker, setWorker] = useState(null);
  const [progress, setProgress] = useState(-1);
  const [objectUrl, setObjectUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoMetadata, setVideoMetadata] = useState(null);

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
        file: selectedFile,
        regions,
        metadata: videoMetadata,
        blurRadius: 10,
      })
      .then((url) => {
        setObjectUrl(url);
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
      console.debug("file changed", file.name);
      setRegions([]);
      const url = URL.createObjectURL(file);
      console.debug(url);
      setObjectUrl(url);
      setSelectedFile(file);
    }
  };

  const handleOnReset = () => {
    URL.revokeObjectURL(objectUrl.value);
    setObjectUrl(null);
    setRegions([]);
  };

  return (
    <div className="column">
      {!objectUrl ? (
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
            src={objectUrl}
            onAddRegion={handleOnAddRegion}
            regions={regions}
            onLoadedMetadata={setVideoMetadata}
          />
        </div>
      )}
    </div>
  );
}
