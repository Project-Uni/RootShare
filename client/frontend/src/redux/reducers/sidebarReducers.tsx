import { SidebarComponents } from '../../main-platform/RightSidebar/RightSidebar';

import {
  UPDATE_SIDEBAR_COMPONENTS,
  RESET_SIDEBAR_COMPONENTS,
} from '../actions/sidebar';

export function sidebarComponentsReducer(
  state: SidebarComponents = { names: [] },
  data: {
    type: string;
    payload: {
      sidebarComponents: SidebarComponents;
    };
  }
): SidebarComponents {
  const { type, payload } = data;

  switch (type) {
    case UPDATE_SIDEBAR_COMPONENTS:
      return payload.sidebarComponents;
    case RESET_SIDEBAR_COMPONENTS:
      return payload.sidebarComponents;
    default:
      return state;
  }
}
