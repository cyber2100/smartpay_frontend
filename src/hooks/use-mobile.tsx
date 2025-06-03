import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Custom hook to determine if the current device is mobile based on screen width.
 * It uses a media query to check if the screen width is less than the defined MOBILE_BREAKPOINT.
 *
 * @returns {boolean} - Returns true if the device is mobile, false otherwise.
 */

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
