export const DISPATCH_HOVER_PREVIEW = 'interactions:dispatchHoverPreview';
export const CLEAR_HOVER_PREVIEW = 'interactions:clearHover';

export const DISPATCH_SNACKBAR = 'interactions:dispatchSnackbar';
export const CLEAR_SNACKBAR = 'interactions:clearSnackbar';

import { HoverProps } from '../../main-platform/reusable-components';

export function dispatchHoverPreview(anchorElement: HTMLElement, data: HoverProps) {
  return {
    type: DISPATCH_HOVER_PREVIEW,
    payload: {
      anchorEl: anchorElement,
      data,
    },
  };
}

export function clearHoverPreview() {
  return {
    type: CLEAR_HOVER_PREVIEW,
  };
}
