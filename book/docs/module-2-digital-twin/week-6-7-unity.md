---
id: week-6-7-unity
title: "Weeks 6–7: Unity Simulation"
sidebar_position: 3
---

# Weeks 6–7: Unity for Robot Simulation

> **Learning Objectives**
> - **LO3**: Set up Unity with the Robotics Hub packages for ROS 2 integration
> - **LO3**: Import a robot URDF into Unity and configure articulation bodies
> - **LO3**: Exchange ROS 2 messages between Unity and a running ROS 2 system

---

## Why Unity Alongside Gazebo?

Gazebo excels at physics accuracy: joint dynamics, sensor noise models, and contact forces are precisely tuned. But Gazebo's rendering has historically been limited — textures are flat, lighting is basic, and the visual gap between simulation and reality makes training vision models difficult.

**Unity** fills this gap with its physically-based rendering (PBR) pipeline:
- **High-fidelity visuals**: realistic materials, dynamic shadows, reflections, ambient occlusion
- **Photorealistic image generation**: camera images indistinguishable from real photos for training object detection models
- **Human simulation**: Unity's NavMesh Agents can simulate crowds of realistic human characters, enabling HRI (Human-Robot Interaction) scenario testing that Gazebo cannot provide
- **Cross-platform**: runs on Windows, macOS, and Linux; supports GPU-accelerated rendering on NVIDIA hardware

The typical workflow is:
1. **Develop and test control logic in Gazebo** — physics accuracy matters for PID tuning and collision avoidance.
2. **Generate visual training data in Unity** — photorealistic rendering matters for training perception models.
3. **Test HRI scenarios in Unity** — human simulation matters for social navigation and interaction design.

---

## Unity Robotics Hub: Package Overview

The [Unity Robotics Hub](https://github.com/Unity-Technologies/Unity-Robotics-Hub) provides two key packages:

| Package | Purpose |
|---------|---------|
| `com.unity.robotics.urdf-importer` | Import URDF files into Unity scenes |
| `com.unity.robotics.ros-tcp-connector` | Publish/subscribe to ROS 2 topics from Unity |

And one ROS 2 package:

| Package | Purpose |
|---------|---------|
| `ros_tcp_endpoint` | ROS 2 node that creates a TCP server for Unity connections |

### Installing Unity

Download Unity Hub from unity.com. Install **Unity 2022.3 LTS** (the version tested with ROS 2 Humble). During installation, include:
- Linux Build Support (if cross-building for Jetson)
- Visual Studio or VSCode integration

### Adding the Robotics Hub Packages

In the Unity Editor:
1. Open **Window → Package Manager**
2. Click the **+** button → **Add package from git URL**
3. Add: `https://github.com/Unity-Technologies/ROS-TCP-Connector.git?path=/com.unity.robotics.ros-tcp-connector`
4. Add: `https://github.com/Unity-Technologies/URDF-Importer.git?path=/com.unity.robotics.urdf-importer`

---

## Importing a URDF Robot

### Step 1: Prepare the URDF

Unity's URDF importer expects the URDF and all mesh files in a structured directory:

```
Assets/
└── Robots/
    └── my_robot/
        ├── urdf/
        │   └── my_robot.urdf
        └── meshes/
            ├── base_link.dae
            ├── link_1.dae
            └── link_2.dae
```

If your URDF uses `package://` paths (standard in ROS 2), convert them to relative paths first:
```bash
# Example: replace package://my_robot_pkg/meshes/ with meshes/
sed -i 's|package://my_robot_pkg/meshes/|../meshes/|g' my_robot.urdf
```

### Step 2: Import via URDF Importer

1. In the Unity Editor, click **Robotics → Import Robot from URDF**
2. Select your `.urdf` file
3. Set **Mesh Decomposition**: `VHACD` for convex decomposition (better physics performance)
4. Click **Import URDF**

Unity creates a hierarchy of GameObjects matching the URDF link structure, each with:
- A **MeshRenderer** for visual geometry
- A **MeshCollider** for physics collision
- An **ArticulationBody** for joint physics

### Understanding ArticulationBody

Unity's `ArticulationBody` component implements stable joint physics for robot simulation. Unlike Unity's older `Rigidbody + Joint` approach, ArticulationBodies form a single articulation tree that is solved as a unified system, dramatically reducing joint instability (the "jitter" problem).

```csharp
using UnityEngine;
using Unity.Robotics.UrdfImporter;

public class JointController : MonoBehaviour
{
    private ArticulationBody joint1;
    private ArticulationBody joint2;

    void Start()
    {
        // Find articulation bodies by link name
        joint1 = transform.Find("base_link/link_1").GetComponent<ArticulationBody>();
        joint2 = transform.Find("base_link/link_1/link_2").GetComponent<ArticulationBody>();
    }

    public void SetJointAngle(ArticulationBody joint, float angleRadians)
    {
        var drive = joint.xDrive;
        drive.target = angleRadians * Mathf.Rad2Deg;
        joint.xDrive = drive;
    }
}
```

---

## ROS–Unity Bridge: Two-Way Communication

The bridge consists of:
1. A **ROS 2 node** (`ros_tcp_endpoint`) that opens a TCP server on port 10000
2. **Unity scripts** that connect to that TCP server and publish/subscribe using ROS message types

### Step 1: Install ros_tcp_endpoint (ROS 2 side)

```bash
cd ~/ros2_ws/src
git clone https://github.com/Unity-Technologies/ROS-TCP-Endpoint.git --branch ROS2v0.7.0
cd ~/ros2_ws
colcon build --packages-select ros_tcp_endpoint
source install/setup.bash
```

### Step 2: Launch the ROS TCP Endpoint

```bash
# Start the TCP server on port 10000
ros2 run ros_tcp_endpoint default_server_endpoint \
  --ros-args -p ROS_IP:=0.0.0.0 -p ROS_TCP_PORT:=10000
```

### Step 3: Configure Unity ROS Settings

In the Unity Editor:
1. Click **Robotics → ROS Settings**
2. Set **ROS IP Address** to `127.0.0.1` (or your ROS 2 machine's IP for network setups)
3. Set **ROS Port** to `10000`

### Step 4: Publish from Unity

```csharp
using RosMessageTypes.Geometry;
using Unity.Robotics.ROSTCPConnector;

public class RobotStatePublisher : MonoBehaviour
{
    ROSConnection ros;
    string topicName = "/unity/robot_pose";

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<PoseMsg>(topicName);
    }

    void Update()
    {
        var pose = new PoseMsg
        {
            position = new PointMsg(
                transform.position.x,
                transform.position.z,   // Unity Z = ROS Y
                transform.position.y    // Unity Y = ROS Z
            ),
            orientation = new QuaternionMsg(
                transform.rotation.x,
                transform.rotation.z,
                transform.rotation.y,
                transform.rotation.w
            )
        };
        ros.Publish(topicName, pose);
    }
}
```

**Coordinate system note**: Unity uses a left-handed Y-up coordinate system. ROS 2 uses right-handed Z-up. The convention is: Unity X → ROS X, Unity Z → ROS Y, Unity Y → ROS Z.

### Step 5: Subscribe in Unity

```csharp
using RosMessageTypes.Geometry;
using Unity.Robotics.ROSTCPConnector;

public class CmdVelSubscriber : MonoBehaviour
{
    ROSConnection ros;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.Subscribe<TwistMsg>("/cmd_vel", OnCmdVel);
    }

    void OnCmdVel(TwistMsg msg)
    {
        float linear_x = (float)msg.linear.x;
        float angular_z = (float)msg.angular.z;
        // Apply to robot's ArticulationBody joints
        MoveRobot(linear_x, angular_z);
    }
}
```

---

## Simulating Human-Robot Interaction

Unity's **NavMesh** system can simulate autonomous human characters navigating the environment. Combined with the ROS bridge, this enables testing social robot behaviours.

```csharp
using UnityEngine;
using UnityEngine.AI;

public class SimulatedHuman : MonoBehaviour
{
    NavMeshAgent agent;
    public Transform[] waypoints;
    int currentWaypoint = 0;

    void Start()
    {
        agent = GetComponent<NavMeshAgent>();
        agent.SetDestination(waypoints[0].position);
    }

    void Update()
    {
        if (!agent.pathPending && agent.remainingDistance < 0.3f)
        {
            currentWaypoint = (currentWaypoint + 1) % waypoints.Length;
            agent.SetDestination(waypoints[currentWaypoint].position);
        }
    }
}
```

A ROS 2 Python node can subscribe to the simulated human's position (published from Unity) and implement a **social navigation** policy — for example, the robot stops moving when a human is within 1.2 metres (personal space):

```python
from geometry_msgs.msg import PoseStamped, Twist

class SocialNavigationNode(Node):
    def __init__(self):
        super().__init__('social_navigation')
        self.human_pose = None
        self.create_subscription(PoseStamped, '/unity/human_pose',
                                 self.human_callback, 10)
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)

    def human_callback(self, msg: PoseStamped):
        self.human_pose = msg

    def compute_velocity(self, robot_pos):
        if self.human_pose is None:
            return Twist()
        dx = self.human_pose.pose.position.x - robot_pos.x
        dy = self.human_pose.pose.position.y - robot_pos.y
        dist = (dx**2 + dy**2)**0.5
        cmd = Twist()
        if dist > 1.2:  # Safe distance: keep moving
            cmd.linear.x = 0.3
        # else: stop — human is within personal space
        return cmd
```

---

## Summary: Gazebo vs Unity Decision Guide

| Use Case | Use Gazebo | Use Unity |
|----------|------------|-----------|
| PID controller tuning | ✅ | |
| Physics-accurate collision testing | ✅ | |
| Sensor noise modelling | ✅ | |
| Generating photorealistic training images | | ✅ |
| Human-robot interaction testing | | ✅ |
| Visual debugging with realistic materials | | ✅ |
| Cross-platform deployment | | ✅ |

In production workflows, both simulators are used: Gazebo for development and control validation, Unity for data generation and HRI testing.
