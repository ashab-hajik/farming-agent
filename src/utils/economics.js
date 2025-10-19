const cropEconomics = {
  Turmeric: { costPerAcre: 65000, yieldPerAcre: 140000 },
  Banana: { costPerAcre: 90000, yieldPerAcre: 190000 },
  'Pigeon Pea': { costPerAcre: 32000, yieldPerAcre: 52000 },
  Millet: { costPerAcre: 28000, yieldPerAcre: 48000 },
  Okra: { costPerAcre: 36000, yieldPerAcre: 62000 },
  Papaya: { costPerAcre: 75000, yieldPerAcre: 160000 },
  'Sweet Potato': { costPerAcre: 35000, yieldPerAcre: 70000 },
  Sesame: { costPerAcre: 26000, yieldPerAcre: 43000 },
  Pulses: { costPerAcre: 30000, yieldPerAcre: 52000 },
  'Pearl Millet': { costPerAcre: 27000, yieldPerAcre: 45000 },
  'Cluster Bean': { costPerAcre: 26000, yieldPerAcre: 42000 },
  Groundnut: { costPerAcre: 38000, yieldPerAcre: 68000 },
  Wheat: { costPerAcre: 42000, yieldPerAcre: 72000 },
  Mustard: { costPerAcre: 31000, yieldPerAcre: 56000 },
  Chickpea: { costPerAcre: 32000, yieldPerAcre: 58000 },
  Barley: { costPerAcre: 30000, yieldPerAcre: 52000 },
  Potato: { costPerAcre: 60000, yieldPerAcre: 120000 },
  Lentil: { costPerAcre: 33000, yieldPerAcre: 60000 },
  Maize: { costPerAcre: 35000, yieldPerAcre: 64000 },
  Soybean: { costPerAcre: 36000, yieldPerAcre: 65000 },
  Sunflower: { costPerAcre: 37000, yieldPerAcre: 68000 },
  'Green Gram': { costPerAcre: 31000, yieldPerAcre: 56000 },
  Cabbage: { costPerAcre: 45000, yieldPerAcre: 90000 },
  Spinach: { costPerAcre: 28000, yieldPerAcre: 52000 },
  default: { costPerAcre: 34000, yieldPerAcre: 60000 }
}

const treeEconomics = {
  Neem: { costPerAcre: 28000, yieldPerAcre: 65000 },
  Tamarind: { costPerAcre: 32000, yieldPerAcre: 82000 },
  Mango: { costPerAcre: 40000, yieldPerAcre: 110000 },
  Guava: { costPerAcre: 38000, yieldPerAcre: 98000 },
  Jackfruit: { costPerAcre: 42000, yieldPerAcre: 115000 },
  Teak: { costPerAcre: 50000, yieldPerAcre: 140000 },
  Eucalyptus: { costPerAcre: 36000, yieldPerAcre: 90000 },
  Mahogany: { costPerAcre: 52000, yieldPerAcre: 150000 },
  Subabul: { costPerAcre: 30000, yieldPerAcre: 70000 },
  Jamun: { costPerAcre: 34000, yieldPerAcre: 80000 },
  Casuarina: { costPerAcre: 35000, yieldPerAcre: 78000 },
  Acacia: { costPerAcre: 32000, yieldPerAcre: 72000 },
  'Date Palm': { costPerAcre: 48000, yieldPerAcre: 130000 },
  Sisal: { costPerAcre: 25000, yieldPerAcre: 60000 },
  Babool: { costPerAcre: 26000, yieldPerAcre: 62000 },
  Drumstick: { costPerAcre: 30000, yieldPerAcre: 75000 },
  default: { costPerAcre: 32000, yieldPerAcre: 75000 }
}

export function calculateEconomicForLayout(layout = {}, inputs = {}) {
  const grid = layout.grid || []
  if (!grid.length) {
    return { cost: 0, yield: 0, incomeYearly: [0, 0, 0, 0, 0], roi: 0 }
  }
  const rows = grid.length
  const cols = grid[0]?.length || 0
  const totalCells = Math.max(rows * cols, 1)
  const area = Math.max(inputs.area || 1, 0.01)
  const cellArea = area / totalCells
  const investment = inputs.investment || 'medium'
  const investmentFactor = investment === 'high' ? 1.2 : investment === 'low' ? 0.9 : 1

  let cost = 0
  let yieldValue = 0

  grid.forEach(row => {
    row.forEach(cell => {
      const type = cell?.type === 'tree' ? 'tree' : 'crop'
      const label = cell?.label || ''
      const rates = (type === 'tree' ? treeEconomics[label] : cropEconomics[label]) || (type === 'tree' ? treeEconomics.default : cropEconomics.default)
      cost += rates.costPerAcre * cellArea
      yieldValue += rates.yieldPerAcre * cellArea
    })
  })

  cost *= investmentFactor
  const operations = Math.max(area * 4500 * investmentFactor, 2000)
  cost += operations

  const maturityCurve = [0, 0.35, 0.55, 0.75, 1]
  const incomeYearly = maturityCurve.map((factor, idx) => {
    if (idx === 0) return Math.round(-cost)
    const gross = yieldValue * factor
    const upkeep = cost * 0.08 * factor
    return Math.round(gross - upkeep)
  })

  const net = yieldValue - cost
  const roi = cost > 0 ? Math.max(Math.round((net / cost) * 100), -100) : 0

  return {
    cost: Math.round(cost),
    yield: Math.round(yieldValue),
    incomeYearly,
    roi: Math.max(roi, 0)
  }
}

export { cropEconomics, treeEconomics }
