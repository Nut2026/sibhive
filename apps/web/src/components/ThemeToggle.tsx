import { useEffect, useState } from 'react'

export const ThemeToggle = () => {
  const [dark, setDark] = useState(() => localStorage.getItem('sibhive-theme') === 'dark')
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('sibhive-theme', dark ? 'dark' : 'light') }, [dark])
  return <button aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} className="theme-toggle" onClick={() => setDark((value) => !value)} type="button">{dark ? '☀ Light' : '◐ Dark'}</button>
}
