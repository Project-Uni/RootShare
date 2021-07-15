import React from 'react';

type Props = {
  children?: React.ReactElement | React.ReactElement[];
};

export const AdminPortalWrapper = (props: Props) => {
  const { children } = props;

  const [selectedTab, updateTab] = React.useState<'members' | 'events'>('members');

  return (
    <AdminPortalContext.Provider value={{ selectedTab, updateTab }}>
      {children}
    </AdminPortalContext.Provider>
  );
};

export const AdminPortalContext = React.createContext({
  selectedTab: 'members',
  updateTab: (newTab: 'members' | 'events') => {},
});
