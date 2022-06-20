import { FC, useRef, useState, useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { css } from "@emotion/react"
import { RightIcon, CloseIcon, WarningCircleIcon } from "@illa-design/icon"
import { useResize } from "@/utils/hooks/useResize"
import { motion } from "framer-motion"
import {
  actionEditorPanelLayoutWrapper,
  applyContainerHeight,
  applyResizerStyle,
} from "@/page/App/components/ActionEditor/style"
import { ActionEditorContext } from "@/page/App/components/ActionEditor/context"
import { ApiResult } from "@/page/App/components/ActionEditor/ActionEditorPanel/ActionResult/ApiResult"
import { DatabaseResult } from "@/page/App/components/ActionEditor/ActionEditorPanel/ActionResult/DatabaseResult"
import { ActionResult as ActionResultType } from "@/page/App/components/ActionEditor/ActionEditorPanel/ActionResult/interface"
import {
  resCloseIconStyle,
  applyResContainerStyle,
  resHeaderStyle,
  resTitleStyle,
  resContentStyle,
  resSuccessStatusIconStyle,
  resFailStatusIconStyle,
} from "./style"
import { ActionResultProps } from "./interface"

const CONTAINER_DEFAULT_HEIGHT = 180

function renderStatusNode(error?: boolean) {
  if (error) {
    return <WarningCircleIcon css={resFailStatusIconStyle} size="10px" />
  }

  return <RightIcon css={resSuccessStatusIconStyle} size="10px" />
}

function renderResult(actionType: string, result?: ActionResultType) {
  switch (actionType) {
    case "restapi":
      return <ApiResult result={result} />
    case "mysql":
      return <DatabaseResult result={result} />
  }
}

export const ActionResult: FC<ActionResultProps> = (props) => {
  const { onClose, result, error, className, actionType } = props
  const { t } = useTranslation()
  const { editorHeight } = useContext(ActionEditorContext)
  const resultContainerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(
    CONTAINER_DEFAULT_HEIGHT,
  )

  const onHeightChange = (height: number) => {
    setContainerHeight(height)
  }

  const resizer = useResize("vertical", resultContainerRef, onHeightChange)
  const title = error
    ? t("editor.action.result.title.error")
    : t("editor.action.result.title.success")

  const resultNode = useMemo(
    () => renderResult(actionType, result),
    [actionType, result],
  )

  return (
    <motion.div
      css={actionEditorPanelLayoutWrapper}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        onMouseDown={resizer.onMouseDown}
        onTouchStart={resizer.onTouchStart}
        onTouchEnd={resizer.onMouseUp}
        css={applyResizerStyle(resizer.resizing, containerHeight)}
      />
      <div
        ref={resultContainerRef}
        css={css(
          applyResContainerStyle(editorHeight - 120),
          applyContainerHeight(containerHeight),
        )}
      >
        <div css={resHeaderStyle}>
          {renderStatusNode(error)}
          <span css={resTitleStyle}>{title}</span>
          <CloseIcon css={resCloseIconStyle} onClick={onClose} />
        </div>
        <div css={resContentStyle}>{resultNode}</div>
      </div>
    </motion.div>
  )
}

ActionResult.displayName = "ActionResult"