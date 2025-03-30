type MenuItem = {
  link: string;
  name: string;
};

export type NavbarProps = {
  menuList: MenuItem[];
  basePath?: string;
};
