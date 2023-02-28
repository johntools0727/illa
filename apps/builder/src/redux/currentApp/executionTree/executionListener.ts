import { AnyAction, Unsubscribe, isAnyOf } from "@reduxjs/toolkit"
import { diff } from "deep-diff"
import { actionDisplayNameMapFetchResult } from "@/page/App/components/Actions/ActionPanel/utils/runAction"
import { actionActions } from "@/redux/currentApp/action/actionSlice"
import {
  getCanvas,
  searchDsl,
} from "@/redux/currentApp/editor/components/componentsSelector"
import { componentsActions } from "@/redux/currentApp/editor/components/componentsSlice"
import {
  getExecutionResult,
  getRawTree,
  getWithIgnoreExecutionResult,
} from "@/redux/currentApp/executionTree/executionSelector"
import { executionActions } from "@/redux/currentApp/executionTree/executionSlice"
import { AppListenerEffectAPI, AppStartListening } from "@/store"
import { ExecutionTreeFactory } from "@/utils/executionTreeHelper/executionTreeFactory"
import { RawTreeShape } from "@/utils/executionTreeHelper/interface"

export let executionTree: ExecutionTreeFactory | undefined

const mergeActionResult = (rawTree: RawTreeShape) => {
  Object.keys(actionDisplayNameMapFetchResult).forEach((key) => {
    if (!rawTree[key]) return
    rawTree[key].data = actionDisplayNameMapFetchResult[key] || {}
  })
}

export const destroyExecutionTree = () => {
  if (executionTree) {
    executionTree = executionTree.destroyTree()
  }
}

const asyncExecutionDataToRedux = (
  executionResult: Record<string, any>,
  oldExecutionTree: Record<string, any>,
  listenerApi: AppListenerEffectAPI,
) => {
  const errorTree = executionResult.errorTree
  const evaluatedTree = executionResult.evaluatedTree
  const dependencyMap = executionResult.dependencyTree
  const debuggerData = executionResult.debuggerData
  const updates = diff(oldExecutionTree, evaluatedTree) || []
  listenerApi.dispatch(
    executionActions.setExecutionResultReducer({
      updates,
    }),
  )
  listenerApi.dispatch(
    executionActions.setDependenciesReducer({
      ...dependencyMap,
    }),
  )
  listenerApi.dispatch(
    executionActions.setExecutionErrorReducer({
      ...errorTree,
    }),
  )
  listenerApi.dispatch(
    executionActions.setExecutionDebuggerDataReducer({
      ...debuggerData,
    }),
  )
}

async function handleStartExecution(
  action: AnyAction,
  listenerApi: AppListenerEffectAPI,
) {
  const rootState = listenerApi.getState()
  const rawTree = getRawTree(rootState)
  if (!rawTree) return
  mergeActionResult(rawTree)
  const oldExecutionTree = getExecutionResult(rootState)
  if (!executionTree) {
    executionTree = new ExecutionTreeFactory()
    const executionResult = executionTree.initTree(rawTree)
    asyncExecutionDataToRedux(executionResult, oldExecutionTree, listenerApi)
  } else {
    // only transformer can run this;
    const isDeleteAction =
      action.type === "components/deleteComponentNodeReducer" ||
      action.type === "action/removeActionItemReducer"
    const isUpdateActionReduxAction =
      action.type === "action/updateActionItemReducer"
    const executionResult = executionTree.updateTree(
      rawTree,
      isDeleteAction,
      isUpdateActionReduxAction,
    )
    asyncExecutionDataToRedux(executionResult, oldExecutionTree, listenerApi)
  }
}

async function handleStartExecutionOnCanvas(
  action: AnyAction,
  listenerApi: AppListenerEffectAPI,
) {
  const rootState = listenerApi.getState()
  const oldExecutionTree = getWithIgnoreExecutionResult(rootState)
  if (executionTree) {
    const executionResult =
      executionTree.updateTreeFromExecution(oldExecutionTree)
    const evaluatedTree = executionResult.evaluatedTree
    const errorTree = executionResult.errorTree
    const debuggerData = executionResult.debuggerData
    const updates = diff(oldExecutionTree, evaluatedTree) || []
    listenerApi.dispatch(
      executionActions.setExecutionResultReducer({
        updates,
      }),
    )
    listenerApi.dispatch(
      executionActions.setExecutionErrorReducer({
        ...errorTree,
      }),
    )
    listenerApi.dispatch(
      executionActions.setExecutionDebuggerDataReducer({
        ...debuggerData,
      }),
    )
  }
}

function handleUpdateModalEffect(
  action: ReturnType<typeof componentsActions.addModalComponentReducer>,
  listenerApi: AppListenerEffectAPI,
) {
  const { payload } = action
  const { modalComponentNode } = payload
  const parentNodeDisplayName = modalComponentNode.parentNode
  if (!parentNodeDisplayName) return
  const rootState = listenerApi.getState()
  const rootNode = getCanvas(rootState)
  if (!rootNode) return
  const parentNode = searchDsl(rootNode, parentNodeDisplayName)
  if (!parentNode || !Array.isArray(parentNode.childrenNode)) return
  const otherNode = parentNode.childrenNode.filter((node) => {
    return node.displayName !== modalComponentNode.displayName
  })
  const updateSlice = [
    {
      displayName: modalComponentNode.displayName,
      value: {
        isVisible: true,
      },
    },
  ]
  otherNode.forEach((node) => {
    updateSlice.push({
      displayName: node.displayName,
      value: {
        isVisible: false,
      },
    })
  })
  listenerApi.dispatch(
    executionActions.updateExecutionByMultiDisplayNameReducer(updateSlice),
  )
}

export function setupExecutionListeners(
  startListening: AppStartListening,
): Unsubscribe {
  const subscriptions = [
    startListening({
      matcher: isAnyOf(
        componentsActions.addComponentReducer,
        componentsActions.copyComponentReducer,
        componentsActions.updateComponentPropsReducer,
        componentsActions.deleteComponentNodeReducer,
        componentsActions.updateComponentDisplayNameReducer,
        componentsActions.resetComponentPropsReducer,
        componentsActions.updateMultiComponentPropsReducer,
        componentsActions.addTargetPageSectionReducer,
        componentsActions.updateTargetPagePropsReducer,
        componentsActions.deleteTargetPageSectionReducer,
        componentsActions.addPageNodeWithSortOrderReducer,
        componentsActions.updateRootNodePropsReducer,
        componentsActions.updateTargetPageLayoutReducer,
        componentsActions.deletePageNodeReducer,
        componentsActions.addSectionViewReducer,
        componentsActions.deleteSectionViewReducer,
        componentsActions.updateSectionViewPropsReducer,
        componentsActions.addModalComponentReducer,
        actionActions.addActionItemReducer,
        actionActions.removeActionItemReducer,
        actionActions.updateActionItemReducer,
        executionActions.startExecutionReducer,
      ),
      effect: handleStartExecution,
    }),
    startListening({
      matcher: isAnyOf(
        executionActions.updateExecutionByDisplayNameReducer,
        executionActions.updateExecutionByMultiDisplayNameReducer,
        executionActions.updateModalDisplayReducer,
      ),
      effect: handleStartExecutionOnCanvas,
    }),
    startListening({
      actionCreator: componentsActions.addModalComponentReducer,
      effect: handleUpdateModalEffect,
    }),
  ]

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
  }
}
