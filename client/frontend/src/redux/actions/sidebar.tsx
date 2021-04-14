import { SidebarComponents } from '../../main-platform/RightSidebar/RightSidebar';

export const UPDATE_SIDEBAR_COMPONENTS = 'sidebar:updateSidebarComponents';
export const RESET_SIDEBAR_COMPONENTS = 'sidebar:resetSidebarComponents';

export function updateSidebarComponents(sidebarComponents: SidebarComponents) {
  return {
    type: UPDATE_SIDEBAR_COMPONENTS,
    payload: {
      sidebarComponents,
    },
  };
}

export function resetSidebarComponents() {
  return {
    type: RESET_SIDEBAR_COMPONENTS,
    payload: { sidebarComponents: { names: [] } },
  };
}
