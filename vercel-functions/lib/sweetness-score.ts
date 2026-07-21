export type ScoreInputs = {
  activityCompletion?: number | null
  conflictResolution?: number | null
  nectar?: number | null
  positiveInteractions?: number | null
  promptEngagement?: number | null
}

export type SweetnessScore = { score: number; unavailable: string[]; contributions: Record<string, number> }
const clamp = (value: number) => Math.max(0, Math.min(1, value))

export const calculateSweetnessScore = (input: ScoreInputs): SweetnessScore => {
  const metrics: Array<[keyof ScoreInputs, string, number]> = [
    ['activityCompletion', 'activity_completion', 35], ['promptEngagement', 'prompt_engagement', 25],
    ['positiveInteractions', 'positive_interactions', 20], ['conflictResolution', 'conflict_resolution', 15], ['nectar', 'nectar', 5],
  ]
  const unavailable: string[] = []; const contributions: Record<string, number> = {}; let score = 0
  for (const [key, label, weight] of metrics) {
    const value = input[key]
    if (value === null || value === undefined) { unavailable.push(label); contributions[label] = 0 } else { contributions[label] = clamp(value) * weight; score += contributions[label] }
  }
  return { score: Math.round(Math.max(0, Math.min(100, score)) * 100) / 100, unavailable, contributions }
}
