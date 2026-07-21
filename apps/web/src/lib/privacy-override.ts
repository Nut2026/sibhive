export type EmergencyOverrideRequest = {
  actorHiveId: string
  actorIsHiveParent: boolean
  itemId: string
  itemIsTeenPrivate: boolean
  itemHiveId: string
  reason: string
}

export type EmergencyOverrideDecision =
  | { allowed: false; reason: 'not-hive-parent' | 'item-not-private' | 'cross-hive' | 'missing-reason' }
  | {
      allowed: true
      audit: {
        itemId: string
        reason: string
      }
      revealedItemId: string
    }

export const evaluateEmergencyOverride = (
  request: EmergencyOverrideRequest,
): EmergencyOverrideDecision => {
  if (!request.actorIsHiveParent) {
    return { allowed: false, reason: 'not-hive-parent' }
  }

  if (request.actorHiveId !== request.itemHiveId) {
    return { allowed: false, reason: 'cross-hive' }
  }

  if (!request.itemIsTeenPrivate) {
    return { allowed: false, reason: 'item-not-private' }
  }

  const reason = request.reason.trim()
  if (!reason) {
    return { allowed: false, reason: 'missing-reason' }
  }

  return {
    allowed: true,
    audit: { itemId: request.itemId, reason },
    revealedItemId: request.itemId,
  }
}
