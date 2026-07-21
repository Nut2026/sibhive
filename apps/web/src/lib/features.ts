export const featureFlagDefaults = {
  AI_GENERATION: true,
  DAILY_PROMPTS: true,
  POLLEN_GARDEN: false,
  CHAT: false,
  NOTIFICATIONS: false,
  WEEKLY_EMAIL: false,
  HEALING_CHAMBER: false,
  AUDIO_RECORDING: false,
} as const

export type Feature = keyof typeof featureFlagDefaults
export type FeatureFlags = Record<Feature, boolean>

type FeatureEnvironment = Record<string, string | boolean | undefined>

const isEnabled = (value: string | boolean | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback
  }

  return value === true || value === 'true'
}

export const getFeatureFlags = (
  environment: FeatureEnvironment = import.meta.env,
): FeatureFlags => ({
  AI_GENERATION: isEnabled(
    environment.VITE_FEATURE_AI_GENERATION,
    featureFlagDefaults.AI_GENERATION,
  ),
  DAILY_PROMPTS: isEnabled(
    environment.VITE_FEATURE_DAILY_PROMPTS,
    featureFlagDefaults.DAILY_PROMPTS,
  ),
  POLLEN_GARDEN: isEnabled(
    environment.VITE_FEATURE_POLLEN_GARDEN,
    featureFlagDefaults.POLLEN_GARDEN,
  ),
  CHAT: isEnabled(environment.VITE_FEATURE_CHAT, featureFlagDefaults.CHAT),
  NOTIFICATIONS: isEnabled(
    environment.VITE_FEATURE_NOTIFICATIONS,
    featureFlagDefaults.NOTIFICATIONS,
  ),
  WEEKLY_EMAIL: isEnabled(
    environment.VITE_FEATURE_WEEKLY_EMAIL,
    featureFlagDefaults.WEEKLY_EMAIL,
  ),
  HEALING_CHAMBER: isEnabled(
    environment.VITE_FEATURE_HEALING_CHAMBER,
    featureFlagDefaults.HEALING_CHAMBER,
  ),
  AUDIO_RECORDING: isEnabled(
    environment.VITE_FEATURE_AUDIO_RECORDING,
    featureFlagDefaults.AUDIO_RECORDING,
  ),
})

export const featureFlags = getFeatureFlags()

export const useFeature = (feature: Feature): boolean => featureFlags[feature]
