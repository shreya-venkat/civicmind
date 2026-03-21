// Source bias ratings based on Ad Fontes Media Bias Chart
// https://adfontesmedia.com/
// Scale: negative = left, positive = right
// Left: < -12 | Center-Left: -12 to -4 | Center: -4 to +4 | Center-Right: +4 to +12 | Right: > +12

export type SourceLean = "left" | "center-left" | "center" | "center-right" | "right" | "unknown";

// Map domain -> lean (based on Ad Fontes Media ratings)
const biasMap: Record<string, SourceLean> = {
  // ── Left (score < -12) ──
  "motherjones.com": "left",
  "dailykos.com": "left",
  "jacobin.com": "left",
  "democracynow.org": "left",
  "commondreams.org": "left",
  "theintercept.com": "left",
  "rawstory.com": "left",
  "truthout.org": "left",
  "alternet.org": "left",
  "politicususa.com": "left",
  "esquire.com": "left",
  "theroot.com": "left",
  "thenation.com": "left",
  "newrepublic.com": "left",
  "prospect.org": "left",

  // ── Center-Left (score -12 to -4) ──
  "msnbc.com": "center-left",
  "huffpost.com": "center-left",
  "huffingtonpost.com": "center-left",
  "vox.com": "center-left",
  "slate.com": "center-left",
  "salon.com": "center-left",
  "nytimes.com": "center-left",
  "washingtonpost.com": "center-left",
  "cnn.com": "center-left",
  "theguardian.com": "center-left",
  "nbcnews.com": "center-left",
  "abcnews.go.com": "center-left",
  "cbsnews.com": "center-left",
  "latimes.com": "center-left",
  "theatlantic.com": "center-left",
  "newyorker.com": "center-left",
  "time.com": "center-left",
  "politico.com": "center-left",
  "pbs.org": "center-left",
  "bbc.com": "center-left",
  "bbc.co.uk": "center-left",
  "usatoday.com": "center-left",
  "sfchronicle.com": "center-left",
  "inquirer.com": "center-left",
  "businessinsider.com": "center-left",
  "thedailybeast.com": "center-left",
  "buzzfeednews.com": "center-left",
  "vice.com": "center-left",

  // ── Center (score -4 to +4) ──
  "apnews.com": "center",
  "reuters.com": "center",
  "npr.org": "center",
  "thehill.com": "center",
  "axios.com": "center",
  "bloomberg.com": "center",
  "c-span.org": "center",
  "realclearpolitics.com": "center",
  "allsides.com": "center",
  "groundnews.com": "center",
  "factcheck.org": "center",
  "politifact.com": "center",
  "snopes.com": "center",
  "propublica.org": "center",
  "fivethirtyeight.com": "center",
  "csmonitor.com": "center",
  "newsy.com": "center",
  "newsweek.com": "center",
  "usnews.com": "center",
  "aljazeera.com": "center",
  "dw.com": "center",
  "france24.com": "center",
  "abc.net.au": "center",
  "cbc.ca": "center",

  // ── Center-Right (score +4 to +12) ──
  "wsj.com": "center-right",
  "economist.com": "center-right",
  "forbes.com": "center-right",
  "reason.com": "center-right",
  "nationalreview.com": "center-right",
  "washingtonexaminer.com": "center-right",
  "nypost.com": "center-right",
  "thedispatch.com": "center-right",
  "foxnews.com": "center-right",
  "theamericanconservative.com": "center-right",
  "freebeacon.com": "center-right",
  "spectator.org": "center-right",
  "weeklystandard.com": "center-right",
  "washingtontimes.com": "center-right",
  "hotair.com": "center-right",

  // ── Right (score > +12) ──
  "dailywire.com": "right",
  "breitbart.com": "right",
  "dailycaller.com": "right",
  "newsmax.com": "right",
  "oann.com": "right",
  "townhall.com": "right",
  "theepochtimes.com": "right",
  "westernjournal.com": "right",
  "thefederalist.com": "right",
  "thegatewaypundit.com": "right",
  "pjmedia.com": "right",
  "dailysignal.com": "right",
  "humanevents.com": "right",
  "infowars.com": "right",
  "justthenews.com": "right",
  "redstate.com": "right",
  "lifenews.com": "right",
  "outkick.com": "right",
};

export function getSourceLean(domain: string): SourceLean {
  // Normalize domain — strip www. and common prefixes
  const d = domain.toLowerCase().replace(/^(www|edition|amp|m|rss|feeds|news)\./g, "");

  // Direct match
  if (biasMap[d]) return biasMap[d];

  // Check if any bias map key is a suffix of the domain (handles subdomains)
  for (const [key, lean] of Object.entries(biasMap)) {
    if (d === key || d.endsWith(`.${key}`)) return lean;
  }

  return "unknown";
}

// Simplify to 3 buckets for the UI
// left + center-left → Left | center → Center | center-right + right → Right
export function simplifyLean(lean: SourceLean): "left" | "center" | "right" {
  if (lean === "left" || lean === "center-left") return "left";
  if (lean === "right" || lean === "center-right") return "right";
  return "center";
}
