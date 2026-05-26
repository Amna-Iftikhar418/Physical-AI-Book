---
id: week-11-12-humanoid
title: "Weeks 11–12: Humanoid Robot Design"
sidebar_position: 2
---

# Weeks 11–12: Humanoid Robot Design for Natural Interactions

> **Learning Objectives**
> - **LO5**: Apply forward and inverse kinematics to multi-joint humanoid arms
> - **LO5**: Explain bipedal locomotion, ZMP stability criterion, and whole-body control
> - **LO5**: Design human-robot interaction behaviours using proxemics and social cues

---

## Humanoid Robot Kinematics

### Degrees of Freedom and the Kinematic Chain

A humanoid robot is a collection of rigid links connected by joints. The Unitree G1 has 43 degrees of freedom (DoF):

| Body Part | DoF | Joint Types |
|-----------|-----|-------------|
| Each leg | 6 | Hip (3R) + Knee (1R) + Ankle (2R) |
| Each arm | 7 | Shoulder (3R) + Elbow (1R) + Wrist (3R) |
| Each hand | 7 | Four fingers × 2R, thumb × 3R |
| Torso | 3 | Waist roll, pitch, yaw |
| Head | 2 | Pan, tilt |

**Total**: 2×6 (legs) + 2×7 (arms) + 2×7 (hands) + 3 (torso) + 2 (head) = 45 DoF (42 in practice for the standard G1 configuration).

### Denavit-Hartenberg Notation

The Denavit-Hartenberg (DH) convention provides a systematic way to describe the geometry of a kinematic chain. Each joint frame is defined by four parameters:

| Parameter | Symbol | Description |
|-----------|--------|-------------|
| Joint angle | θᵢ | Rotation about the previous joint's z-axis |
| Link offset | dᵢ | Translation along the previous joint's z-axis |
| Link length | aᵢ | Translation along the current joint's x-axis |
| Link twist | αᵢ | Rotation about the current joint's x-axis |

```python
import numpy as np

def dh_transform(theta: float, d: float, a: float, alpha: float) -> np.ndarray:
    """Compute the 4x4 homogeneous transformation matrix for one DH joint."""
    ct, st = np.cos(theta), np.sin(theta)
    ca, sa = np.cos(alpha), np.sin(alpha)
    return np.array([
        [ct, -st*ca,  st*sa, a*ct],
        [st,  ct*ca, -ct*sa, a*st],
        [0,      sa,     ca,    d],
        [0,       0,      0,    1]
    ])

# DH parameters for a simplified 3-DoF arm (shoulder-elbow-wrist)
# theta: joint angles (variables), d: link offsets, a: link lengths, alpha: twists
DH_PARAMS = [
    # (d,    a,     alpha)
    (0.0,  0.0,  np.pi/2),   # Joint 1: shoulder rotation
    (0.0,  0.35, 0.0),        # Joint 2: shoulder flex, 350mm upper arm
    (0.0,  0.30, 0.0),        # Joint 3: elbow, 300mm forearm
]

def forward_kinematics(joint_angles: list, dh_params: list) -> np.ndarray:
    """Compute end-effector pose from joint angles."""
    T = np.eye(4)
    for theta, (d, a, alpha) in zip(joint_angles, dh_params):
        T = T @ dh_transform(theta, d, a, alpha)
    return T

# Example: arm straight forward, joints at [0, 45°, -90°]
ee_pose = forward_kinematics(
    [0.0, np.pi/4, -np.pi/2],
    DH_PARAMS
)
print(f"End-effector position: {ee_pose[:3, 3]}")
```

### Inverse Kinematics

**Inverse kinematics (IK)** computes joint angles that place the end-effector at a desired position and orientation. For redundant manipulators (≥7 DoF), there are infinitely many solutions; a solver chooses the one that satisfies secondary objectives (e.g., joint limit avoidance, singularity avoidance).

```python
# Using BioIK (Bio-inspired IK) with MoveIt 2
# BioIK is recommended for humanoid arms because it handles redundancy well

import rclpy
from rclpy.node import Node
from moveit_msgs.srv import GetPositionIK
from geometry_msgs.msg import PoseStamped

class IKClient(Node):
    def __init__(self):
        super().__init__('ik_client')
        self.ik_client = self.create_client(GetPositionIK, '/compute_ik')

    def compute_ik(self, target_pose: PoseStamped, group_name: str = 'right_arm'):
        req = GetPositionIK.Request()
        req.ik_request.group_name = group_name
        req.ik_request.pose_stamped = target_pose
        req.ik_request.timeout.sec = 1

        future = self.ik_client.call_async(req)
        rclpy.spin_until_future_complete(self, future)

        if future.result().error_code.val == 1:  # SUCCESS
            return future.result().solution.joint_state
        return None  # IK failed
```

---

## Dynamics and Balance Control

### Centre of Mass

The **centre of mass (CoM)** of a multi-link robot is the mass-weighted average of all link centres:

```
CoM = Σᵢ (mᵢ × pᵢ) / Σᵢ mᵢ
```

where mᵢ is the mass and pᵢ is the 3D position of link i. For the Unitree G1 (~35 kg), the CoM is approximately at the pelvis level when standing upright.

A robot is statically stable when its CoM projected onto the ground falls within its **support polygon** — the convex hull of its contact points with the floor.

### Zero-Moment Point (ZMP) Criterion

For dynamic locomotion (walking), static stability is too conservative. The **Zero-Moment Point** is the point on the ground where the net moment of all forces (gravity + inertia) is zero. A bipedal robot remains stable as long as the ZMP lies within the support polygon.

```python
def compute_zmp(com_pos: np.ndarray, com_acc: np.ndarray, mass: float,
                g: float = 9.81) -> np.ndarray:
    """
    Compute ZMP from CoM position and acceleration.
    Assumes flat ground (z = 0).
    """
    # ZMP formula (Kajita et al.)
    # x_zmp = x_com - (z_com / (g + z_ddot)) * x_ddot
    z = com_pos[2]
    z_ddot = com_acc[2]
    x_zmp = com_pos[0] - (z / (g + z_ddot)) * com_acc[0]
    y_zmp = com_pos[1] - (z / (g + z_ddot)) * com_acc[1]
    return np.array([x_zmp, y_zmp, 0.0])
```

### Whole-Body Control

Modern humanoid controllers use **Whole-Body Control (WBC)** frameworks that simultaneously:
- Track a desired body motion (walking, reaching)
- Maintain balance (ZMP within support polygon)
- Respect joint torque limits
- Coordinate all 43 DoF as a unified system

WBC formulates robot control as a constrained quadratic program (QP) solved at 500–1000 Hz. The open-source **OCS2** framework is the standard implementation for humanoid WBC on ROS 2.

---

## Bipedal Locomotion

### Gait Generation

A **gait** defines the pattern of foot contacts over time. For bipedal walking:

```
Time →
Left foot:   ████ ──── ████ ──── ████
Right foot:  ──── ████ ──── ████ ────
              ^    ^    ^    ^    ^
             LH   RH   LH   RH   LH  (H=Heel strike)

████ = Stance (foot on ground)
──── = Swing (foot in air)
```

A simple periodic gait can be parameterised by:
- **Step length** (m): distance between successive heel strikes
- **Step frequency** (Hz): steps per second; Unitree G1 nominal: 1.0–2.0 Hz
- **Step height** (m): peak height of the swing foot; nominal 0.05–0.10 m

### Stair Climbing

Stair climbing requires perception feedback to adjust step height. The algorithm:

1. Detect stair edge using depth camera → estimate riser height (h) and tread depth (d)
2. Adjust swing foot trajectory: increase step height to h + 0.02m (safety margin)
3. Increase step length to d - 0.05m (to land on stair, not on edge)
4. Reduce walking speed by 50%
5. After foot contact, verify force-torque sensor confirms stable contact before shifting weight

---

## Manipulation and Grasping

### Grasp Planning

A **grasp** is defined by the 6-DoF pose of the hand relative to the object's frame:

```python
from dataclasses import dataclass
from geometry_msgs.msg import Pose

@dataclass
class GraspCandidate:
    pose: Pose          # Hand pose in object frame
    quality: float      # Grasp quality score [0, 1]
    approach_dir: list  # Unit vector for approach direction

def plan_top_grasp(object_bbox: dict) -> GraspCandidate:
    """Plan a top-down grasp for a box-shaped object."""
    import tf_transformations
    pose = Pose()
    # Position: above the object centre
    pose.position.x = object_bbox['cx']
    pose.position.y = object_bbox['cy']
    pose.position.z = object_bbox['z_max'] + 0.05  # 5cm above top face
    # Orientation: hand pointing down (palm faces -Z world)
    q = tf_transformations.quaternion_from_euler(np.pi, 0, 0)
    pose.orientation.x, pose.orientation.y, pose.orientation.z, pose.orientation.w = q
    return GraspCandidate(pose=pose, quality=0.8, approach_dir=[0, 0, -1])
```

### Force-Torque Control for Compliant Grasping

A rigid position controller crushes delicate objects. Compliant control uses force feedback:

```python
class CompliantGraspController(Node):
    def __init__(self):
        super().__init__('compliant_grasp')
        self.ft_sub = self.create_subscription(
            WrenchStamped, '/wrist_ft', self.ft_callback, 10
        )
        self.gripper_pub = self.create_publisher(
            Float64, '/gripper_position_cmd', 10
        )
        self.current_force = 0.0
        self.target_force = 3.0   # Newtons: firm enough to hold, gentle enough not to crush

    def ft_callback(self, msg: WrenchStamped):
        self.current_force = abs(msg.wrench.force.z)

    def close_to_contact(self):
        cmd = Float64()
        # Close gripper until contact force reaches target
        while self.current_force < self.target_force:
            cmd.data -= 0.001  # Close by 1mm
            self.gripper_pub.publish(cmd)
            rclpy.spin_once(self, timeout_sec=0.01)
        self.get_logger().info(f'Grasp contact at force: {self.current_force:.2f}N')
```

---

## Human-Robot Interaction Design

### Proxemics

**Proxemics** is the study of personal space in human interactions. Robots operating near humans must respect these zones to avoid making people uncomfortable:

```
Intimate zone:    0 – 0.46m   (avoid entering — humans feel threatened)
Personal zone:    0.46 – 1.2m (allowed only when assisting at human request)
Social zone:      1.2 – 3.6m  (appropriate for most robot-human interactions)
Public zone:      3.6m+       (robot approaching humans from a distance)
```

The Unitree G1's social navigation policy should:
- Maintain ≥1.2m distance from any detected human during autonomous navigation
- Request permission (audible signal) before entering the personal zone for a handover task
- Move slowly (≤0.3 m/s) when within 1.5m of a human

### Non-Verbal Communication

Robots can communicate intent and state through non-verbal signals:
- **LED indicators**: colour-coded status (blue = idle, green = executing, yellow = attention needed, red = error)
- **Head orientation**: turning the head toward the human during speech, toward the task object during manipulation
- **Approach trajectory**: a gentle curving approach path instead of a direct line reduces perceived threat
- **Speed modulation**: slowing down when approaching a human signals deference and awareness

### Gesture Recognition

The ReSpeaker microphone array provides speaker localisation (direction-of-arrival estimation), allowing the robot to face the person speaking. For gesture recognition, the RealSense D435i skeleton tracking (via OpenPose or MediaPipe) provides 3D body keypoints:

```python
from mediapipe.tasks.python import vision as mp_vision

class GestureRecognizer(Node):
    def __init__(self):
        super().__init__('gesture_recognizer')
        # MediaPipe Pose Landmarker
        options = mp_vision.PoseLandmarkerOptions(
            base_options=BaseOptions(model_asset_path='pose_landmarker.task'),
            running_mode=VisionRunningMode.VIDEO
        )
        self.detector = mp_vision.PoseLandmarker.create_from_options(options)

    def detect_wave(self, landmarks) -> bool:
        """Detect a wave gesture: right wrist above right shoulder."""
        right_wrist = landmarks[mp_vision.PoseLandmark.RIGHT_WRIST]
        right_shoulder = landmarks[mp_vision.PoseLandmark.RIGHT_SHOULDER]
        return right_wrist.y < right_shoulder.y  # In image coords, y increases downward
```

---

## Weeks 11–12 Summary

After completing the humanoid design section, you should be able to:

- ✅ Compute forward kinematics for a 3-DoF arm using DH transforms
- ✅ Request IK solutions via MoveIt 2 and handle failure cases
- ✅ Implement the ZMP criterion to evaluate bipedal stability
- ✅ Describe the support polygon and how it constrains dynamic locomotion
- ✅ Plan a top-down grasp pose and execute with force-torque feedback
- ✅ Apply proxemics principles to define safe operating distances for a humanoid robot

Next: [Week 13: Conversational Robotics](/module-4-vla/week-13-conversational)
