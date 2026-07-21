export type AgeGroup = 'child' | 'teen' | null

export const getAgeGroup = (age: number): AgeGroup => {
  if (!Number.isInteger(age)) {
    return null
  }

  if (age >= 8 && age <= 12) {
    return 'child'
  }

  if (age >= 13 && age <= 16) {
    return 'teen'
  }

  return null
}
