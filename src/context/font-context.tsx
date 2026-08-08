import { createContext, useContext } from 'react';

type FontContextValue = {
  /** True once fonts finished loading or failed (non-blocking). */
  fontsReady: boolean;
  /** Poppins bold when loaded; undefined falls back to system font. */
  poppinsBold: string | undefined;
};

const FontContext = createContext<FontContextValue>({
  fontsReady: false,
  poppinsBold: undefined,
});

export function FontProvider({
  value,
  children,
}: {
  value: FontContextValue;
  children: React.ReactNode;
}) {
  return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
}

export function useAppFonts() {
  return useContext(FontContext);
}
