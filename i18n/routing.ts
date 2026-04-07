import { defineRouting } from "next-intl/routing";

const routing = defineRouting({
  locales: ["zh-TW", "en"],
  defaultLocale: "zh-TW",
  localePrefix: "as-needed",
});

export default routing;
