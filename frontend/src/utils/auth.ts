export function getFarmerIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const [, payload] = token.split(".");
  const decoded = JSON.parse(atob(payload));
  return decoded.sub; // this is your farmerId
}
