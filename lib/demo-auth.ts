export const DEMO_USER = {
  name: "Demo User",
  email: "demo@example.com",
};

export const isDemoMode = () => true;

export async function getUserEmail() {
  return DEMO_USER.email;
}