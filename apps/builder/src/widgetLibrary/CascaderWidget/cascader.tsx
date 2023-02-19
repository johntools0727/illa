import { FC, useCallback, useEffect, useMemo, useRef } from "react"
import { Cascader } from "@illa-design/react"
import {
  CascaderWidgetProps,
  WrappedCascaderWidgetProps,
} from "@/widgetLibrary/CascaderWidget/interface"
import { Label } from "@/widgetLibrary/PublicSector/Label"
import { TooltipWrapper } from "@/widgetLibrary/PublicSector/TooltipWrapper"
import { applyLabelAndComponentWrapperStyle } from "@/widgetLibrary/PublicSector/TransformWidgetWrapper/style"
import { AutoHeightContainer } from "@/widgetLibrary/PublicSector/autoHeightContainer"

export const WrappedCascaderWidget: FC<WrappedCascaderWidgetProps> = (
  props,
) => {
  const {
    options,
    value,
    expandTrigger,
    placeholder,
    allowClear,
    handleOnChange,
    handleOnFocus,
    handleOnBlur,
    handleUpdateMultiExecutionResult,
    displayName,
    disabled,
    readOnly,
  } = props
  const handleChangeValue = useCallback(
    (value: null | (string | string[])[]) => {
      if (!disabled && !readOnly)
        new Promise((resolve) => {
          handleUpdateMultiExecutionResult([
            {
              displayName,
              value: {
                value,
              },
            },
          ])
          resolve(value)
        }).then(() => {
          handleOnChange?.()
        })
    },
    [
      disabled,
      displayName,
      handleOnChange,
      handleUpdateMultiExecutionResult,
      readOnly,
    ],
  )

  const handleFocus = useCallback(() => {
    if (!disabled) {
      handleOnFocus?.()
    }
  }, [disabled, handleOnFocus])

  const handleBlur = useCallback(() => {
    if (!disabled) {
      handleOnBlur?.()
    }
  }, [disabled, handleOnBlur])

  return (
    <Cascader
      options={options}
      value={value}
      trigger={expandTrigger}
      placeholder={placeholder}
      allowClear={allowClear}
      onChange={handleChangeValue}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled || readOnly}
      showSearch
    />
  )
}

export const CascaderWidget: FC<CascaderWidgetProps> = (props) => {
  const {
    dataSource = [],
    updateComponentHeight,
    tooltipText,
    labelPosition,
    labelFull,
    labelAlign,
    labelWidth,
    labelCaption,
    labelWidthUnit,
    required,
    labelHidden,
    label,
    dataSourceMode,
    dataSourceJS = [],
    value,
    handleUpdateMultiExecutionResult,
    displayName,
    placeholder,
    expandTrigger,
    allowClear,
    disabled,
    readOnly,
    handleUpdateGlobalData,
    handleDeleteGlobalData,
    handleUpdateDsl,
    triggerEventHandler,
  } = props

  const finalOptions = useMemo(() => {
    return dataSourceMode === "dynamic" ? dataSourceJS : dataSource
  }, [dataSource, dataSourceJS, dataSourceMode])

  useEffect(() => {
    handleUpdateGlobalData?.(displayName, {
      showClear: allowClear,
      value,
      placeholder,
      disabled,
      readOnly,
      options: finalOptions,
      setValue: (value: any) => {
        handleUpdateDsl({
          value: Array.isArray(value) ? value : [],
        })
      },
      clearValue: () => {
        handleUpdateDsl({
          value: [],
        })
      },
    })
    return () => {
      handleDeleteGlobalData(displayName)
    }
  }, [
    displayName,
    finalOptions,
    value,
    placeholder,
    disabled,
    readOnly,
    allowClear,
    handleUpdateDsl,
    handleUpdateGlobalData,
    handleDeleteGlobalData,
  ])

  const handleOnChange = useCallback(() => {
    triggerEventHandler("change")
  }, [triggerEventHandler])

  const handleOnFocus = useCallback(() => {
    triggerEventHandler("focus")
  }, [triggerEventHandler])

  const handleOnBlur = useCallback(() => {
    triggerEventHandler("blur")
  }, [triggerEventHandler])

  return (
    <AutoHeightContainer updateComponentHeight={updateComponentHeight}>
      <TooltipWrapper tooltipText={tooltipText} tooltipDisabled={!tooltipText}>
        <div css={applyLabelAndComponentWrapperStyle(labelPosition)}>
          <Label
            labelFull={labelFull}
            label={label}
            labelAlign={labelAlign}
            labelWidth={labelWidth}
            labelCaption={labelCaption}
            labelWidthUnit={labelWidthUnit}
            labelPosition={labelPosition}
            required={required}
            labelHidden={labelHidden}
            hasTooltip={!!tooltipText}
          />
          <WrappedCascaderWidget
            options={finalOptions}
            value={value}
            handleUpdateMultiExecutionResult={handleUpdateMultiExecutionResult}
            displayName={displayName}
            placeholder={placeholder}
            expandTrigger={expandTrigger}
            allowClear={allowClear}
            handleOnChange={handleOnChange}
            handleOnFocus={handleOnFocus}
            handleOnBlur={handleOnBlur}
            disabled={disabled}
            readOnly={readOnly}
          />
        </div>
      </TooltipWrapper>
    </AutoHeightContainer>
  )
}
