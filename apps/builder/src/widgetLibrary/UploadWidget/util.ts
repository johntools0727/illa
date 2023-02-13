import { read, utils } from "xlsx"
import { UploadItem } from "@illa-design/react"

export const getFileString = (file: UploadItem) =>
  new Promise((resolve, reject) => {
    const parsedFileType = ["txt", "json", "xls", "xlsx", "csv", "tsv"]
    const reader = new FileReader()

    if (file.originFile) {
      const type = (
        (file.originFile.name || "").split(".")[1] || ""
      ).toLowerCase()
      if (!parsedFileType.includes(type)) {
        resolve(undefined)
      }
      if (["txt"].includes(type)) {
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.readAsText(file.originFile)
      }
      if (["json"].includes(type)) {
        reader.onload = () => {
          const result = reader.result
          if (typeof result === "string") {
            resolve(JSON.parse(result))
          }
        }
        reader.readAsText(file.originFile)
      }
      if (["xls", "xlsx", "csv", "tsv"].includes(type)) {
        reader.readAsArrayBuffer(file.originFile)
        reader.onload = () => {
          const result = reader.result
          const wb = read(result)
          const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
          resolve(data)
        }
      }
      reader.onerror = (error) => reject(error)
    } else {
      resolve(undefined)
    }
  })

export const toBase64 = (file: UploadItem) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    if (file.originFile) {
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file.originFile)
    } else {
      resolve("")
    }
  })

type ValueType = Array<{ status: string; value: any }>

export const getFilteredValue = (values?: ValueType, type?: string) => {
  if (!values) {
    return
  }
  const filteredValue = values.filter(
    (data) => data.value !== undefined && data.status === "fulfilled",
  )
  if (filteredValue && filteredValue.length > 0) {
    const isBase64 = type === "base64"
    return filteredValue.map((data) =>
      isBase64 ? data.value.split(",")[1] : data.value,
    )
  }
  return []
}