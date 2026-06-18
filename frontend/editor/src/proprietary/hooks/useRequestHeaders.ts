export function useRequestHeaders(): HeadersInit {
  const token = localStorage.getItem("totalpdf_jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
