// Edge redirects for the refgenie.org release layout, then serve the SPA.
//
//   ui.refgenie.org/*                      -> https://refgenie.org/*        (301)
//   refgenie.org/{refgenie,refget,         -> https://docs.refgenie.org/*   (301)
//                 decisions,legacy}/*
//   refgenie.org/SKILL.md                  -> https://docs.refgenie.org/SKILL.md
//   everything else                        -> static assets (SPA)
//
// Path and query string are preserved automatically (the URL is reused).

// Docs sections, matched both bare ("/refget") and nested ("/refget/...").
const DOCS_SECTIONS = ["/refgenie", "/refget", "/decisions", "/legacy"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;

    // Old UI host -> apex.
    if (host === "ui.refgenie.org" || host === "www.refgenie.org") {
      url.hostname = "refgenie.org";
      return Response.redirect(url.toString(), 301);
    }

    // Old docs deep-links that used to live at the apex -> docs subdomain.
    if (host === "refgenie.org") {
      const path = url.pathname;
      const isDocs =
        DOCS_SECTIONS.some((s) => path === s || path.startsWith(s + "/")) ||
        path === "/SKILL.md";
      if (isDocs) {
        url.hostname = "docs.refgenie.org";
        return Response.redirect(url.toString(), 301);
      }
    }

    // Everything else: serve the static SPA (including its not_found_handling).
    return env.ASSETS.fetch(request);
  },
};
