---
id: week-6-7-gazebo
title: "Weeks 6–7: Gazebo Simulation"
sidebar_position: 2
---

# Weeks 6–7: Gazebo Simulation

> **Learning Objectives**
> - **LO3**: Configure a robot in URDF/SDF format with physics-accurate parameters
> - **LO3**: Attach LiDAR, depth camera, and IMU sensor plugins to a simulated robot
> - **LO3**: Write a closed-loop ROS 2 controller that drives a simulated robot

---

## Gazebo Overview

Gazebo is an open-source robot simulation environment developed by Open Robotics (the same organisation behind ROS). The current actively developed version is **Gazebo Harmonic** (formerly "Ignition Gazebo") — a ground-up rewrite of classic Gazebo with a modern plugin API and first-class ROS 2 integration.

Key capabilities:
- **ODE/Bullet/DART physics**: multiple physics engines with configurable solvers
- **SDFormat (SDF)**: a more expressive format than URDF for simulation-specific properties
- **Sensor simulation**: ray (LiDAR), depth camera, camera, IMU, contact, force-torque, GPS
- **Plugin system**: C++ and Python plugins for custom sensors, controllers, and world scripts
- **GUI and headless modes**: visual debugging in the Gazebo GUI; headless for CI and RL training

### Installing Gazebo Harmonic with ROS 2 Humble

```bash
sudo apt install ros-humble-ros-gz

# Verify installation
gz sim --version
# Expected: Gazebo Harmonic 8.x.x
```

---

## SDF vs URDF

URDF is the native ROS format for robot description. SDF (Simulation Description Format) is Gazebo's native format and supports simulation-specific properties that URDF does not:

| Feature | URDF | SDF |
|---------|------|-----|
| Robot description | ✅ | ✅ |
| Sensor plugins | Limited | ✅ Full |
| World description | ❌ | ✅ |
| Physics parameters | Limited | ✅ Full |
| Multiple robots | ❌ | ✅ |
| Nested models | ❌ | ✅ |

For this course, we write robot models in **URDF with xacro macros** (for ROS 2 compatibility) and convert to SDF for Gazebo simulation. The conversion is handled automatically by the `ros_gz_sim` package.

### xacro: Parametric URDF

`xacro` is a macro language that extends URDF with variables, conditionals, and includes:

```xml
<?xml version="1.0"?>
<robot name="differential_robot" xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- Parameters -->
  <xacro:property name="base_radius" value="0.15"/>
  <xacro:property name="base_height" value="0.05"/>
  <xacro:property name="wheel_radius" value="0.033"/>
  <xacro:property name="wheel_width" value="0.018"/>

  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <cylinder radius="${base_radius}" length="${base_height}"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="${base_radius}" length="${base_height}"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.5"/>
      <!-- Cylinder inertia: Ixx = Iyy = m(3r² + h²)/12, Izz = mr²/2 -->
      <inertia ixx="0.0186" ixy="0.0" ixz="0.0"
               iyy="0.0186" iyz="0.0"
               izz="0.0169"/>
    </inertial>
  </link>

  <!-- Macro for a wheel -->
  <xacro:macro name="wheel" params="name x_offset y_offset">
    <link name="${name}_wheel">
      <visual>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
        <origin xyz="0 0 0" rpy="1.5708 0 0"/>
      </visual>
      <inertial>
        <mass value="0.1"/>
        <inertia ixx="0.000026" ixy="0" ixz="0"
                 iyy="0.000026" iyz="0" izz="0.000050"/>
      </inertial>
    </link>
    <joint name="${name}_wheel_joint" type="continuous">
      <parent link="base_link"/>
      <child link="${name}_wheel"/>
      <origin xyz="${x_offset} ${y_offset} 0" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
    </joint>
  </xacro:macro>

  <!-- Instantiate wheels -->
  <xacro:wheel name="left" x_offset="0.0" y_offset="0.15"/>
  <xacro:wheel name="right" x_offset="0.0" y_offset="-0.15"/>

</robot>
```

---

## Sensor Plugins for Gazebo

Sensor plugins attach simulated sensors to robot links and publish their data to Gazebo topics. The `ros_gz_bridge` then mirrors these to ROS 2 topics.

### LiDAR (Ray Sensor)

```xml
<!-- Add to the robot URDF/SDF, inside the lidar_link element -->
<gazebo reference="lidar_link">
  <sensor name="lidar" type="ray">
    <always_on>true</always_on>
    <update_rate>10</update_rate>
    <pose>0 0 0 0 0 0</pose>
    <ray>
      <scan>
        <horizontal>
          <samples>360</samples>
          <min_angle>-3.14159</min_angle>
          <max_angle>3.14159</max_angle>
        </horizontal>
      </scan>
      <range>
        <min>0.12</min>
        <max>30.0</max>
        <resolution>0.01</resolution>
      </range>
      <noise>
        <type>gaussian</type>
        <mean>0.0</mean>
        <stddev>0.01</stddev>
      </noise>
    </ray>
    <topic>/lidar/scan</topic>
  </sensor>
</gazebo>
```

### Depth Camera

```xml
<gazebo reference="camera_link">
  <sensor name="depth_camera" type="depth_camera">
    <always_on>true</always_on>
    <update_rate>30</update_rate>
    <camera>
      <horizontal_fov>1.047</horizontal_fov>  <!-- 60 degrees -->
      <image>
        <width>640</width>
        <height>480</height>
        <format>R_FLOAT32</format>
      </image>
      <clip>
        <near>0.1</near>
        <far>10.0</far>
      </clip>
      <noise>
        <type>gaussian</type>
        <mean>0.0</mean>
        <stddev>0.007</stddev>
      </noise>
    </camera>
    <topic>/camera/depth</topic>
  </sensor>
</gazebo>
```

### IMU

```xml
<gazebo reference="imu_link">
  <sensor name="imu_sensor" type="imu">
    <always_on>true</always_on>
    <update_rate>100</update_rate>
    <imu>
      <angular_velocity>
        <x><noise type="gaussian"><mean>0</mean><stddev>0.009</stddev></noise></x>
        <y><noise type="gaussian"><mean>0</mean><stddev>0.009</stddev></noise></y>
        <z><noise type="gaussian"><mean>0</mean><stddev>0.009</stddev></noise></z>
      </angular_velocity>
      <linear_acceleration>
        <x><noise type="gaussian"><mean>0</mean><stddev>0.021</stddev></noise></x>
        <y><noise type="gaussian"><mean>0</mean><stddev>0.021</stddev></noise></y>
        <z><noise type="gaussian"><mean>0</mean><stddev>0.021</stddev></noise></z>
      </linear_acceleration>
    </imu>
    <topic>/imu/data</topic>
  </sensor>
</gazebo>
```

---

## ROS–Gazebo Bridge

The `ros_gz_bridge` package creates bidirectional bridges between Gazebo topics and ROS 2 topics.

```bash
# Start the bridge, mapping Gazebo /lidar/scan → ROS 2 /scan (LaserScan type)
ros2 run ros_gz_bridge parameter_bridge \
  /lidar/scan@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan \
  /camera/depth@sensor_msgs/msg/Image[gz.msgs.Image \
  /imu/data@sensor_msgs/msg/Imu[gz.msgs.IMU \
  /cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist
```

In a launch file:

```python
from launch_ros.actions import Node

bridge_node = Node(
    package='ros_gz_bridge',
    executable='parameter_bridge',
    arguments=[
        '/lidar/scan@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan',
        '/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
    ],
    output='screen'
)
```

---

## Writing a Closed-Loop Controller

A closed-loop controller reads sensor data and adjusts actuator commands to achieve a goal. This example implements a simple waypoint follower using LiDAR-based obstacle avoidance:

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan
from nav_msgs.msg import Odometry
import math

class WaypointController(Node):
    def __init__(self):
        super().__init__('waypoint_controller')

        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.scan_sub = self.create_subscription(LaserScan, '/scan',
                                                  self.scan_callback, 10)
        self.odom_sub = self.create_subscription(Odometry, '/odom',
                                                  self.odom_callback, 10)

        # Waypoints: (x, y) in metres from start
        self.waypoints = [(1.0, 0.0), (1.0, 1.0), (0.0, 1.0), (0.0, 0.0)]
        self.current_wp = 0
        self.robot_x = 0.0
        self.robot_y = 0.0
        self.robot_yaw = 0.0
        self.obstacle_ahead = False

        self.timer = self.create_timer(0.1, self.control_loop)

    def scan_callback(self, msg: LaserScan):
        # Check for obstacles within 0.5m in the forward ±30° arc
        front_ranges = msg.ranges[330:] + msg.ranges[:30]  # ±30°
        min_dist = min(r for r in front_ranges if r > msg.range_min)
        self.obstacle_ahead = min_dist < 0.5

    def odom_callback(self, msg: Odometry):
        self.robot_x = msg.pose.pose.position.x
        self.robot_y = msg.pose.pose.position.y
        q = msg.pose.pose.orientation
        # Extract yaw from quaternion
        siny_cosp = 2.0 * (q.w * q.z + q.x * q.y)
        cosy_cosp = 1.0 - 2.0 * (q.y * q.y + q.z * q.z)
        self.robot_yaw = math.atan2(siny_cosp, cosy_cosp)

    def control_loop(self):
        if self.current_wp >= len(self.waypoints):
            self.get_logger().info('All waypoints reached!')
            self.cmd_pub.publish(Twist())
            return

        wp_x, wp_y = self.waypoints[self.current_wp]
        dx = wp_x - self.robot_x
        dy = wp_y - self.robot_y
        dist = math.sqrt(dx**2 + dy**2)

        if dist < 0.1:  # Waypoint reached
            self.get_logger().info(f'Reached waypoint {self.current_wp}')
            self.current_wp += 1
            return

        cmd = Twist()
        if self.obstacle_ahead:
            # Turn in place to avoid obstacle
            cmd.angular.z = 0.5
        else:
            # Steer toward waypoint
            target_yaw = math.atan2(dy, dx)
            yaw_error = target_yaw - self.robot_yaw
            # Normalise to [-π, π]
            while yaw_error > math.pi: yaw_error -= 2*math.pi
            while yaw_error < -math.pi: yaw_error += 2*math.pi

            cmd.linear.x = min(0.3, dist)
            cmd.angular.z = 2.0 * yaw_error

        self.cmd_pub.publish(cmd)
```

---

## Complete Gazebo Launch File

```python
# launch/gazebo_simulation.launch.py
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os

def generate_launch_description():
    pkg_dir = get_package_share_directory('my_robot_pkg')

    # Launch Gazebo with an empty world
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(get_package_share_directory('ros_gz_sim'),
                         'launch', 'gz_sim.launch.py')
        ),
        launch_arguments={'gz_args': '-r empty.sdf'}.items()
    )

    # Spawn the robot
    spawn_robot = Node(
        package='ros_gz_sim',
        executable='create',
        arguments=['-name', 'my_robot',
                   '-file', os.path.join(pkg_dir, 'urdf', 'robot.urdf')],
        output='screen'
    )

    # ROS–Gazebo bridge
    bridge = Node(
        package='ros_gz_bridge',
        executable='parameter_bridge',
        arguments=[
            '/lidar/scan@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan',
            '/imu/data@sensor_msgs/msg/Imu[gz.msgs.IMU',
            '/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
            '/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry',
        ]
    )

    # Waypoint controller
    controller = Node(
        package='my_robot_pkg',
        executable='waypoint_controller',
        output='screen'
    )

    return LaunchDescription([gazebo, spawn_robot, bridge, controller])
```

---

## Running the Simulation

```bash
# Build and source
colcon build --packages-select my_robot_pkg
source install/setup.bash

# Launch everything
ros2 launch my_robot_pkg gazebo_simulation.launch.py

# In a separate terminal, verify topics are bridged
ros2 topic list
# Expected: /lidar/scan, /imu/data, /cmd_vel, /odom

# Visualise in RViz
ros2 run rviz2 rviz2
```

After completing this chapter you have all the tools needed for Assessment 2. See [Assessments](/assessments) for the full rubric.
