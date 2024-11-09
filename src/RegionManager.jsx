export const RegionManager = ({ regions, onClickRegion }) => (
  <div style={{ width: "100%", height: "64px", display: "flex", gap: "4px" }}>
    {regions.map((region) => (
      <button
        key={region.id}
        onClick={() => onClickRegion(region.id)}
        style={{
          cursor: "pointer",
          userSelect: "none",
          height: "48px",
          width: "48px",
        }}
      >
        {region.id}
      </button>
    ))}
  </div>
);
