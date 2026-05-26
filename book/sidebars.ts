import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  bookSidebar: [
    'intro',
    'learning-outcomes',
    {
      type: 'category',
      label: 'Hardware',
      items: ['hardware/requirements'],
    },
    {
      type: 'category',
      label: 'Module 1: ROS 2',
      items: [
        'module-1-ros2/module-1-ros2',
        'module-1-ros2/week-1-2-foundations',
        'module-1-ros2/week-3-5-ros2-fundamentals',
        'module-1-ros2/week-3-5-ros2-advanced',
      ],
    },
    {
      type: 'category',
      label: 'Module 2: Digital Twins',
      items: [
        'module-2-digital-twin/module-2-digital-twin',
        'module-2-digital-twin/week-6-7-gazebo',
        'module-2-digital-twin/week-6-7-unity',
      ],
    },
    {
      type: 'category',
      label: 'Module 3: NVIDIA Isaac',
      items: [
        'module-3-isaac/module-3-isaac',
        'module-3-isaac/week-8-10-isaac-sim',
        'module-3-isaac/week-8-10-perception',
        'module-3-isaac/week-8-10-sim-to-real',
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action',
      items: [
        'module-4-vla/module-4-vla',
        'module-4-vla/week-11-12-humanoid',
        'module-4-vla/week-13-conversational',
      ],
    },
    {
      type: 'category',
      label: 'Assessments',
      items: ['assessments/assessments'],
    },
  ],
};

export default sidebars;
