import { config } from "./options";
import { initLocale } from "./src/lib/locales";

export const t = initLocale((config as any)?.language);
