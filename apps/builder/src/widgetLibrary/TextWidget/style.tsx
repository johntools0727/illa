import { SerializedStyles, css } from "@emotion/react"
import { VerticalAlign } from "@/widgetLibrary/TextWidget/interface"
import { UNIT_HEIGHT } from "../../page/App/components/DotPanel/renderComponentCanvas"

export function applyAlignStyle(
  verticalAlign?: VerticalAlign,
): SerializedStyles {
  return css`
    width: 100%;
    display: flex;
    align-items: ${verticalAlign};
  `
}

const getRealHeightStyle = (
  dynamicHeight: "auto" | "fixed" | "limited",
  dynamicMinHeight: number = 0,
  dynamicMaxHeight: number = 0,
) => {
  switch (dynamicHeight) {
    case "auto":
      return css`
        height: auto;
      `
    case "limited":
      return css`
        min-height: ${dynamicMinHeight}px;
        height: auto;
        max-height: ${dynamicMaxHeight}px;
      `
    case "fixed":
      return `100%`
    default:
      return ""
  }
}

export const applyAutoHeightContainerStyle = (
  dynamicHeight: "auto" | "fixed" | "limited",
  dynamicMinHeight?: number,
  dynamicMAxHeight?: number,
) => {
  return css`
    display: flex;
    width: 100%;
    ${getRealHeightStyle(dynamicHeight, dynamicMinHeight, dynamicMAxHeight)};
  `
}

export function applyMarkdownStyle(horizontalAlign?: string): SerializedStyles {
  return css`
    width: 100%;
    text-align: ${horizontalAlign};
    overflow-wrap: break-word;
  `
}
