import * as React from "react";

export function useMediaQuery(query: string): boolean {
  const getMatches = (q: string) => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(q).matches;
  };

  const [matches, setMatches] = React.useState<boolean>(getMatches(query));

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = () => setMatches(mediaQueryList.matches);
    listener();

    // Modern browsers
    mediaQueryList.addEventListener?.("change", listener);
    return () => mediaQueryList.removeEventListener?.("change", listener);
  }, [query]);

  return matches;
}
