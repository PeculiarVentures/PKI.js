const sidebars = {
  docs: [
    'installation',
    {
      type: 'category',
      label: 'API',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'api/pkijs',
          label: 'Readme',
        },
        {
          type: 'doc',
          id: 'api/globals',
          label: 'Exports',
        },
        ...require('./docs/api/typedoc-sidebar.cjs'),
      ],
    },
  ],
  examples: [
    {
      type: 'autogenerated',
      dirName: 'examples',
    }
  ],
};

export default sidebars;
