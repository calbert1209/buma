
const createFilterCommand = (regions, blurRadius = 10) => {
  const crops = regions.map(r => {
    const dimensions = [r.width, r.height, r.x, r.y].join(":");
    return `[0:v]crop=${dimensions},avgblur=${blurRadius}[r${r.id}]`;
  });
  
  const overlays = regions.map((r, i, array) => {
    const prefix = i == 0 ? "v:0" : `ovr${i-1}`;
    const point = [r.x, r.y].join(":");
    const suffix = i + 1 < array.length ? `[ovr${i}]` : ""
    return `[${prefix}][r${r.id}]overlay=${point}${suffix}`
  })

  return [...crops, ...overlays].join(";")
}

export const createFfmpegCommand = (input, output, regions, blurRadius = 10) => {
  const filter = createFilterCommand(regions, blurRadius);
  return `ffmpeg -i ${input} -filter_complex "${filter}" -c:a copy ${output}`;
}