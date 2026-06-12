import type { FrameworkConfig } from "@vktrz/castro";

// Legacy: returns the shape Castro's removed plugin API consumed.
export function castroJsx(): { name: string; frameworkConfig: FrameworkConfig };
