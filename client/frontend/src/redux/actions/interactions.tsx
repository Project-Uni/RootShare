import { HoverProps } from '../../main-platform/reusable-components/components/HoverPreview';
import { SnackbarProps } from '../../main-platform/reusable-components/components/SnackbarNotification';

export const DISPATCH_HOVER_PREVIEW = 'interactions:dispatchHoverPreview';
export const CLEAR_HOVER_PREVIEW = 'interactions:clearHover';

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
