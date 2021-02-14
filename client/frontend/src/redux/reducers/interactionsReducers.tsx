import { HoverProps } from '../../main-platform/reusable-components/components/HoverPreview';
import { SnackbarProps } from '../../main-platform/reusable-components/components/SnackbarNotification';
import {
  DISPATCH_HOVER_PREVIEW,
  CLEAR_HOVER_PREVIEW,
  DISPATCH_SNACKBAR,
  CLEAR_SNACKBAR,
  MOUSE_HAS_ENTERED_HOVER_PREVIEW,
  HOVER_PREVIEW_TRIGGER_COMPONENT_EXIT,
  KEEP_CURRENT_STATE,
} from '../actions/interactions';
import { initializeState } from '../store/stateManagement';

export function hoverPreviewReducer(
  state = initializeState().hoverPreview,
  data: {
    type:
      | typeof DISPATCH_HOVER_PREVIEW
      | typeof CLEAR_HOVER_PREVIEW
      | typeof MOUSE_HAS_ENTERED_HOVER_PREVIEW
      | typeof HOVER_PREVIEW_TRIGGER_COMPONENT_EXIT
      | typeof KEEP_CURRENT_STATE;
    payload?: { data: HoverProps };
  }
): HoverProps & { mouseEntered?: boolean } {
  const { type, payload } = data;
  switch (type) {
    case DISPATCH_HOVER_PREVIEW:
      return payload!.data;
    case MOUSE_HAS_ENTERED_HOVER_PREVIEW:
      return {
        ...state,
        mouseEntered: true,
      };
    case CLEAR_HOVER_PREVIEW:
      return initializeState().hoverPreview;
    case HOVER_PREVIEW_TRIGGER_COMPONENT_EXIT: {
      if (!state.mouseEntered) return initializeState().hoverPreview;
      return state;
    }
    case KEEP_CURRENT_STATE:
    default:
      return state;
  }
}

export function snackbarNotificationReducer(
  state = initializeState().snackbarNotification,
  data: {
    type: typeof DISPATCH_SNACKBAR | typeof CLEAR_SNACKBAR;
    payload?: { data: SnackbarProps };
  }
): SnackbarProps {
  const { type, payload } = data;

  switch (type) {
    case DISPATCH_SNACKBAR:
      return payload!.data;
    case CLEAR_SNACKBAR:
      return initializeState().snackbarNotification;
    default:
      return state;
  }
}
