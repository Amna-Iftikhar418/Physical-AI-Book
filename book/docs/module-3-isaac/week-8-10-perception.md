---
id: week-8-10-perception
title: "Weeks 8–10: AI-Powered Perception with Isaac ROS"
sidebar_position: 3
---

# Weeks 8–10: AI-Powered Perception with Isaac ROS

> **Learning Objectives**
> - **LO4**: Set up and run `isaac_ros_visual_slam` for real-time VSLAM on Jetson
> - **LO4**: Deploy `isaac_ros_object_detection` with a model trained on synthetic data
> - **LO4**: Configure Nav2 for bipedal humanoid path planning

---

## Isaac ROS Architecture

Isaac ROS is a collection of hardware-accelerated ROS 2 packages (called **GEMs** — GPU-Enhanced Modules) that run on NVIDIA hardware with CUDA acceleration. The key packages for this course are:

```
Isaac ROS
├── isaac_ros_visual_slam      — Real-time Visual SLAM (mapping + localisation)
├── isaac_ros_image_proc       — Stereo/depth image processing (GPU-accelerated)
├── isaac_ros_object_detection — YOLO/RT-DETR object detection on CUDA
├── isaac_ros_dnn_inference    — General CUDA-accelerated TensorRT inference
├── isaac_ros_common            — Shared utilities, NITROS transport
└── isaac_ros_nvblox           — 3D occupancy mapping with neural fields
```

The **NITROS (NVIDIA Isaac Transport for ROS)** layer is what makes Isaac ROS fast. Standard ROS 2 message transport serialises and deserialises messages in CPU memory. NITROS keeps messages in GPU memory between consecutive GPU-accelerated nodes, eliminating unnecessary GPU→CPU→GPU transfers.

---

## Setting Up Isaac ROS on Jetson Orin

### Installing JetPack and Isaac ROS

```bash
# JetPack 6.x must be installed first
# Check your JetPack version:
dpkg -l | grep -i jetpack

# Add Isaac ROS apt repository
sudo apt install curl gnupg2 lsb-release
curl -sSL https://isaac.download.nvidia.com/apt/isaac-ros.key \
  | sudo gpg --dearmor -o /usr/share/keyrings/isaac-ros.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/isaac-ros.gpg] \
  https://isaac.download.nvidia.com/apt/ $(lsb_release -cs) main" \
  | sudo tee /etc/apt/sources.list.d/isaac-ros.list

# Install Visual SLAM
sudo apt update
sudo apt install ros-humble-isaac-ros-visual-slam

# Install object detection
sudo apt install ros-humble-isaac-ros-object-detection
```

---

## Visual SLAM with `isaac_ros_visual_slam`

Visual SLAM (Simultaneous Localisation and Mapping) uses camera images to build a 3D map of the environment and simultaneously estimate the robot's position within that map. Isaac ROS Visual SLAM uses stereo cameras and runs entirely on GPU.

### How Isaac ROS Visual SLAM Works

1. **Feature extraction**: CUDA-accelerated ORB feature detector extracts keypoints from stereo images at 60+ fps
2. **Stereo matching**: disparity computation from stereo pairs → depth estimation
3. **Pose graph optimisation**: a factor graph maintains consistency between poses over time
4. **Loop closure**: when the robot returns to a previously visited location, the map is corrected

### Launching Visual SLAM

```bash
# With Intel RealSense D435i (stereo RGB-D)
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam_realsense.launch.py

# Published topics:
#   /visual_slam/tracking/odometry     — nav_msgs/Odometry (robot pose)
#   /visual_slam/tracking/slam_path    — nav_msgs/Path (trajectory)
#   /visual_slam/map_with_observations — sparse point cloud map
```

### Integrating VSLAM Output with Nav2

```python
# VSLAM publishes odometry to /visual_slam/tracking/odometry
# Nav2 expects odometry on /odom
# Bridge them with a topic remapping in the launch file

from launch_ros.actions import Node

vslam_node = Node(
    package='isaac_ros_visual_slam',
    executable='visual_slam_node',
    remappings=[
        ('visual_slam/tracking/odometry', '/odom'),
    ]
)
```

---

## Object Detection with `isaac_ros_object_detection`

Isaac ROS Object Detection provides GPU-accelerated inference for real-time object detection. It supports YOLO variants and RT-DETR, compiled to TensorRT for maximum Jetson performance.

### Training a Custom Model on Synthetic Data

The workflow for training on Isaac Sim synthetic data:

```python
# Step 1: Convert Replicator output to COCO format
import json
import os
from pathlib import Path

def convert_to_coco(replicator_output_dir: str, output_json: str):
    images = []
    annotations = []
    categories = [{"id": 1, "name": "target_object"}]
    ann_id = 0

    for i, img_file in enumerate(sorted(Path(replicator_output_dir, 'rgb').glob('*.jpg'))):
        images.append({"id": i, "file_name": str(img_file), "width": 640, "height": 480})

        # Load corresponding bbox annotation
        bbox_file = Path(replicator_output_dir, 'bounding_box_2d_tight',
                         img_file.stem + '.json')
        with open(bbox_file) as f:
            bboxes = json.load(f)

        for bbox in bboxes:
            if bbox['semanticLabel'] == 'target_object':
                x1, y1, x2, y2 = bbox['x_min'], bbox['y_min'], bbox['x_max'], bbox['y_max']
                annotations.append({
                    "id": ann_id, "image_id": i, "category_id": 1,
                    "bbox": [x1, y1, x2 - x1, y2 - y1],
                    "area": (x2 - x1) * (y2 - y1),
                    "iscrowd": 0
                })
                ann_id += 1

    coco = {"images": images, "annotations": annotations, "categories": categories}
    with open(output_json, 'w') as f:
        json.dump(coco, f)

convert_to_coco('/data/synthetic_dataset', '/data/coco_annotations.json')
```

### Exporting to TensorRT for Jetson

```bash
# Convert PyTorch YOLO model to TensorRT engine for Jetson
trtexec \
  --onnx=yolo_custom.onnx \
  --saveEngine=yolo_custom_fp16.engine \
  --fp16 \
  --inputIOFormats=fp16:chw \
  --outputIOFormats=fp16:chw
```

### Launching Object Detection

```bash
ros2 launch isaac_ros_object_detection isaac_ros_yolov8.launch.py \
  model_file_path:=/models/yolo_custom_fp16.engine \
  input_binding_names:='["images"]' \
  output_binding_names:='["output0"]' \
  network_image_width:=640 \
  network_image_height:=640
```

The detection output is published as `isaac_ros_tensor_list_interfaces/TensorList` and processed by a post-processing node that publishes `vision_msgs/Detection2DArray`.

---

## Nav2: Path Planning for Humanoid Movement

**Nav2** (Navigation2) is the ROS 2 navigation stack. It provides:
- **Costmap 2D**: a 2D occupancy grid built from LiDAR and depth data
- **Planner Server**: global path planner (Navfn, Smac) from start to goal
- **Controller Server**: local trajectory following (DWB, RPP)
- **Behaviour Tree Navigator**: composable behaviours for recovery, replanning, and goal handling

### Nav2 for Bipedal Humanoids

Standard Nav2 is designed for differential-drive mobile robots. Adapting it for bipedal humanoids requires:

1. **Footprint configuration**: a bipedal robot's footprint changes during walking (stance vs. swing phase). Use an inflated circular footprint to account for worst-case foot placement.

2. **Costmap inflation**: inflate obstacles by the robot's stride width (typically 0.3–0.5m for Unitree G1) to prevent collisions during the swing phase.

3. **Velocity limits**: bipedal robots have lower maximum velocities and turning rates than wheeled robots.

```yaml
# nav2_params.yaml — key parameters for bipedal humanoid
local_costmap:
  local_costmap:
    ros__parameters:
      robot_radius: 0.35        # Half shoulder width + safety margin
      inflation_radius: 0.55    # Larger than wheeled robot
      obstacle_max_range: 3.5
      
controller_server:
  ros__parameters:
    FollowPath:
      plugin: "nav2_regulated_pure_pursuit_controller::RegulatedPurePursuitController"
      desired_linear_vel: 0.5        # m/s — walking speed
      max_linear_accel: 0.5          # m/s²
      max_lateral_accel: 0.2         # lateral stability limit
      max_angular_accel: 1.2
      max_robot_pose_search_dist: 10.0
```

### Launching Nav2

```python
# launch/navigation.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory
import os

def generate_launch_description():
    nav2_params = os.path.join(
        get_package_share_directory('my_robot_pkg'),
        'config', 'nav2_params.yaml'
    )

    return LaunchDescription([
        Node(
            package='nav2_bringup',
            executable='bringup_launch.py',
            parameters=[nav2_params],
            output='screen'
        )
    ])
```

### Sending Navigation Goals

```python
from nav2_msgs.action import NavigateToPose
from rclpy.action import ActionClient
from geometry_msgs.msg import PoseStamped

class NavigationClient(Node):
    def __init__(self):
        super().__init__('navigation_client')
        self._action_client = ActionClient(self, NavigateToPose, 'navigate_to_pose')

    def navigate_to(self, x: float, y: float, yaw: float = 0.0):
        goal = NavigateToPose.Goal()
        goal.pose = PoseStamped()
        goal.pose.header.frame_id = 'map'
        goal.pose.header.stamp = self.get_clock().now().to_msg()
        goal.pose.pose.position.x = x
        goal.pose.pose.position.y = y
        # Convert yaw to quaternion
        import math
        goal.pose.pose.orientation.z = math.sin(yaw / 2.0)
        goal.pose.pose.orientation.w = math.cos(yaw / 2.0)

        self._action_client.wait_for_server()
        future = self._action_client.send_goal_async(
            goal,
            feedback_callback=self.feedback_callback
        )
        return future

    def feedback_callback(self, feedback_msg):
        dist = feedback_msg.feedback.distance_remaining
        self.get_logger().info(f'Distance remaining: {dist:.2f}m')
```

---

## AI Manipulation Pipeline

For pick-and-place tasks, Isaac ROS provides a complete manipulation pipeline:

```
Camera → isaac_ros_image_proc → isaac_ros_object_detection
                                        │
                                   Detection2DArray
                                        │
                               Grasp Planning Node
                               (MoveIt2 / BioIK)
                                        │
                               Joint Trajectory
                                        │
                               Joint Trajectory Controller
                                        │
                                 Robot Arm Moves
```

The grasp planning step uses the detected bounding box to estimate a grasp pose (position + orientation) that the robot arm can reach. **BioIK** (Bio-inspired Inverse Kinematics) is recommended for humanoid arms because it handles redundant DOF better than analytical IK solvers.

---

## Week 9 Summary

After completing the Isaac ROS perception section, you should be able to:

- ✅ Install Isaac ROS on Jetson Orin NX with JetPack 6
- ✅ Launch VSLAM and verify it produces a coherent odometry estimate and point cloud map
- ✅ Deploy a TensorRT-compiled YOLO model via `isaac_ros_object_detection`
- ✅ Configure Nav2 with humanoid-appropriate footprint and velocity parameters
- ✅ Send navigation goals programmatically and handle feedback

Next: [Week 8–10: Sim-to-Real Transfer](/module-3-isaac/week-8-10-sim-to-real)
