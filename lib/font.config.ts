import {
  Chiron_Sung_HK,
  Noto_Sans_TC,
  Noto_Serif_TC,
  Playfair,
  Rufina,
} from "next/font/google";

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif-tc",
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

const playfair = Playfair({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

const rufina = Rufina({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-rufina",
  display: "swap",
});

const chironSungHK = Chiron_Sung_HK({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-chiron-sung-hk",
  display: "swap",
  adjustFontFallback: false,
});

export { chironSungHK, notoSansTC, notoSerifTC, playfair, rufina };
