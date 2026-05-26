---
id: learning-outcomes
title: Learning Outcomes
sidebar_position: 2
---

# Learning Outcomes

This page documents all six learning outcomes for the Physical AI & Humanoid Robotics course, maps each outcome to the modules and weekly content that deliver it, and explains how each assessment measures mastery.

---

## Overview

The course is structured around six measurable learning outcomes, labelled LO1 through LO6. Each outcome corresponds to a distinct competency area that the physical AI engineering field demands. By the end of the thirteen-week programme, students will have demonstrated all six outcomes through graded assessments and hands-on project work.

| LO | Outcome | Primary Module | Assessment |
|----|---------|----------------|------------|
| LO1 | Physical AI principles and embodied intelligence | Module 1 (Weeks 1–2) | Integrated throughout |
| LO2 | ROS 2 (Robot Operating System) for robotic control | Module 1 (Weeks 3–5) | Assessment 1 |
| LO3 | Robot simulation with Gazebo and Unity | Module 2 (Weeks 6–7) | Assessment 2 |
| LO4 | NVIDIA Isaac AI robot platform development | Module 3 (Weeks 8–10) | Assessment 3 |
| LO5 | Humanoid robot design for natural interactions | Module 4 (Weeks 11–12) | Capstone |
| LO6 | GPT model integration for conversational robotics | Module 4 (Week 13) | Capstone |

---

## LO1 — Physical AI Principles and Embodied Intelligence

**Full statement**: Students will understand the theoretical and practical foundations of Physical AI, including the principles of embodied intelligence, the distinction between digital-only AI and robots that operate in physical space, and the landscape of current humanoid robot platforms.

### What you will learn

- The definition of **embodied intelligence**: an agent whose cognition is shaped by having a physical body with sensors and actuators.
- How Physical AI systems differ from language models or image generators: they must respect physical laws, operate in real time, and deal with sensor noise and actuator uncertainty.
- The **sense–perceive–plan–act** loop that governs all robot control systems.
- An overview of the humanoid robotics landscape: Unitree G1, Boston Dynamics Atlas, Agility Robotics Digit, and their respective simulation environments.
- Why sensor systems (LiDAR, depth cameras, IMUs, force-torque sensors) are the interface between the digital brain and the physical world.

### Module mapping

Weeks 1–2 in Module 1 deliver LO1 entirely. See [Week 1–2: Physical AI Foundations](/module-1-ros2/week-1-2-foundations).

### How it is assessed

LO1 is assessed implicitly throughout all four assessments. Every assignment requires students to make design decisions grounded in physical constraints (sensor noise, latency, actuator limits) rather than purely algorithmic ones. The capstone project (Assessment 4) is the most direct demonstration: students must document how their system handles real-world failure modes such as sensor dropouts and localisation drift.

---

## LO2 — ROS 2 for Robotic Control

**Full statement**: Students will master the Robot Operating System 2 (ROS 2) as the primary middleware for robotic control, including writing Python nodes with `rclpy`, using topics, services, and actions, managing parameters, building packages with `colcon`, and describing robot geometry with URDF.

### What you will learn

- **ROS 2 architecture**: the DDS communication layer, the node graph, and how ROS 2 differs from ROS 1.
- **Nodes, topics, services, and actions**: the four fundamental communication patterns and when to use each.
- **`rclpy` programming**: writing publishers, subscribers, service servers, clients, action servers, and action clients in Python 3.
- **Package management**: creating ROS 2 Python packages with `ament_python`, writing `setup.py` and `package.xml`, and building with `colcon build`.
- **Launch files**: composing multi-node systems with Python launch files, passing parameters, and managing lifecycle.
- **URDF**: encoding robot geometry, joints, links, and sensor positions in the Unified Robot Description Format.

### Module mapping

Weeks 3–5 in Module 1 deliver LO2. See:
- [Week 3–5: ROS 2 Fundamentals](/module-1-ros2/week-3-5-ros2-fundamentals)
- [Week 3–5: ROS 2 Advanced](/module-1-ros2/week-3-5-ros2-advanced)

### How it is assessed

**Assessment 1: ROS 2 Package Development Project**

Students build a complete ROS 2 Python package containing a sensor-data publisher node, a subscriber processing node, a service for on-demand queries, a launch file with configurable parameters, and a URDF file describing a two-joint robot arm.

Rubric criteria: package builds cleanly with `colcon build`, all nodes communicate correctly, launch file starts the system without errors, URDF renders in RViz.

---

## LO3 — Robot Simulation with Gazebo and Unity

**Full statement**: Students will simulate robotic systems using Gazebo for physics-accurate sensor and dynamics simulation, and Unity for high-fidelity rendering and human-robot interaction environments, including configuring URDF/SDF models, sensor plugins, and ROS bridges.

### What you will learn

- **Gazebo simulation environment**: installing Gazebo, loading SDF world files, and spawning robots from URDF.
- **Physics simulation**: configuring collision geometries, inertia tensors, friction parameters, and contact dynamics.
- **Sensor simulation**: attaching ROS 2 plugins for LiDAR, depth cameras, and IMUs to a robot model.
- **Unity for robotics**: using the Unity Robotics Hub to visualise robot state and render photorealistic human-robot interaction scenarios.
- **ROS–Unity bridge**: the `ros-tcp-connector` Unity package and `ros-tcp-endpoint` ROS 2 package for bidirectional message exchange.

### Module mapping

Weeks 6–7 in Module 2 deliver LO3. See:
- [Week 6–7: Gazebo Simulation](/module-2-digital-twin/week-6-7-gazebo)
- [Week 6–7: Unity Simulation](/module-2-digital-twin/week-6-7-unity)

### How it is assessed

**Assessment 2: Gazebo Simulation Implementation**

Students implement a Gazebo simulation containing a custom URDF/SDF robot with at least two sensor types (LiDAR and depth camera), a closed-loop ROS 2 controller driving the robot to waypoints, and evidence of physics interaction (collision response).

---

## LO4 — NVIDIA Isaac AI Robot Platform Development

**Full statement**: Students will develop AI-powered robot systems using the NVIDIA Isaac platform, including Isaac Sim for photorealistic simulation and synthetic data generation, Isaac ROS for hardware-accelerated perception, Nav2 for path planning, and Sim-to-Real transfer for Jetson deployment.

### What you will learn

- **NVIDIA Isaac Sim**: launching scenes, importing USD robot models, generating synthetic datasets with domain randomisation.
- **Isaac ROS**: hardware-accelerated packages — `isaac_ros_visual_slam`, `isaac_ros_image_proc`, `isaac_ros_object_detection`.
- **Nav2**: configuring costmaps, BT Navigator, planner server, and controller server for humanoid movement.
- **Reinforcement learning**: training locomotion policies in Isaac Lab, applying domain randomisation, exporting for Jetson.
- **Sim-to-Real transfer**: techniques for closing the reality gap.

### Module mapping

Weeks 8–10 in Module 3 deliver LO4. See:
- [Week 8–10: Isaac Sim](/module-3-isaac/week-8-10-isaac-sim)
- [Week 8–10: AI-Powered Perception](/module-3-isaac/week-8-10-perception)
- [Week 8–10: Sim-to-Real Transfer](/module-3-isaac/week-8-10-sim-to-real)

### How it is assessed

**Assessment 3: Isaac-Based Perception Pipeline**

Students implement VSLAM via `isaac_ros_visual_slam`, an object detection model trained on synthetic Isaac Sim data, and Nav2 configured to navigate to a detected object. Students must document their Sim-to-Real evaluation.

---

## LO5 — Humanoid Robot Design for Natural Interactions

**Full statement**: Students will design humanoid robot behaviour for natural human-robot interaction, including bipedal locomotion, upper-body manipulation, and HRI design principles.

### What you will learn

- **Humanoid kinematics**: forward kinematics, inverse kinematics, and the Denavit-Hartenberg convention.
- **Dynamics and balance control**: centre-of-mass estimation, ZMP criterion for bipedal stability, whole-body control.
- **Bipedal locomotion**: gait generation for walking, turning, and stair climbing.
- **Manipulation and grasping**: grasp planning, force-torque control, compliant manipulation.
- **HRI design**: proxemics, visual social cues, gesture recognition, natural interaction principles.

### Module mapping

Weeks 11–12 in Module 4 deliver LO5. See [Week 11–12: Humanoid Robot Design](/module-4-vla/week-11-12-humanoid).

### How it is assessed

LO5 is assessed as part of Assessment 4 (Capstone). The capstone requires a stably walking humanoid, an upper-body manipulation task using IK-based control, and an HRI scenario.

---

## LO6 — GPT Model Integration for Conversational Robotics

**Full statement**: Students will integrate large language models into robot control pipelines using Whisper for voice-to-text, LLM-based planning to translate natural language into ROS 2 action sequences, and multimodal interaction.

### What you will learn

- **OpenAI Whisper**: ASR architecture, running locally on Jetson Orin, ROS 2 integration.
- **LLM-based cognitive planning**: prompting an LLM with a robot action vocabulary, parsing JSON action plans.
- **Action execution pipeline**: validating and dispatching LLM-generated actions to ROS 2 action servers.
- **Multi-modal interaction**: combining speech, vision, and gesture in a single control loop.
- **Conversational robotics safety**: fallback behaviours for LLM failures and ambiguous commands.

### Module mapping

Week 13 in Module 4 delivers LO6. See [Week 13: Conversational Robotics](/module-4-vla/week-13-conversational).

### How it is assessed

LO6 is assessed in Assessment 4 (Capstone): the robot must accept a voice command via Whisper, generate a JSON plan from an LLM, execute it via ROS 2 action servers, and handle at least one error case.

---

## Assessment Summary

| Assessment | Module(s) | LOs Covered | Deliverable |
|------------|-----------|-------------|-------------|
| Assessment 1: ROS 2 Package | Module 1 | LO1, LO2 | ROS 2 Python package + URDF |
| Assessment 2: Gazebo Simulation | Modules 1–2 | LO1, LO2, LO3 | Gazebo scene + sensor nodes + controller |
| Assessment 3: Isaac Perception | Modules 1–3 | LO1–LO4 | VSLAM + object detection + Nav2 |
| Assessment 4: Capstone Humanoid | All modules | LO1–LO6 | Full autonomous humanoid system |

Each assessment is cumulative — every subsequent assessment incorporates all prior competencies. Full rubrics and submission guidelines are in the [Assessments](/assessments) chapter.
