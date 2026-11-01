/**
 * "Ink & Signal" Clerk theme: mint primary with dark text on tonal surfaces (no @clerk/ui theme package;
 * uses appearance.variables). Uses the current Clerk variable names; the older colorText /
 * colorInputBackground are ignored by this version. Clerk needs literal colour values here, so these
 * mirror the tokens in src/app/globals.css (--surface-1/2/3, --mint, --text...).
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#3ee6a0",
    colorPrimaryForeground: "#04170f",
    colorBackground: "#15181d",
    colorForeground: "#eceef2",
    colorMutedForeground: "#9aa1ad",
    colorMuted: "#1b1f25",
    colorInput: "#101216",
    colorInputForeground: "#eceef2",
    colorBorder: "rgba(255,255,255,0.09)",
    colorNeutral: "#ffffff",
    colorDanger: "#ff7a6b",
    colorRing: "rgba(62,230,160,0.55)",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full max-w-[400px]",
    card: "!rounded-[16px] !border-0 !bg-[#15181d] !shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(255,255,255,0.07),0_24px_70px_-24px_rgba(0,0,0,0.7)]",
    footer: "!bg-transparent",
    footerActionLink: "!text-[#7b8cff] hover:!text-[#3ee6a0]",
  },
};
