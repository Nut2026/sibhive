export type ServerFeature = 'POLLEN_GARDEN' | 'CHAT' | 'NOTIFICATIONS' | 'WEEKLY_EMAIL' | 'HEALING_CHAMBER'
export const isFeatureEnabled = (feature: ServerFeature) => process.env[`FEATURE_${feature}`] === 'true'
export const featureDisabled = (feature: ServerFeature) => Response.json({ error: `${feature} is not enabled.` }, { status: 404 })
