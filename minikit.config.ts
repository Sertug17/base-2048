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
    header: "eyJmaWQiOjQ5NTQ2NSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDA1OUYwZjNCN0RGN0NiYTY1QzkyMjk0OGE5RDRhMjYzMzkwMUExMjMifQ",
    payload: "eyJkb21haW4iOiJiYXNlLTIwNDgtczNqei52ZXJjZWwuYXBwIn0",
    signature: "dT/9Eu1KvQBjcMgPLrQtUXtPQ0EKBdBLqNXlomysmbs6S6Os1Tm4pV/C3yy1/0LXmgVkNpqMmQvGrqL7k5rKKxs=",
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
