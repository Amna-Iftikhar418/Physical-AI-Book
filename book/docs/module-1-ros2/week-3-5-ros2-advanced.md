---
id: week-3-5-ros2-advanced
title: "Weeks 3–5: ROS 2 Advanced"
sidebar_position: 4
---

# Weeks 3–5: ROS 2 Advanced

> **Learning Objectives**
> - **LO2**: Build ROS 2 Python packages with `colcon`, `ament_python`, and `setup.py`
> - **LO2**: Write Python launch files that compose multi-node systems with configurable parameters
> - **LO2**: Describe robot geometry with URDF for use in Gazebo and RViz

---

## ROS 2 Package Structure

A ROS 2 package is the fundamental unit of code organisation. Every node, launch file, and custom message belongs to a package. For Python nodes the package type is `ament_python`.

### Creating a Package

```bash
# Navigate to your ROS 2 workspace source directory
cd ~/ros2_ws/src

# Create a new Python package
ros2 pkg create --build-type ament_python my_robot_pkg \
  --dependencies rclpy std_msgs geometry_msgs sensor_msgs

# Package directory structure created:
# my_robot_pkg/
# ├── my_robot_pkg/
# │   └── __init__.py
# ├── package.xml
# ├── setup.cfg
# ├── setup.py
# └── resource/
#     └── my_robot_pkg
```

### `package.xml` — Package Manifest

```xml
<?xml version="1.0"?>
<package format="3">
  <name>my_robot_pkg</name>
  <version>0.1.0</version>
  <description>Physical AI Robot Package for Assessment 1</description>
  <maintainer email="student@example.com">Student Name</maintainer>
  <license>Apache-2.0</license>

  <depend>rclpy</depend>
  <depend>std_msgs</depend>
  <depend>geometry_msgs</depend>
  <depend>sensor_msgs</depend>

  <export>
    <build_type>ament_python</build_type>
  </export>
</package>
```

### `setup.py` — Entry Points

Entry points map a command name to a Python function. ROS 2 uses these to register nodes as executables.

```python
from setuptools import find_packages, setup

package_name = 'my_robot_pkg'

setup(
    name=package_name,
    version='0.1.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        ('share/' + package_name + '/launch', ['launch/robot.launch.py']),
        ('share/' + package_name + '/urdf', ['urdf/two_joint_arm.urdf']),
    ],
    install_requires=['setuptools'],
    entry_points={
        'console_scripts': [
            # 'executable_name = package.module:main_function'
            'sensor_publisher = my_robot_pkg.sensor_publisher:main',
            'data_processor = my_robot_pkg.data_processor:main',
        ],
    },
)
```

### Building with colcon

```bash
# Build the entire workspace
cd ~/ros2_ws
colcon build

# Build only one package (faster during development)
colcon build --packages-select my_robot_pkg

# Source the workspace overlay to make your packages available
source install/setup.bash

# Now your nodes are available as commands
ros2 run my_robot_pkg sensor_publisher
```

---

## ROS 2 Parameters

Parameters allow node behaviour to be configured at runtime without recompiling. A node declares parameters with default values; operators override them via launch files or the CLI.

### Declaring and Using Parameters

```python
from rclpy.node import Node
from rcl_interfaces.msg import ParameterDescriptor

class ConfigurablePublisher(Node):
    def __init__(self):
        super().__init__('configurable_publisher')

        # Declare parameters with defaults and descriptions
        self.declare_parameter(
            'publish_rate',
            1.0,
            ParameterDescriptor(description='Publishing rate in Hz')
        )
        self.declare_parameter(
            'topic_name',
            'sensor_data',
            ParameterDescriptor(description='Output topic name')
        )

        # Read parameter values
        rate = self.get_parameter('publish_rate').get_parameter_value().double_value
        topic = self.get_parameter('topic_name').get_parameter_value().string_value

        self.publisher_ = self.create_publisher(Float64, topic, 10)
        self.timer = self.create_timer(1.0 / rate, self.publish_callback)

    def publish_callback(self):
        msg = Float64()
        msg.data = 42.0
        self.publisher_.publish(msg)
```

### Overriding Parameters at Runtime

```bash
# Override parameter on the command line
ros2 run my_robot_pkg configurable_publisher \
  --ros-args -p publish_rate:=10.0 -p topic_name:=fast_sensor

# List parameters of a running node
ros2 param list /configurable_publisher

# Get a parameter value
ros2 param get /configurable_publisher publish_rate

# Set a parameter on a running node (if the node allows it)
ros2 param set /configurable_publisher publish_rate 5.0
```

---

## Launch Files

Launch files compose multiple nodes into a single system, applying parameters, remapping topic names, and managing node lifecycle. ROS 2 launch files are Python scripts.

### A Complete Launch File

```python
# launch/robot.launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    # Declare launch arguments (command-line overrideable)
    rate_arg = DeclareLaunchArgument(
        'publish_rate',
        default_value='5.0',
        description='Sensor publishing rate in Hz'
    )

    # Node definitions
    sensor_node = Node(
        package='my_robot_pkg',
        executable='sensor_publisher',
        name='sensor_publisher',
        parameters=[{
            'publish_rate': LaunchConfiguration('publish_rate'),
            'topic_name': 'sensor_data',
        }],
        output='screen'
    )

    processor_node = Node(
        package='my_robot_pkg',
        executable='data_processor',
        name='data_processor',
        remappings=[
            # Remap /input to /sensor_data so processor receives publisher output
            ('input', 'sensor_data'),
        ],
        output='screen'
    )

    return LaunchDescription([
        rate_arg,
        sensor_node,
        processor_node,
    ])
```

### Running a Launch File

```bash
# Launch with defaults
ros2 launch my_robot_pkg robot.launch.py

# Launch with overridden argument
ros2 launch my_robot_pkg robot.launch.py publish_rate:=10.0
```

---

## URDF: Unified Robot Description Format

URDF (Unified Robot Description Format) is an XML format for describing robot geometry, kinematic structure, inertial properties, and sensor placements. It is used by:

- **RViz** for 3D robot visualisation
- **Gazebo** for physics simulation
- **MoveIt 2** for motion planning
- **robot_state_publisher** for TF (transform) broadcasting

### URDF Structure: Links and Joints

A robot is described as a tree of **links** (rigid bodies) connected by **joints** (constraints between links).

```xml
<?xml version="1.0"?>
<robot name="two_joint_arm">

  <!-- Base link: fixed to the world -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.1 0.1 0.05"/>
      </geometry>
      <material name="grey">
        <color rgba="0.5 0.5 0.5 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.1 0.1 0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0"
               iyy="0.01" iyz="0.0" izz="0.01"/>
    </inertial>
  </link>

  <!-- First arm segment -->
  <link name="link_1">
    <visual>
      <geometry>
        <cylinder radius="0.02" length="0.3"/>
      </geometry>
      <origin xyz="0.0 0.0 0.15" rpy="0 0 0"/>
    </visual>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0.0" ixz="0.0"
               iyy="0.001" iyz="0.0" izz="0.001"/>
    </inertial>
  </link>

  <!-- Joint 1: revolute joint connecting base to link_1 -->
  <joint name="joint_1" type="revolute">
    <parent link="base_link"/>
    <child link="link_1"/>
    <origin xyz="0.0 0.0 0.025" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>  <!-- Rotation axis: Z -->
    <limit lower="-1.5708" upper="1.5708"  <!-- ±90 degrees -->
           effort="10.0" velocity="1.0"/>
  </joint>

  <!-- Second arm segment -->
  <link name="link_2">
    <visual>
      <geometry>
        <cylinder radius="0.015" length="0.25"/>
      </geometry>
      <origin xyz="0.0 0.0 0.125" rpy="0 0 0"/>
    </visual>
    <inertial>
      <mass value="0.3"/>
      <inertia ixx="0.0005" ixy="0.0" ixz="0.0"
               iyy="0.0005" iyz="0.0" izz="0.0005"/>
    </inertial>
  </link>

  <!-- Joint 2: revolute joint connecting link_1 to link_2 -->
  <joint name="joint_2" type="revolute">
    <parent link="link_1"/>
    <child link="link_2"/>
    <origin xyz="0.0 0.0 0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>  <!-- Rotation axis: Y -->
    <limit lower="-1.5708" upper="1.5708"
           effort="8.0" velocity="1.0"/>
  </joint>

</robot>
```

### Joint Types

| Type | Description | Example |
|------|-------------|---------|
| `revolute` | Rotates around an axis, with limits | Elbow joint |
| `continuous` | Rotates around an axis, unlimited | Wheel |
| `prismatic` | Translates along an axis, with limits | Gripper finger |
| `fixed` | No relative motion | Sensor mounting |
| `floating` | 6-DoF free motion | Floating base |
| `planar` | Translates in a plane | Mobile base |

### Visualising URDF in RViz

```bash
# Install joint state publisher GUI
sudo apt install ros-humble-joint-state-publisher-gui

# Launch robot_state_publisher + RViz
ros2 launch urdf_tutorial display.launch.py \
  model:=$(ros2 pkg prefix my_robot_pkg)/share/my_robot_pkg/urdf/two_joint_arm.urdf
```

The `robot_state_publisher` node reads the URDF and broadcasts TF (Transform) frames for every link, enabling RViz to render the robot in 3D with correct joint positions.

---

## TF2: The Transform Tree

TF2 (Transform Library 2) tracks the coordinate frame of every link in the robot at every point in time. When a LiDAR publishes a point cloud in its own frame (`/lidar_frame`), TF2 lets you transform that point cloud into the global map frame (`/map`) by looking up the chain of transforms: `/lidar_frame → /base_link → /odom → /map`.

```python
import rclpy
from rclpy.node import Node
from tf2_ros import TransformListener, Buffer
from geometry_msgs.msg import PointStamped
import tf2_geometry_msgs  # needed for do_transform_point

class PointTransformer(Node):
    def __init__(self):
        super().__init__('point_transformer')
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

    def transform_point_to_map(self, point_in_lidar_frame: PointStamped):
        try:
            # Look up transform from lidar_frame to map at the point's timestamp
            transform = self.tf_buffer.lookup_transform(
                'map',
                point_in_lidar_frame.header.frame_id,
                point_in_lidar_frame.header.stamp
            )
            return tf2_geometry_msgs.do_transform_point(
                point_in_lidar_frame, transform
            )
        except Exception as e:
            self.get_logger().warn(f'TF lookup failed: {e}')
            return None
```

---

## Assessment 1 Preparation

Assessment 1 requires a complete ROS 2 Python package. Review the checklist:

```
Assessment 1 Checklist:
  ✅ Package created with ros2 pkg create
  ✅ package.xml lists all dependencies
  ✅ setup.py registers all node entry points
  ✅ Publisher node: generates or reads Float64 data at 10 Hz
  ✅ Subscriber node: receives data, computes running average, logs every 10 messages
  ✅ Service server: returns min/max/mean of last 100 samples on request
  ✅ Launch file: starts publisher + subscriber with publish_rate parameter
  ✅ URDF: two-joint revolute arm with correct limits and inertia values
  ✅ colcon build succeeds with zero errors and zero warnings
  ✅ URDF renders in RViz via urdf_tutorial display.launch.py
```

Full assessment details and submission instructions are in the [Assessments](/assessments) chapter.
