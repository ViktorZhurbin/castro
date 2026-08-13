import { ClientScript } from "../ClientScript";
import { DARK, LIGHT, STORAGE_KEY } from "./constants";
import { themeInit } from "./themeInit";

/** Runs before first paint to prevent theme flash. See themeInit.ts. */
export function ThemeScript() {
  return <ClientScript fn={themeInit} args={[STORAGE_KEY, DARK, LIGHT]} />;
}
