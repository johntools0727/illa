import { createSlice } from "@reduxjs/toolkit"
import {
  resetExecutionResultReducer,
  setDependenciesReducer,
  setExecutionDebuggerDataReducer,
  setExecutionErrorReducer,
  setExecutionResultReducer,
  startExecutionReducer,
  updateActionExtendInfoReducer,
  updateExecutionByDisplayNameReducer,
  updateExecutionByMultiDisplayNameReducer,
  updateModalDisplayReducer,
} from "@/redux/currentApp/executionTree/executionReducer"
import { executionInitialState } from "@/redux/currentApp/executionTree/executionState"

const executionSlice = createSlice({
  name: "execution",
  initialState: executionInitialState,
  reducers: {
    setDependenciesReducer,
    setExecutionResultReducer,
    setExecutionErrorReducer,
    setExecutionDebuggerDataReducer,
    startExecutionReducer,
    updateExecutionByDisplayNameReducer,
    updateExecutionByMultiDisplayNameReducer,
    updateModalDisplayReducer,
    resetExecutionResultReducer,
    updateActionExtendInfoReducer,
  },
})

export const executionActions = executionSlice.actions
export default executionSlice.reducer
