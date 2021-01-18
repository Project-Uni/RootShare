import { HoverProps } from '../../main-platform/reusable-components';
import {
  DISPATCH_HOVER_PREVIEW,
  CLEAR_HOVER_PREVIEW,
} from '../actions/interactions';

export function hoverPreviewReducer(
  state = {},
  data: { type: string; payload?: { anchorEl: HTMLElement; data: HoverProps } }
) {
  const { type, payload } = data;
  switch (type) {
    case DISPATCH_HOVER_PREVIEW:
      return payload;
    case CLEAR_HOVER_PREVIEW:
      return {};
    default:
      return state;
  }
}
