const mapRegionsToVideoDimensions = (regions, metadata) => {
  const {
    videoWidth: vw,
    videoHeight: vh,
    clientWidth: cw,
    clientHeight: ch,
  } = metadata;

  return regions.map((r) => {
    const x = Math.round((r.x / cw) * vw);
    const y = Math.round((r.y / ch) * vh);
    const width = Math.round((r.width / cw) * vw);
    const height = Math.round((r.height / ch) * vh);
    return { x, y, width, height, id: r.id };
  });
};

const createFilterCommand = (regions, blurRadius = 10) => {
  const crops = regions.map((r) => {
    const dimensions = [r.width, r.height, r.x, r.y].join(":");
    return `[0:v]crop=${dimensions},avgblur=${blurRadius}[r${r.id}]`;
  });

  const overlays = regions.map((r, i, array) => {
    const prefix = i == 0 ? "v:0" : `ovr${i - 1}`;
    const point = [r.x, r.y].join(":");
    const suffix = i + 1 < array.length ? `[ovr${i}]` : "";
    return `[${prefix}][r${r.id}]overlay=${point}${suffix}`;
  });

  return [...crops, ...overlays].join(";");
};

export const createFfmpegCommand = ({
  input,
  output,
  regions,
  metadata,
  blurRadius = 10,
}) => {
  const mappedRegions = mapRegionsToVideoDimensions(regions, metadata);
  const filter = createFilterCommand(mappedRegions, blurRadius);
  return `ffmpeg -i ${input} -filter_complex "${filter}" -c:a copy ${output}`;
};
