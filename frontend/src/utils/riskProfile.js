export function calculateRiskProfile(profile) {
  if (!profile) return "Unknown";

  const { age, smoker, dependents, pre_existing_conditions } = profile;

  if (pre_existing_conditions || age > 50) {
    return "High Risk";
  }

  if (age >= 35 || smoker || dependents >= 2) {
    return "Medium Risk";
  }

  return "Low Risk";
}
