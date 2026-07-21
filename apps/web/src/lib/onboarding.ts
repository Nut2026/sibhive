export type OnboardingChild = { birthDate: string; name: string }
export const generateAllSiblingPairs = (children: OnboardingChild[]) => children.flatMap((_, first) => children.slice(first + 1).map((_, offset) => ({ child1_index: first, child2_index: first + offset + 1, relationship_type: 'biological' })))
