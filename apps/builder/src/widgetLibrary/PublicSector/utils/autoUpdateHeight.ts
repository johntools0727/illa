import { MutableRefObject, useEffect, useLayoutEffect, useRef } from "react"

export const useAutoUpdateHeight = (
  handleUpdateHeight: (height: number) => void,
  enable: boolean = true,
  dynamicOptions?: {
    dynamicMinHeight?: number
    dynamicMaxHeight?: number
  },
): [MutableRefObject<HTMLDivElement | null>] => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef(
    new ResizeObserver((entries) => {
      if (!isMounted.current || !handleUpdateHeight) return
      const height = entries[0].contentRect.height
      if (
        dynamicOptions &&
        dynamicOptions.dynamicMaxHeight &&
        height >= dynamicOptions.dynamicMaxHeight
      ) {
        handleUpdateHeight(dynamicOptions.dynamicMaxHeight)
        return
      }
      if (
        dynamicOptions &&
        dynamicOptions.dynamicMinHeight &&
        height <= dynamicOptions.dynamicMinHeight
      ) {
        handleUpdateHeight(dynamicOptions.dynamicMinHeight)
        return
      }
      handleUpdateHeight?.(height)
    }),
  )

  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useLayoutEffect(() => {
    const observerRef = new ResizeObserver((entries) => {
      if (!isMounted.current || !handleUpdateHeight) return
      const height = entries[0].contentRect.height
      if (
        dynamicOptions &&
        dynamicOptions.dynamicMaxHeight &&
        height >= dynamicOptions.dynamicMaxHeight
      ) {
        handleUpdateHeight(dynamicOptions.dynamicMaxHeight)
        return
      }
      if (
        dynamicOptions &&
        dynamicOptions.dynamicMinHeight &&
        height <= dynamicOptions.dynamicMinHeight
      ) {
        handleUpdateHeight(dynamicOptions.dynamicMinHeight)
        return
      }
      handleUpdateHeight?.(height)
    })
    if (observerRef && containerRef.current && enable) {
      observerRef.unobserve(containerRef.current)
      observerRef.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current && enable) {
        observerRef.unobserve(containerRef.current)
      }
    }
  }, [dynamicOptions, enable, handleUpdateHeight])
  return [containerRef]
}
