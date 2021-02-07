import { HoverProps } from '../../main-platform/reusable-components/components/HoverPreview';
import { SnackbarProps } from '../../main-platform/reusable-components/components/SnackbarNotification';
import {
  DISPATCH_HOVER_PREVIEW,
  CLEAR_HOVER_PREVIEW,
  DISPATCH_SNACKBAR,
  CLEAR_SNACKBAR,
} from '../actions/interactions';

export function hoverPreviewReducer(
  state = {},
  data: {
    type: typeof DISPATCH_HOVER_PREVIEW | typeof CLEAR_HOVER_PREVIEW;
    payload?: { data: HoverProps };
  }
) {
  const { type, payload } = data;
  switch (type) {
    case DISPATCH_HOVER_PREVIEW:
      return payload?.data;
    case CLEAR_HOVER_PREVIEW:
      return {};
    default:
      return state;
  }
}

export function snackbarNotificationReducer(
  state = {},
  data: {
    type: typeof DISPATCH_SNACKBAR | typeof CLEAR_SNACKBAR;
    payload?: { data: SnackbarProps };
  }
) {
  const { type, payload } = data;

  switch (type) {
    case DISPATCH_SNACKBAR:
      return payload?.data;
    case CLEAR_SNACKBAR:
      return {};
    default:
      return state;
  }
}
