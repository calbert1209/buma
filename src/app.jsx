import "./app.css";
import { MarkableMediaPlayer } from "./MarkableMediaPlayer";
import { RegionManager } from "./RegionManager";
import { useAppViewModel, ViewState } from "./AppViewModel";
import { MediaPlayer } from "./MediaPlayer";

export function App() {
  const {
    objectUrl,
    handleFileChange,
    progress,
    handleOnReset,
    handleOnTranscode,
    worker,
    regions,
    handleOnAddRegion,
    handleOnRemoveRegion,
    handleOnSetVideoMetadata,
    viewState,
  } = useAppViewModel();

  return (
    <>
      {viewState === ViewState.fileSelect ? (
        <label htmlFor="fileInput">
          Choose a video:
          <input
            type="file"
            id="fileInput"
            accept="video/*"
            onChange={handleFileChange}
          />
        </label>
      ) : null}
      {viewState === ViewState.regionSelect ? (
        <>
          <button onClick={handleOnReset}>reset</button>
          <button
            onClick={handleOnTranscode}
            disabled={!worker || !regions.length}
          >
            transcode
          </button>
          <RegionManager
            regions={regions}
            onClickRegion={handleOnRemoveRegion}
          />
          <MarkableMediaPlayer
            src={objectUrl}
            onAddRegion={handleOnAddRegion}
            regions={regions}
            onLoadedMetadata={handleOnSetVideoMetadata}
          />
        </>
      ) : null}
      {viewState === ViewState.transcoding ? (
        <progress style={{ width: "80vw" }} value={progress} />
      ) : null}
      {viewState === ViewState.preview ? (
        <MediaPlayer
          src={objectUrl}
          onResize={() => null}
          onLoadedMetadata={(md) => console.debug("preview metadata", md)}
        />
      ) : null}
    </>
  );
}
