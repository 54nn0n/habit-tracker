const ONBOARDING_KEY = "onboarding_complete";

export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARDING_KEY) === "1";
}

export function completeOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, "1");
}

export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_KEY);
}
