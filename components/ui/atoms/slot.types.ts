/**
 * 帶有 slotName static property 的 React component。
 * 消費端用這個宣告子元件屬於哪個 slot，父元件的 resolveSlots 讀取 slotName 分類。
 */
export interface SlottableComponent<P = object> extends React.FC<P> {
  slotName: string;
}
