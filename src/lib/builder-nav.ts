/**
 * Builder shell navigation: routes, section ids, and external help link.
 */
export const BUILDER_SECTION_IDS = {
  generate: "generate",
} as const;

export type BuilderSectionId =
  (typeof BUILDER_SECTION_IDS)[keyof typeof BUILDER_SECTION_IDS];

export const BUILDER_LABELS = {
  brandTitle: "NullRift",
  brandSubtitle: "Builder",
  workspace: "Workspace",
  library: "Library",
  export: "Export",
  settings: "Shortcuts",
  help: "Help",
  home: "Home",
} as const;

/** Landing / marketing */
export const BUILDER_HOME_HREF = "/";

/** Help entry (same as home until docs ship) */
export const BUILDER_HELP_HREF = "/";

export function scrollToBuilderSection(sectionId: BuilderSectionId): void {
  if (typeof document === "undefined") return;
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Made with Bob
