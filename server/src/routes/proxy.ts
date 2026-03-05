import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).json({ error: "url query parameter is required" });
    return;
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      res.status(400).json({ error: "Only http/https URLs are allowed" });
      return;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "text/html";
    const html = await response.text();

    const proxyBase = "/api/proxy?url=";
    const origin = parsed.origin;

    const navigationScript = `
      <base href="${origin}/" target="_self">
      <script>
        (function() {
          var proxyBase = "${proxyBase}";
          var origin = "${origin}";

          function toProxy(href) {
            if (!href) return href;
            if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('data:')) return href;
            var abs = href;
            if (href.startsWith('/')) abs = origin + href;
            else if (!href.startsWith('http')) abs = origin + '/' + href;
            return proxyBase + encodeURIComponent(abs);
          }

          document.addEventListener('click', function(e) {
            var link = e.target.closest('a');
            if (!link) return;
            var href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
            e.preventDefault();
            window.location.href = toProxy(href);
          }, true);

          document.addEventListener('submit', function(e) {
            var form = e.target;
            if (form.tagName !== 'FORM') return;
            var action = form.getAttribute('action') || window.location.href;
            e.preventDefault();
            window.location.href = toProxy(action);
          }, true);
        })();
      </script>`;

    const injected = html.replace(/<head([^>]*)>/i, `<head$1>${navigationScript}`);

    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.setHeader("Content-Type", contentType);
    res.send(injected);
  } catch (err: any) {
    res.status(502).json({ error: `Failed to fetch: ${err.message}` });
  }
});

export default router;
