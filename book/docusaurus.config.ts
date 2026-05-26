import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'An AI-native university textbook on ROS 2, Digital Twins, NVIDIA Isaac, and Vision-Language-Action models',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://Amna-Iftikhar418.github.io',
  baseUrl: '/Physical-AI-Book/',

  organizationName: 'Amna-Iftikhar418',
  projectName: 'Physical-AI-Book',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  customFields: {
    apiUrl: process.env.REACT_APP_API_URL ?? 'http://localhost:8000',
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI & Humanoid Robotics',
      logo: {
        alt: 'Physical AI Textbook Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'bookSidebar',
          position: 'left',
          label: 'Textbook',
        },
        {
          href: 'https://github.com/Amna-Iftikhar418/Physical-AI-Book',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Modules',
          items: [
            {label: 'Module 1: ROS 2', to: '/module-1-ros2'},
            {label: 'Module 2: Digital Twins', to: '/module-2-digital-twin'},
            {label: 'Module 3: NVIDIA Isaac', to: '/module-3-isaac'},
            {label: 'Module 4: VLA', to: '/module-4-vla'},
          ],
        },
        {
          title: 'Course',
          items: [
            {label: 'Learning Outcomes', to: '/learning-outcomes'},
            {label: 'Hardware Requirements', to: '/hardware/requirements'},
            {label: 'Assessments', to: '/assessments'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Panaversity. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'bash', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
