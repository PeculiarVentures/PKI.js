import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import npm2yarn from '@docusaurus/remark-plugin-npm2yarn';
import packageJSON from '../package.json';

const config: Config = {
  title: 'pki.js',
  tagline: 'pki.js',
  favicon: 'img/favicon.ico',
  url: 'https://pkijs.org',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  customFields: {
    description: packageJSON.description,
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
        // TODO: Add gtag trackingID.
        // gtag: {
        //   trackingID: '',
        // },
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
    image: 'img/card.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
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
      links: [
        {
          title: 'Learn',
          items: [
            {
              label: 'Installation',
              to: '/docs/installation',
            },
            {
              label: 'Examples',
              to: '/docs/examples/certificates-and-revocation',
            },
            {
              label: 'API',
              to: '/docs/api/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/PeculiarVentures/PKI.js',
            },
            {
              label: 'Contact us',
              href: 'mailto:info@peculiarventures.com',
            }
          ],
        },
        {
          title: `Version: ${packageJSON.version}`,
        },
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
