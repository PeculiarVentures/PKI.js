/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'pki.js',
  favicon: '/img/favicon.ico',
  customFields: {
    description: 'PKIjs provides a Typescript implementation of the most common formats and algorithms needed to build PKI-enabled applications.',
  },
  url: 'https://pkijs.org',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  themeConfig: {
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
          label: 'API',
          to: '/docs/api',
          position: 'right',
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
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
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
    'docusaurus-plugin-sass'
  ],
};

module.exports = config;
