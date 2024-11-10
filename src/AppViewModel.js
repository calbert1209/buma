import { useState, useEffect, useCallback } from "preact/hooks";
import { FfmpegWorker } from "./ffmpeg";

const useFfmpegWorker = ({ onProgress, onLog }) => {
  const [worker, setWorker] = useState(null);
  useEffect(() => {
    FfmpegWorker.initialize({
      onProgress,
      onLog,
    }).then((worker) => {
      console.debug("worker set", worker);
      setWorker(worker);
    });
  }, []);

  return worker;
};

export const ViewState = {
  fileSelect: "file_select",
  regionSelect: "region_select",
  transcoding: "transcoding",
  preview: "preview",
};

export const useAppViewModel = () => {
  const [regions, setRegions] = useState([]);
  const [progress, setProgress] = useState(-1);
  const [objectUrl, setObjectUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [viewState, setViewState] = useState(ViewState.fileSelect);

  const worker = useFfmpegWorker({
    onProgress: (percent) => setProgress(percent),
  });

  const handleOnTranscode = useCallback(async () => {
    if (!worker) return;

    setViewState(ViewState.transcoding);
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
        setViewState(ViewState.preview);
      })
      .catch(console.error);
  }, [worker, selectedFile, regions, videoMetadata]);

  const handleOnAddRegion = useCallback(
    ({ x, y, width, height }) => {
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
      console.debug("region added", region);
    },
    [regions]
  );

  const handleOnRemoveRegion = useCallback((regionId) => {
    console.debug("region removed", regionId);
    setRegions((s) => s.filter((region) => region.id !== regionId));
  }, []);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      console.debug("file changed", file.name);
      setRegions([]);
      const url = URL.createObjectURL(file);
      console.debug(url);
      setObjectUrl(url);
      setSelectedFile(file);
      setViewState(ViewState.regionSelect);
    }
  }, []);

  const handleOnReset = useCallback(() => {
    URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    setRegions([]);
    setViewState(ViewState.fileSelect);
  }, [objectUrl]);

  return {
    worker,
    regions,
    handleOnAddRegion,
    handleOnRemoveRegion,
    progress,
    objectUrl,
    selectedFile,
    videoMetadata,
    handleOnSetVideoMetadata: setVideoMetadata,
    handleFileChange,
    handleOnReset,
    handleOnTranscode,
    viewState,
  };
};
