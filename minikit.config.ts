const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "https://base-2048-s3jz.vercel.app";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  baseBuilder: {
    ownerAddress: "0xE8D0A25E5Bf18870Ad5B0D2164144982BE2441Da",
  },
  miniapp: {
    version: "1",
    name: "Base 2048",
    subtitle: "Onchain 2048",
    description: "Combine BASE → ETH → USDC and submit your high score onchain to Base Mainnet.",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0052FF",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["game", "2048", "onchain", "base", "puzzle"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Combine, conquer, go onchain",
    ogTitle: "Base 2048",
    ogDescription: "Onchain 2048 game on Base. Combine crypto symbols and submit your score.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
