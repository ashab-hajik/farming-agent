import { getLabelColor } from '../utils/colors.js'

export function recommend({ area, soil, rainfall, climate, investment }) {
  const treeDb = {
    loam: ['Neem', 'Tamarind', 'Mango', 'Guava', 'Jackfruit', 'Teak'],
    clay: ['Eucalyptus', 'Neem', 'Mahogany', 'Teak', 'Subabul', 'Jamun'],
    sandy: ['Casuarina', 'Acacia', 'Date Palm', 'Sisal', 'Babool', 'Drumstick']
  }
  const cropDb = {
    tropical: ['Turmeric', 'Banana', 'Pigeon Pea', 'Millet', 'Okra', 'Papaya', 'Sweet Potato'],
    arid: ['Millet', 'Sesame', 'Pulses', 'Pearl Millet', 'Cluster Bean', 'Groundnut'],
    temperate: ['Wheat', 'Mustard', 'Chickpea', 'Barley', 'Potato', 'Lentil'],
    moderate: ['Maize', 'Soybean', 'Sunflower', 'Green Gram', 'Cabbage', 'Spinach']
  }
  const patterns = [
    'Intercropping (trees + legumes)',
    'Alley cropping (trees alleys + cereals)',
    'Relay cropping (staggered sowing)',
    'Sequential double/triple cropping'
  ]

  const trees = (treeDb[soil] || treeDb.loam).slice(0, 6)
  const crops = (cropDb[climate] || cropDb.moderate).slice(0, 6)

  const density = investment === 'low' ? 0.6 : investment === 'high' ? 1.0 : 0.8
  const treeSpacingM = soil === 'clay' ? 10 : soil === 'sandy' ? 8 : 9
  const rows = Math.max(6, Math.round(Math.sqrt(area) * 6))
  const cols = rows

  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ type: 'empty', label: '', color: '#e5e7eb' })))
  for (let r = 0; r < rows; r += Math.round(treeSpacingM / 2)) {
    for (let c = 0; c < cols; c += Math.round(treeSpacingM / 2)) {
      if (Math.random() < density) {
        const label = trees[(r + c) % trees.length]
        grid[r][c] = { type: 'tree', label, color: getLabelColor(label, 'tree') }
      }
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === 'empty') {
        const label = crops[(r * 3 + c) % crops.length]
        grid[r][c] = { type: 'crop', label, color: getLabelColor(label, 'crop') }
      }
    }
  }

  const baseCostPerAcre = { low: 15000, medium: 30000, high: 60000 }[investment] || 30000
  const treeCost = trees.length * 500 * area
  const cropCost = crops.length * 800 * area
  const cost = Math.round(baseCostPerAcre * area + treeCost + cropCost)

  const yieldValue = Math.round(12000 * area + (investment === 'high' ? 8000 : investment === 'low' ? 2000 : 5000))
  const incomeYearly = [0, 0, 1, 2, 3].map((y) => Math.max(0, yieldValue * y - cost * (y === 0 ? 1 : 0.1)))
  const roi = Math.round(((incomeYearly[4] - cost) / Math.max(cost, 1)) * 100)

  return {
    recommendations: { trees, crops, patterns },
    layout: { grid, legend: { tree: '#2e7d32', crop: '#43a047' } },
    economic: { cost, yield: yieldValue, incomeYearly, roi }
  }
}
