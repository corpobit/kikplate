const TOKEN_KEY = "kp_token"
const AUTH_CHANGED_EVENT = "kp_auth_changed"

function setTokenCookie(token: string) {
  if (typeof document === "undefined") return
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=2592000; SameSite=Lax`
}

function clearTokenCookie() {
  if (typeof document === "undefined") return
  document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
}

export const AuthService = {
  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
    setTokenCookie(token)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
    }
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY)
    clearTokenCookie()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
    }
  },
  isAuthenticated(): boolean {
    return AuthService.getToken() !== null
  },
  subscribe(onChange: () => void): () => void {
    if (typeof window === "undefined") {
      return () => {}
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY) {
        onChange()
      }
    }

    window.addEventListener(AUTH_CHANGED_EVENT, onChange)
    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onChange)
      window.removeEventListener("storage", handleStorage)
    }
  },
}
