---
id: week-1-2-foundations
title: "Weeks 1–2: Physical AI Foundations"
sidebar_position: 2
---

# Weeks 1–2: Physical AI Foundations

> **Learning Objectives**
> - **LO1**: Understand Physical AI principles and the concept of embodied intelligence
> - **LO1**: Identify the major humanoid robot platforms and their capabilities
> - **LO1**: Explain the role of sensor systems in bridging the digital-physical interface

---

## What Is Physical AI?

Artificial intelligence, for most of its modern history, has been a digital phenomenon. A large language model processes tokens. An image classifier processes pixel arrays. A recommendation engine processes interaction histories. All of these systems live entirely in digital space: their inputs are numbers, their computations are matrix multiplications, and their outputs are more numbers.

**Physical AI** is different. A Physical AI system has a body — sensors that measure the physical world and actuators that change it. The intelligence is not just in the algorithm; it is *shaped by the body*. A robot that must navigate a cluttered room without knocking things over has different design constraints than a chatbot. Gravity, friction, latency, and physical damage are all real consequences of decisions.

The field of **embodied intelligence** formalises this observation. It argues that intelligence cannot be fully separated from the physical substrate through which it is expressed. A robot that has never experienced the weight of an object, the friction of a surface, or the resistance of a door cannot develop robust manipulation skills purely from visual observation. The body and the environment are part of the cognitive system.

```python
# A simplified sense-perceive-plan-act loop
class PhysicalAIAgent:
    def __init__(self, sensors, actuators, world_model, planner):
        self.sensors = sensors
        self.actuators = actuators
        self.world_model = world_model
        self.planner = planner

    def run_one_cycle(self):
        raw_data = self.sensors.read()            # SENSE
        percepts = self.world_model.update(raw_data)  # PERCEIVE
        action = self.planner.decide(percepts)    # PLAN
        self.actuators.execute(action)            # ACT
```

This four-step loop — **Sense → Perceive → Plan → Act** — is the fundamental architecture of every Physical AI system, from a simple line-following robot to a full humanoid receiving natural language commands.

---

## The Humanoid Morphology Advantage

Why focus on humanoid robots specifically? The answer is environmental fit. Human civilisation has been built around human bodies:

- **Doors** are sized for human height (1.8–2.1 m) and opened with handles designed for human hands.
- **Stairs** have 17–19 cm risers and 25–30 cm treads — matching human stride mechanics.
- **Tools** are designed for human grip strength, finger dexterity, and eye-hand coordination.
- **Vehicles** have controls positioned for human seated posture and arm reach.

A wheeled robot excels in a warehouse with flat floors and standardised shelf heights. But a humanoid robot can, in principle, work in any space designed for humans — the office, the kitchen, the hospital ward, the construction site — without requiring any infrastructure modifications.

The data advantage is equally compelling. There is vastly more video and motion capture data of humans performing tasks than of any robot platform. Humanoid robots can leverage this data directly for imitation learning in ways that a radically different morphology cannot.

### Current Humanoid Platforms

| Platform | Company | Height | DoF | Primary Use |
|----------|---------|--------|-----|-------------|
| Unitree G1 | Unitree Robotics | 127 cm | 43 | Education, research, logistics |
| Atlas | Boston Dynamics | 150 cm | 28 | Research, demonstration |
| Digit | Agility Robotics | 175 cm | 30 | Warehouse logistics |
| Optimus | Tesla | 172 cm | ~40 | Manufacturing |
| Figure 02 | Figure AI | 167 cm | ~44 | Manufacturing |

This course uses the **Unitree G1** as its reference platform because it is available at an educational price point (~$16,000), has an NVIDIA Jetson Orin NX onboard, and has a Gazebo and Isaac Sim URDF model available.

---

## Sensor Systems

A robot's sensors are its interface with the physical world. Understanding what each sensor measures, how data is represented, and what its failure modes are is essential for writing robust robot software.

### LiDAR (Light Detection and Ranging)

LiDAR emits laser pulses and measures the time-of-flight of reflections to compute the distance to surrounding surfaces. A 2D LiDAR produces a planar scan (a ring of distance measurements at different angles). A 3D LiDAR produces a full point cloud.

```
LiDAR Output: /scan (sensor_msgs/LaserScan)
Fields:
  angle_min: -π (start angle, radians)
  angle_max:  π (end angle, radians)
  angle_increment: 0.00436 (radians per measurement)
  ranges: [1.2, 1.3, 1.5, inf, 0.8, ...]  # metres per ray
  intensities: [120, 115, 130, 0, 200, ...]
```

**Failure modes**: LiDAR returns `inf` for transparent surfaces (glass) and surfaces that absorb the laser wavelength (black rubber). Rain and dust cause noise. ROS 2 LaserScan messages set `range_max` to filter out-of-range readings.

### Depth Cameras

Depth cameras (e.g., Intel RealSense D435i) use structured light or stereo matching to produce a dense depth image alongside a colour image. Each pixel has an (x, y, depth) measurement.

```python
# Converting depth image to 3D point cloud in ROS 2
from sensor_msgs.msg import Image, PointCloud2
import sensor_msgs_py.point_cloud2 as pc2

# Depth images are published as 16-bit unsigned integers (millimetres)
# /camera/depth/image_rect_raw → uint16, millimetres
# /camera/color/image_raw → bgr8

# The camera_info topic provides intrinsic matrix K for 3D projection
# x_3d = (u - cx) * depth / fx
# y_3d = (v - cy) * depth / fy
```

**Failure modes**: Depth cameras fail on shiny surfaces (specular reflection), transparent surfaces (glass), uniform surfaces with no texture (stereo matching fails), and in direct sunlight (structured light interference).

### Inertial Measurement Units (IMUs)

An IMU combines a three-axis accelerometer, a three-axis gyroscope, and optionally a three-axis magnetometer. It measures linear acceleration and angular velocity at high frequency (100–1000 Hz).

```
IMU Output: /imu/data (sensor_msgs/Imu)
Fields:
  orientation: quaternion (if filtered with magnetometer)
  angular_velocity: {x, y, z}  # rad/s
  linear_acceleration: {x, y, z}  # m/s²
```

IMUs are used for robot state estimation — combining IMU data with wheel odometry or VSLAM gives a fused pose estimate. The ROS 2 package `robot_localization` provides an Extended Kalman Filter that fuses multiple sensor sources.

**Failure modes**: Gyroscope drift accumulates over time. Accelerometers are noisy and cannot distinguish gravity from acceleration. Magnetometers are disturbed by metal objects and electrical wiring. Always use IMU data fused with at least one other sensor.

### Force-Torque Sensors

Force-torque sensors measure six-axis forces (Fx, Fy, Fz) and torques (Tx, Ty, Tz) at a robot joint or wrist. They enable compliant manipulation — allowing the robot to feel contact and adjust force accordingly.

```
F/T Output: /wrist_force (geometry_msgs/WrenchStamped)
Fields:
  wrench:
    force: {x: 2.3, y: -0.1, z: -9.8}  # Newtons
    torque: {x: 0.01, y: 0.03, z: -0.02}  # Newton-metres
```

The Unitree G1 includes force-torque sensors in the foot for bipedal balance control, and optional 6-axis wrist sensors for manipulation.

---

## Humanoid Robot System Architecture

A complete humanoid robot system integrates all sensor types into a unified control architecture:

```
Physical World
      │
   Sensors
┌─────┬─────┬───────┬──────┐
│LiDAR│Depth│  IMU  │ F/T  │
└──┬──┴──┬──┴───┬───┴──┬───┘
   │     │      │      │
   └─────┴──────┴──────┘
             │
         [ROS 2 Topics]
             │
   ┌─────────┴────────┐
   │   Perception     │  ← VSLAM, Object Detection, Pose Estimation
   └─────────┬────────┘
             │
   ┌─────────┴────────┐
   │   Planning       │  ← Navigation (Nav2), Manipulation Planning
   └─────────┬────────┘
             │
   ┌─────────┴────────┐
   │   Control        │  ← Joint PID Controllers, Whole-Body Control
   └─────────┬────────┘
             │
         Actuators
   (Joint motors, grippers)
             │
      Physical World
```

This architecture will be built up incrementally across all four modules. Module 1 handles the ROS 2 communication layer. Module 2 adds simulation. Module 3 adds the perception and navigation layers. Module 4 adds the language interface at the planning layer.

---

## The Humanoid Robotics Landscape in 2024–2025

The current generation of humanoid robots represents a step change from the research platforms of the 2010s. Several factors have converged:

1. **Motor and battery technology**: Brushless DC motors with high torque density and compact battery packs make untethered operation practical.
2. **Compute at the edge**: The NVIDIA Jetson Orin provides 100 TOPS of AI inference performance in a 15W package, enabling on-robot AI inference.
3. **Foundation models**: Large vision-language models can provide scene understanding that earlier computer vision pipelines required thousands of hours of task-specific training to achieve.
4. **Simulation fidelity**: Isaac Sim and MuJoCo now provide physics simulation accurate enough for Sim-to-Real transfer without extensive domain adaptation.

By the time you complete this course, you will have the skills to work on any of the platforms in the table above. The tools are standardised around ROS 2 and the NVIDIA Isaac ecosystem regardless of the specific hardware platform.

---

## Week 1–2 Summary

After completing Weeks 1–2, you should be able to:

- ✅ Define Physical AI and explain why embodied intelligence differs from digital-only AI
- ✅ Describe the Sense → Perceive → Plan → Act loop and identify each stage in a robot system
- ✅ Compare at least three current humanoid robot platforms by DoF, compute, and price
- ✅ Explain what each sensor type (LiDAR, depth camera, IMU, F/T) measures and its failure modes
- ✅ Read a ROS 2 topic name and infer what physical quantity it carries from the message type
- ✅ Set up a ROS 2 Humble development environment and verify it with `ros2 run demo_nodes_cpp talker`

Next: [Week 3–5: ROS 2 Fundamentals](/module-1-ros2/week-3-5-ros2-fundamentals)
