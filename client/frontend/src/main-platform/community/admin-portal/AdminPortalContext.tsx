import React from 'react';

type Props = {
  children?: React.ReactElement | React.ReactElement[];
};

export const CommunityAdminPortalContextWrapper = (props: Props) => {
  const { children } = props;

  const [selectedTab, setSelectedTab] = React.useState<'members' | 'events'>(
    'members'
  );

  return (
    <CommunityAdminPortalContext.Provider value={{ selectedTab, setSelectedTab }}>
      {children}
    </CommunityAdminPortalContext.Provider>
  );
};

export const CommunityAdminPortalContext = React.createContext({
  selectedTab: 'members',
  setSelectedTab: (newTab: 'members' | 'events') => {},
});
