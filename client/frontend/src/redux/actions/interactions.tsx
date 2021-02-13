import { sleep } from '../../helpers/functions';
import { HoverProps } from '../../main-platform/reusable-components/components/HoverPreview';
import { SnackbarProps } from '../../main-platform/reusable-components/components/SnackbarNotification';
import { getStore } from '../store/persistedStore';

export const DISPATCH_HOVER_PREVIEW = 'interactions:dispatchHoverPreview';
export const CLEAR_HOVER_PREVIEW = 'interactions:clearHover';
export const MOUSE_HAS_ENTERED_HOVER_PREVIEW =
  'interactions:mouseEnteredHoverPreview';
export const HOVER_PREVIEW_TRIGGER_COMPONENT_EXIT =
  'interactions:hoverPreviewTriggerComponentExit';
export const KEEP_CURRENT_STATE = 'interactions:keepCurrentState';

export const DISPATCH_SNACKBAR = 'interactions:dispatchSnackbar';
export const CLEAR_SNACKBAR = 'interactions:clearSnackbar';

export function dispatchHoverPreview(data: HoverProps) {
  return {
    type: DISPATCH_HOVER_PREVIEW,
    payload: { data },
  };
}

export function clearHoverPreview() {
  return {
    type: CLEAR_HOVER_PREVIEW,
  };
}

export function mouseEnteredHoverPreview() {
  return {
    type: MOUSE_HAS_ENTERED_HOVER_PREVIEW,
  };
}

export function hoverPreviewTriggerComponentExit() {
  return {
    type: HOVER_PREVIEW_TRIGGER_COMPONENT_EXIT,
  };
}

export function dispatchSnackbar(data: SnackbarProps) {
  return {
    type: DISPATCH_SNACKBAR,
    payload: { data },
  };
}

export function clearSnackbar() {
  return {
    type: CLEAR_SNACKBAR,
  };
}
