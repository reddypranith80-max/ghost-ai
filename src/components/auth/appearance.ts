/**
 * Dark theme with cyan/violet accent (no @clerk/ui theme package needed; uses appearance.variables).
 * Uses the current Clerk variable names; the older colorText / colorInputBackground are ignored by this version.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#22e5ff",
    colorPrimaryForeground: "#06060c",
    colorBackground: "#0b0b14",
    colorForeground: "#f4f4f8",
    colorMutedForeground: "#a1a1b5",
    colorMuted: "#12121f",
    colorInput: "#12121f",
    colorInputForeground: "#f4f4f8",
    colorBorder: "rgba(255,255,255,0.14)",
    colorNeutral: "#ffffff",
    colorDanger: "#ff6b81",
    colorRing: "#22e5ff",
    borderRadius: "0.6rem",
  },
  elements: {
    rootBox: "w-full max-w-[400px]",
    card: "bg-[#0b0b14] border border-white/10 shadow-[0_0_60px_-20px_#a06bff]",
    footerActionLink: "text-[#a06bff] hover:text-[#22e5ff]",
  },
};
