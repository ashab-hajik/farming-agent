const treeColors = ['#065f46', '#047857', '#059669', '#0f766e', '#04724d', '#166534', '#14532d', '#1b4332']
const cropColors = ['#f97316', '#f59e0b', '#eab308', '#a3e635', '#4ade80', '#22c55e', '#84cc16', '#d946ef']

function hashLabel(label='') {
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = (hash << 5) - hash + label.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getLabelColor(label, type='crop') {
  const palette = type === 'tree' ? treeColors : cropColors
  if (!label) return type === 'tree' ? '#166534' : '#22c55e'
  const idx = hashLabel(label) % palette.length
  return palette[idx]
}
