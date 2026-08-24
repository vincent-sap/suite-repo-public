const COOKIE_PATH = '/'
const SAME_SITE   = 'Lax'

export function getCookie(name: string): string | null {
  const prefix = encodeURIComponent(name) + '='
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trimStart()
    if (trimmed.startsWith(prefix))
      return decodeURIComponent(trimmed.slice(prefix.length))
  }
  return null
}

export function setCookie(name: string, value: string, days?: number): void {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
  cookie += `; path=${COOKIE_PATH}; SameSite=${SAME_SITE}`
  if (days !== undefined) {
    const expires = new Date()
    expires.setDate(expires.getDate() + days)
    cookie += `; expires=${expires.toUTCString()}`
  }
  document.cookie = cookie
}

export function deleteCookie(name: string): void {
  // Setting expires to the past (Unix epoch) tells the browser to remove the cookie immediately.
  document.cookie =
    `${encodeURIComponent(name)}=; path=${COOKIE_PATH}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=${SAME_SITE}`
}
