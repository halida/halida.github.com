import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "http://blog.linjunhalida.com/",
    title: "网络寻租",
    description: "Programmer, Gamer, Hacker",
    author: "机械唯物主义",
    profile: "http://blog.linjunhalida.com/about/",
    ogImage: "default-og.jpg",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 10,
    perIndex: 10,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    // Generating 300+ OG images with Satori makes every build slow.
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
  comments: {
    provider: "giscus",
    giscus: {
      repo: "halida/halida.github.com",
      // The two ids are read from .env (GISCUS_REPO_ID / GISCUS_CATEGORY_ID).
      // Copy them from the script generated on https://giscus.app.
      repoId: "",
      category: "Comments",
      categoryId: "",
      // Match posts by path, so the mapping survives domain or protocol
      // changes.
      mapping: "pathname",
      reactionsEnabled: true,
      emitMetadata: false,
      inputPosition: "bottom",
      // Strict mode only allows comments on discussions that already
      // exist. It stays off until there are discussions to comment on.
      strict: false,
      lang: "zh-CN",
    },
    disqus: {
      // The legacy Disqus threads are not being imported. The provider is
      // kept so the site can be switched back without rewriting anything.
      shortName: "halidasvps",
      showCount: true,
    },
  },
});
