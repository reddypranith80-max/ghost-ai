/** Dark theme with cyan/violet accent (no @clerk/ui theme package needed; uses appearance.variables). */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#22e5ff",
    colorBackground: "#0b0b14",
    colorInputBackground: "#12121f",
    colorText: "#f4f4f8",
    colorTextSecondary: "#a1a1b5",
    colorTextOnPrimaryBackground: "#06060c",
    colorNeutral: "#ffffff",
    colorDanger: "#ff6b81",
    borderRadius: "0.6rem",
  },
  elements: {
    rootBox: "w-full max-w-[400px]",
    card: "bg-[#0b0b14] border border-white/10 shadow-[0_0_60px_-20px_#a06bff]",
    footerActionLink: "text-[#a06bff] hover:text-[#22e5ff]",
  },
};
