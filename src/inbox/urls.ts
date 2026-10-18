// Links in R&R's mail are rewritten by the spam filter (Proofpoint URL
// Defense). These helpers recover the real address and hide access tokens
// when a link is written to a log or shown on screen.

/** Recover the original URL from a Proofpoint URL Defense link. */
export function unwrapUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "urldefense.proofpoint.com" && u.pathname.startsWith("/v2/url")) {
      const wrapped = u.searchParams.get("u");
      if (!wrapped) return url;
      // v2 encoding: "_" stands for "/", "-XX" is a hex-escaped character.
      return wrapped
        .replace(/_/g, "/")
        .replace(/-([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    }
    if (u.hostname === "urldefense.com" && u.pathname.startsWith("/v3/__")) {
      const inner = url.slice(url.indexOf("/v3/__") + 6);
      const end = inner.indexOf("__;");
      return end >= 0 ? inner.slice(0, end) : inner;
    }
  } catch {
    // Not a URL we can parse. Return it as given.
  }
  return url;
}

/** For logs and screens: keep where a link goes, drop its query string. */
export function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.search ? `${u.origin}${u.pathname}?[hidden]` : `${u.origin}${u.pathname}`;
  } catch {
    return "[link]";
  }
}

/** Hide access codes that GCs paste into invite text. */
export function maskSecrets(text: string): string {
  return text.replace(
    /\b(security key|access code|access key|password|passcode|pin)(\s*[:#]\s*)(\S+)/gi,
    (_, label, sep) => `${label}${sep}[hidden]`,
  );
}
