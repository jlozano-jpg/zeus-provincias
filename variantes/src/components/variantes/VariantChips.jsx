export default function VariantChips({ groupers, vals }) {
  return (
    <span className="st-variant-cell">
      {groupers.map((g) => {
        const val = vals[g.id]
        return (
          <span key={g.id} className="pr-vchip is-on vg-static-chip">
            {val.swatch ? <span className="pr-vchip-sw" style={{ background: val.swatch }} /> : null}
            {val.name}
          </span>
        )
      })}
    </span>
  )
}
