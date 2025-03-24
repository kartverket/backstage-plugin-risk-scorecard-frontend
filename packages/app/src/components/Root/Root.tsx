import React, { PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import ExtensionIcon from '@material-ui/icons/Extension';
import SpeedIcon from '@material-ui/icons/Speed';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Sidebar,
  sidebarConfig,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  SidebarScrollWrapper,
  SidebarSpace,
  useSidebarOpenState,
  Link,
  WarningIcon,
} from '@backstage/core-components';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import LayersIcon from '@material-ui/icons/Layers';
import CategoryIcon from '@material-ui/icons/Category';
import { MyGroupsSidebarItem } from '@backstage/plugin-org';
import GroupIcon from '@material-ui/icons/People';
import { URLS } from '../../urls';

const useSidebarLogoStyles = makeStyles({
  root: {
    width: sidebarConfig.drawerWidthClosed,
    height: 3 * sidebarConfig.logoHeight,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: -14,
  },
  link: {
    width: sidebarConfig.drawerWidthClosed,
    marginLeft: 24,
  },
});

const SidebarLogo = () => {
  const classes = useSidebarLogoStyles();
  const { isOpen } = useSidebarOpenState();

  return (
    <div className={classes.root}>
      <Link
        to={URLS.frontend.index}
        underline="none"
        className={classes.link}
        aria-label="Home"
      >
        {isOpen ? <LogoFull type="light" /> : <LogoIcon />}
      </Link>
    </div>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
        <SidebarSearchModal />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Menu" icon={<MenuIcon />}>
        {/* Global nav, not org-specific */}
        <SidebarItem icon={HomeIcon} to={URLS.frontend.index} text="Home" />
        <SidebarItem
          icon={CategoryIcon}
          to={URLS.frontend.catalog}
          text="Catalog"
        />
        <MyGroupsSidebarItem
          singularTitle="My Group"
          pluralTitle="My Groups"
          icon={GroupIcon}
        />
        <SidebarItem
          icon={ExtensionIcon}
          to={URLS.frontend.api_docs}
          text="APIs"
        />
        <SidebarItem
          icon={LayersIcon}
          to={URLS.frontend.explore}
          text="Explore"
        />
        <SidebarItem icon={LibraryBooks} to={URLS.frontend.docs} text="Docs" />
        <SidebarItem
          icon={CreateComponentIcon}
          to={URLS.frontend.create}
          text="Create..."
        />
        {/* End global nav */}
        <SidebarDivider />
        <SidebarScrollWrapper>
          <SidebarItem
            icon={SpeedIcon}
            to={URLS.frontend.lighthouse}
            text="Lighthouse"
          />
        </SidebarScrollWrapper>
        <SidebarItem
          icon={WarningIcon}
          to={URLS.frontend.opencost}
          text="SKIPcost"
        />
      </SidebarGroup>
      <SidebarSpace />
      <SidebarDivider />
      <SidebarGroup
        label="Settings"
        icon={<UserSettingsSignInAvatar />}
        to={URLS.frontend.settings}
      >
        <SidebarSettings />
      </SidebarGroup>
    </Sidebar>
    {children}
  </SidebarPage>
);
