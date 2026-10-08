// LINE Flex Message 的最小型別集：只收這套卡片用得到的屬性，官方 schema 其餘欄位不收，
// 避免每支卡片各自用 `contents: object` 失去檢查。

export type FlexTextSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type FlexSpacing = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type FlexBubbleSize = "nano" | "micro" | "kilo" | "mega" | "giga";

export interface FlexText {
  type: "text";
  text: string;
  size?: FlexTextSize;
  weight?: "regular" | "bold";
  color?: string;
  align?: "start" | "end" | "center";
  wrap?: boolean;
  maxLines?: number;
  flex?: number;
  margin?: FlexSpacing;
}

export type FlexAction =
  | { type: "postback"; label: string; data: string; displayText?: string }
  | { type: "uri"; label: string; uri: string };

export interface FlexButton {
  type: "button";
  style: "primary" | "secondary" | "link";
  height?: "sm" | "md";
  color?: string;
  action: FlexAction;
  margin?: FlexSpacing;
}

export interface FlexSeparator {
  type: "separator";
  color?: string;
  margin?: FlexSpacing;
}

export interface FlexImage {
  type: "image";
  url: string;
  size?: "full" | FlexTextSize;
  aspectRatio?: string;
  aspectMode?: "cover" | "fit";
  action?: FlexAction;
}

export interface FlexBox {
  type: "box";
  layout: "vertical" | "horizontal" | "baseline";
  contents: FlexComponent[];
  spacing?: FlexSpacing;
  margin?: FlexSpacing;
  flex?: number;
  backgroundColor?: string;
  cornerRadius?: string;
  paddingAll?: string;
  paddingTop?: string;
  paddingBottom?: string;
}

export type FlexComponent = FlexText | FlexButton | FlexSeparator | FlexBox;

export interface FlexBubble {
  type: "bubble";
  size?: FlexBubbleSize;
  hero?: FlexImage;
  header?: FlexBox;
  body: FlexBox;
  footer?: FlexBox;
}

export interface FlexCarousel {
  type: "carousel";
  contents: FlexBubble[];
}

export interface FlexMessage {
  type: "flex";
  altText: string;
  contents: FlexBubble | FlexCarousel;
}
