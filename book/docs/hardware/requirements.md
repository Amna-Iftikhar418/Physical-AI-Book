---
id: requirements
title: Hardware Requirements
sidebar_position: 1
---

# Hardware Requirements

This chapter documents all hardware configurations supported by the Physical AI & Humanoid Robotics course. Students may choose the tier that matches their budget and goals — all course content can be completed using the Cloud-Native alternative if local hardware is unavailable.

---

## Overview of Hardware Tiers

The course supports four hardware configurations at different price and capability points:

| Tier | Configuration | Best For |
|------|--------------|----------|
| Tier 1 | Digital Twin Workstation | Students with a local GPU workstation |
| Tier 2 | Physical AI Edge Kit | Students who want real Jetson hardware |
| Tier 3 | Robot Lab (Unitree) | Lab environments with physical robots |
| Tier 4 | Cloud-Native | Students without local GPU hardware |

All assessment work can be completed on Tier 1 or Tier 4. Tiers 2 and 3 are required only for real-hardware Sim-to-Real demonstrations.

---

## Tier 1 — Digital Twin Workstation

The Digital Twin Workstation is the recommended local development configuration. It runs all simulation environments (Gazebo, Isaac Sim) and ROS 2 natively on Ubuntu 22.04 LTS.

### Minimum Specification

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 8-core x86-64 (Intel Core i7 / AMD Ryzen 7) | 12-core or above |
| GPU | NVIDIA RTX 3070 (8 GB VRAM) | NVIDIA RTX 4080 or above |
| RAM | 32 GB DDR4 | 64 GB DDR4 |
| Storage | 512 GB NVMe SSD | 1 TB NVMe SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| CUDA | 11.8 | 12.x |

### Why Ubuntu 22.04 LTS

ROS 2 Humble Hawksbill officially targets Ubuntu 22.04 LTS. Isaac Sim 4.x and Isaac ROS 2.x also require Ubuntu 22.04 with CUDA 11.8+. Running the course software on Windows (via WSL2) or macOS is possible for introductory ROS 2 exercises but is not supported for Isaac Sim or GPU-accelerated Isaac ROS pipelines.

### Software Stack (installed on Workstation)

```bash
# ROS 2 Humble
sudo apt install ros-humble-desktop

# Gazebo Fortress (recommended for ROS 2 Humble)
sudo apt install ros-humble-gazebo-ros-pkgs

# Isaac ROS (installed via rosdep + apt)
# Full installation guide: https://nvidia-isaac-ros.github.io/getting_started/

# Python 3.10 with rclpy
sudo apt install python3-colcon-common-extensions python3-rosdep
```

### GPU Driver Requirements

Isaac Sim requires NVIDIA driver ≥ 525.85 on Ubuntu 22.04. Verify with:

```bash
nvidia-smi
# Expected output includes: CUDA Version: 12.x
```

---

## Tier 2 — Physical AI Edge Kit

The Physical AI Edge Kit brings the AI-robot brain to the edge — a Jetson Orin board running Isaac ROS in real time with real sensors.

### Edge Kit Components

| Component | Specification |
|-----------|--------------|
| Compute Module | NVIDIA Jetson Orin Nano (8 GB) or Jetson Orin NX (16 GB) |
| Developer Kit | Seeed Studio reComputer J4012 or NVIDIA Orin Developer Kit |
| Depth Camera | Intel RealSense D435i (depth + RGB + IMU) |
| IMU | Integrated in RealSense D435i; external MPU-9250 optional |
| Microphone Array | ReSpeaker USB Mic Array v2.0 (4-mic array, USB) |
| OS | JetPack 6.x (Ubuntu 22.04 LTS) |
| Storage | 256 GB NVMe SSD (for JetPack + ROS 2 + models) |

### Jetson Orin Nano vs Orin NX

| Feature | Orin Nano 8 GB | Orin NX 16 GB |
|---------|---------------|---------------|
| AI Performance | 40 TOPS | 100 TOPS |
| CUDA Cores | 1024 | 1024 |
| Memory | 8 GB LPDDR5 | 16 GB LPDDR5 |
| Price | ~$250 (module) | ~$400 (module) |
| Recommended Use | Sensor processing, basic inference | Full Isaac ROS pipeline |

For the Sim-to-Real module (Assessment 3), the Orin NX 16 GB is strongly recommended — the full Isaac ROS VSLAM + object detection pipeline requires approximately 12 GB of system memory at peak.

### RealSense D435i Setup

```bash
# Install RealSense SDK on Jetson
sudo apt install librealsense2-utils ros-humble-realsense2-camera

# Verify camera is detected
rs-enumerate-devices

# Launch ROS 2 driver
ros2 launch realsense2_camera rs_launch.py
# Publishes: /camera/color/image_raw, /camera/depth/image_rect_raw, /camera/imu
```

### ReSpeaker Microphone Array

The ReSpeaker USB Mic Array v2.0 is a 4-microphone circular array with onboard DSP for far-field voice capture and speaker localisation. It connects via USB and is recognised as a standard ALSA audio device on Ubuntu.

```bash
# Install Python driver
pip3 install pyusb

# Verify detection
lsusb | grep SEEED
# Expected: SEEED Technology Inc. USB Microphone

# Test recording (5 seconds)
arecord -D plughw:CARD=ArrayUAC10,DEV=0 -f S16_LE -r 16000 -c 1 test.wav -d 5
```

---

## Tier 3 — Robot Lab (Unitree Robots)

The Robot Lab tier is for educational institutions with physical humanoid robots. The course content is designed to transfer directly from Gazebo/Isaac Sim simulation to these platforms via the Sim-to-Real pipeline taught in Module 3.

### Economy Jetson Kit (Proxy Robot)

For classes that cannot afford full humanoid robots, the Unitree Go2 quadruped serves as a proxy for developing and validating Sim-to-Real pipelines before moving to humanoid hardware.

| Component | Specification |
|-----------|--------------|
| Robot | Unitree Go2 (quadruped, 15 kg) |
| Onboard Compute | Unitree internal Jetson Orin NX |
| Sensors | Front stereo cameras, LiDAR (optional) |
| Price | ~$2,800 |

### Miniature Humanoid — Unitree G1

The Unitree G1 is the primary humanoid platform for this course. It is a full bipedal humanoid with articulated arms and hands.

| Component | Specification |
|-----------|--------------|
| Robot | Unitree G1 Humanoid |
| Height | 127 cm |
| Weight | 35 kg |
| DoF | 43 (full body including hands) |
| Compute | Onboard Jetson Orin NX |
| Sensors | Depth cameras, IMU, force-torque sensors in feet |
| Connectivity | Ethernet, Wi-Fi 6 |
| Price | ~$16,000 (educational tier) |

### Premium G1 — Sim-to-Real Lab

The premium lab configuration adds external motion capture for precise ground-truth localisation during Sim-to-Real validation experiments.

| Component | Specification |
|-----------|--------------|
| Robot | Unitree G1 (as above) |
| Motion Capture | OptiTrack Prime 13W (4-camera setup, sub-mm accuracy) |
| External Compute | Workstation connected via gigabit Ethernet to robot |
| Use Case | High-fidelity Sim-to-Real evaluation, locomotion research |

### Safety Requirements for Robot Lab

When operating physical robots in the lab, students **must** follow these safety protocols:

1. Always keep the robot on the safety harness during initial locomotion tests.
2. Clear a minimum 3m × 3m floor area before any walking experiment.
3. Never command a standing robot without an operator ready at the emergency stop.
4. Run all new policies at 25% speed for the first five iterations.
5. Monitor joint temperature — Unitree G1 joints will thermal-throttle above 65°C.

---

## Tier 4 — Cloud-Native Alternative

Students who do not have a local GPU workstation or Jetson hardware can complete the entire course using cloud compute. This is the recommended path for online students.

### AWS g5.2xlarge

| Component | Specification |
|-----------|--------------|
| Instance | AWS EC2 g5.2xlarge |
| GPU | NVIDIA A10G (24 GB VRAM) |
| vCPU | 8 |
| RAM | 32 GB |
| Storage | 450 GB NVMe SSD |
| AMI | NVIDIA Deep Learning AMI (Ubuntu 22.04) |
| Estimated Cost | ~$1.00/hour (on-demand); ~$0.35/hour (spot) |

The g5.2xlarge runs all simulation software without modification. Isaac Sim cloud streaming (via NVIDIA CloudXR or browser-based Isaac Sim) can replace local GPU rendering.

### NVIDIA Omniverse Cloud

NVIDIA Omniverse Cloud provides browser-based access to Isaac Sim with no local GPU required. Students log in via an NVIDIA developer account and run Isaac Sim scenes directly in a browser window.

- **Access**: developer.nvidia.com/nvidia-omniverse
- **Requirements**: Chrome or Edge browser, 50 Mbps internet connection
- **Limitations**: Streaming latency makes real-time robot control experiments slightly less responsive than local setups; acceptable for all course assessments.

### ROS 2 on Cloud9 / VS Code Remote

For ROS 2 development without a local Ubuntu installation:

```bash
# Option 1: AWS Cloud9 (Ubuntu 22.04 environment)
# Launch a Cloud9 environment with Ubuntu 22.04, then:
sudo apt update && sudo apt install -y ros-humble-desktop

# Option 2: VS Code Remote SSH into g5.2xlarge
# Install Remote-SSH extension, connect to instance, develop in-browser terminal
```

---

## Hardware Comparison Summary

```
                  Simulation  Isaac ROS  Real Robot  Cost (USD)
────────────────────────────────────────────────────────────────
Tier 1 Workstation    ✓✓✓        ✓✓          ✗         $1,500–$3,000
Tier 2 Edge Kit       ✗          ✓✓✓         ✗         $400–$800
Tier 3 Robot Lab      ✓✓✓        ✓✓✓         ✓✓✓       $16,000+
Tier 4 Cloud          ✓✓✓        ✓✓          ✗         ~$50–$200/month
────────────────────────────────────────────────────────────────
✓✓✓ = Full support  ✓✓ = Good support  ✗ = Not applicable
```

**Recommendation for individual students**: Start with Tier 4 (Cloud-Native) for all course modules. If you plan to pursue Physical AI professionally, invest in a Tier 2 Edge Kit (Jetson Orin NX) for Sim-to-Real hardware experience. The Tier 1 Workstation becomes valuable if you are running Isaac Sim locally with complex scenes.

**Recommendation for university labs**: One Tier 1 workstation per two students for simulation, plus a shared Tier 3 robot for the Sim-to-Real capstone demonstration.
