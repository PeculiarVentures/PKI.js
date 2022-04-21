import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import npm2yarn from '@docusaurus/remark-plugin-npm2yarn';

const config: Config = {
  title: 'pki.js',
  tagline: 'pki.js',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://pkijs.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          sidebarPath: './sidebars.ts',
          remarkPlugins: [npm2yarn],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        blog: false,
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        disableSources: true,
        hideInPageTOC: true,
      },
    ],
    'docusaurus-plugin-sass',
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      style: 'dark',
      logo: {
        alt: 'pki.js',
        src: '/img/logo.svg',
        width: 80,
      },
      items: [
        {
          type: 'docSidebar',
          position: 'right',
          sidebarId: 'docs',
          label: 'Docs',
        },
        {
          type: 'docSidebar',
          position: 'right',
          sidebarId: 'examples',
          label: 'Examples',
        },
        {
          href: 'https://github.com/PeculiarVentures/PKI.js',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: 'Made with ❤️ across the globe',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
