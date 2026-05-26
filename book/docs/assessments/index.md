---
id: assessments
title: Assessments
sidebar_position: 1
---

# Assessments

The course has four graded assessments, each building on the one before. Completing all four assessments demonstrates all six learning outcomes (LO1–LO6).

---

## Assessment 1: ROS 2 Package Development Project

**Module**: Module 1 — The Robotic Nervous System (ROS 2)  
**Due**: End of Week 5  
**Learning Outcomes**: LO1, LO2  
**Weight**: 20% of final grade

### Description

Build a complete ROS 2 Python package from scratch that demonstrates mastery of the ROS 2 communication model, package structure, and robot description.

### Deliverables

1. **Python Package** (`ament_python` build type):
   - A publisher node that generates Float64 sensor data (e.g., simulated temperature) at 10 Hz
   - A subscriber node that receives the data, maintains a rolling average, and logs the average every 10 messages
   - A service server that returns `{min, max, mean, count}` of all received samples on request
   - A service client that calls the service every 30 seconds and logs the result

2. **Launch File** (`my_robot_pkg/launch/robot.launch.py`):
   - Starts both the publisher and subscriber nodes
   - Accepts `publish_rate` as an overrideable launch argument (default 10.0 Hz)
   - All nodes output to screen

3. **URDF File** (`my_robot_pkg/urdf/two_joint_arm.urdf`):
   - Describes a 2-DoF robot arm: base link + 2 revolute joints + end-effector link
   - Correct inertia tensors (non-zero, physically plausible)
   - Joint limits defined (±90° for both joints)
   - Renders in RViz via `urdf_tutorial display.launch.py` without errors

4. **README.md** in the package root:
   - Build instructions: `colcon build --packages-select my_robot_pkg`
   - Run instructions: `ros2 launch my_robot_pkg robot.launch.py`
   - How to call the service: `ros2 service call /sensor_stats ...`

### Rubric

| Criterion | Points |
|-----------|--------|
| Package builds without errors with `colcon build` | 20 |
| Publisher publishes at correct rate (±10%) verified with `ros2 topic hz` | 10 |
| Subscriber logs rolling average correctly | 10 |
| Service server responds with correct stats | 15 |
| Launch file starts all nodes; `publish_rate` argument works | 15 |
| URDF renders in RViz without TF errors | 20 |
| README with correct build/run instructions | 10 |
| **Total** | **100** |

### Submission

Push the package to a public GitHub repository. Submit the repository URL. Include the tag `assessment-1`.

---

## Assessment 2: Gazebo Simulation Implementation

**Module**: Module 2 — The Digital Twin  
**Due**: End of Week 7  
**Learning Outcomes**: LO1, LO2, LO3  
**Weight**: 20% of final grade

### Description

Extend the robot from Assessment 1 into a Gazebo simulation with physics-accurate sensors and a closed-loop controller.

### Deliverables

1. **Robot URDF/SDF with sensors**:
   - The two-joint arm from Assessment 1, extended with a mobile base (differential drive)
   - 2D LiDAR sensor plugin: 360° scan, 0.12–30m range, 10 Hz, published to `/lidar/scan`
   - Depth camera plugin: 640×480, 30 Hz, published to `/camera/depth/image_raw`
   - Optional: IMU plugin publishing to `/imu/data` (bonus 10 points)

2. **Gazebo World File** (`my_robot_pkg/worlds/assessment2.world`):
   - At least 4 static obstacles (walls, boxes) for the robot to navigate around
   - Flat ground plane

3. **Waypoint Controller Node** (`my_robot_pkg/waypoint_controller.py`):
   - Drives the robot through at least 4 waypoints in sequence
   - Uses LiDAR data to detect and avoid obstacles within 0.5m
   - Publishes `/cmd_vel` at 10 Hz

4. **Launch File** (`launch/gazebo_sim.launch.py`):
   - Starts Gazebo with the custom world
   - Spawns the robot
   - Starts the `ros_gz_bridge` for all required topics
   - Starts the waypoint controller

5. **Simulation recording** (2-minute video or rosbag):
   - Robot navigating all four waypoints
   - At least one obstacle avoidance event visible

### Rubric

| Criterion | Points |
|-----------|--------|
| Simulation launches without errors | 15 |
| LiDAR topic publishes at correct rate and range | 15 |
| Depth camera topic publishes | 10 |
| Robot navigates to all 4 waypoints | 25 |
| Obstacle avoidance demonstrated (at least once) | 20 |
| Launch file starts everything with a single command | 10 |
| Simulation recording submitted | 5 |
| IMU bonus | +10 |
| **Total (base)** | **100** |

---

## Assessment 3: Isaac-Based Perception Pipeline

**Module**: Module 3 — The AI-Robot Brain  
**Due**: End of Week 10  
**Learning Outcomes**: LO1–LO4  
**Weight**: 30% of final grade

### Description

Build a complete AI perception pipeline using Isaac Sim for synthetic data generation and Isaac ROS for real-time inference on Jetson (or cloud equivalent).

### Deliverables

1. **Isaac Sim Synthetic Dataset**:
   - A Replicator script that generates ≥500 labelled images of a target object class
   - Domain randomisation: at least 3 types (lighting, textures, object positions)
   - Output in COCO format with bounding box annotations
   - Script committed to repository as `isaac_sim/generate_dataset.py`

2. **Trained Object Detection Model**:
   - A YOLOv8 or RT-DETR model trained on the synthetic dataset
   - Training notebook or script committed to `training/train_detector.py`
   - Model exported to ONNX: `models/detector.onnx`
   - Validation: ≥70% mAP@0.5 on a held-out test split

3. **VSLAM Integration**:
   - `isaac_ros_visual_slam` node running in a Gazebo or Isaac Sim scene
   - Map visualised in RViz: point cloud published to `/visual_slam/vis/observations_cloud`
   - Odometry published to `/visual_slam/tracking/odometry` or remapped to `/odom`

4. **Nav2 Navigation**:
   - Nav2 configured with humanoid-appropriate parameters (inflated footprint, low velocity limits)
   - Robot navigates to a detected object's estimated position using VSLAM + Nav2
   - `nav2_params.yaml` committed to repository

5. **Sim-to-Real Analysis** (written report, 500–800 words):
   - Document what works identically in simulation vs. real hardware
   - Identify at least 3 sources of the reality gap specific to your implementation
   - Propose mitigation for each gap

### Rubric

| Criterion | Points |
|-----------|--------|
| Synthetic dataset generated (≥500 images, COCO format) | 15 |
| ≥3 domain randomisation types applied | 10 |
| Model trained; ONNX file committed | 10 |
| Model validation mAP@0.5 ≥ 70% | 15 |
| VSLAM running; point cloud published | 15 |
| Nav2 navigates to detected object | 20 |
| Sim-to-Real analysis report (quality and depth) | 15 |
| **Total** | **100** |

---

## Assessment 4: Capstone — The Autonomous Humanoid

**Module**: Module 4 — Vision-Language-Action  
**Due**: End of Week 13  
**Learning Outcomes**: LO1–LO6  
**Weight**: 30% of final grade

### Description

Build a complete conversational autonomous humanoid robot system that accepts voice commands, plans actions using an LLM, and executes them via ROS 2 action servers.

### Deliverables

1. **Voice Command Pipeline**:
   - Whisper ASR node transcribing voice to text via `/asr/transcription`
   - Must handle at least 3 distinct command types correctly (≤2 word error rate)

2. **LLM Planner**:
   - Planner node subscribing to `/asr/transcription`
   - Generates valid JSON action plans using Gemini 2.0 Flash
   - Action vocabulary: navigate, grasp, place, speak, wait, cancel
   - Graceful rejection of nonsensical or unsafe commands

3. **Action Validator**:
   - Validates JSON structure, action names, required fields
   - Logs rejected plans with reasons

4. **Action Executor**:
   - Dispatches to Nav2 (navigate actions)
   - Dispatches to a grasp action server (grasp actions)
   - Publishes to TTS (speak actions)
   - Handles action server failures gracefully

5. **End-to-End Demo** (video, ≤5 minutes):
   - Voice command → plan generation → execution visible in RViz or Gazebo
   - At least three different commands demonstrated
   - At least one error/rejection case demonstrated
   - TTS confirmation heard for each completed action

6. **System Architecture Document** (1 page):
   - Node graph diagram (RQT graph screenshot or hand-drawn)
   - Topic and action server list with types
   - Known limitations

### Rubric

| Criterion | Points |
|-----------|--------|
| Whisper ASR produces correct transcript for 3 test commands | 15 |
| LLM generates valid JSON plan within 3 seconds | 15 |
| Action validator correctly rejects invalid plans | 10 |
| Nav2 executes navigate actions | 15 |
| Grasp action executed | 10 |
| TTS spoken confirmation | 5 |
| Error case handled gracefully | 10 |
| Demo video quality (clear, all stages visible) | 10 |
| Architecture document | 10 |
| **Total** | **100** |

---

## Grading Summary

| Assessment | Module | Weight | LOs |
|------------|--------|--------|-----|
| Assessment 1: ROS 2 Package | Module 1 | 20% | LO1, LO2 |
| Assessment 2: Gazebo Simulation | Module 2 | 20% | LO1–LO3 |
| Assessment 3: Isaac Perception | Module 3 | 30% | LO1–LO4 |
| Assessment 4: Capstone | Module 4 | 30% | LO1–LO6 |

All assessments are individual submissions unless the instructor explicitly authorises group work. All code must be in a public GitHub repository with a commit history demonstrating ongoing work (not a single final push). Late submissions lose 10 points per day up to a maximum of 50 points (50% deduction cap).
