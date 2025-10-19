import { create } from 'zustand'

const useStore = create((set) => ({
  inputs: {
    area: 1,
    soil: 'loam',
    rainfall: 'moderate',
    climate: 'tropical',
    investment: 'medium'
  },
  recommendations: { trees: [], crops: [], patterns: [] },
  layout: { grid: [], legend: {} },
  economic: { cost: 0, yield: 0, incomeYearly: [], roi: 0 },
  setInputs: (inputs) => set({ inputs }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setLayout: (layout) => set({ layout }),
  setEconomic: (economic) => set({ economic }),
}))

export default useStore
