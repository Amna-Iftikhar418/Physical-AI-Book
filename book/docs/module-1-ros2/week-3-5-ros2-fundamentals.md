---
id: week-3-5-ros2-fundamentals
title: "Weeks 3–5: ROS 2 Fundamentals"
sidebar_position: 3
---

# Weeks 3–5: ROS 2 Fundamentals

> **Learning Objectives**
> - **LO2**: Understand the ROS 2 DDS communication architecture and node lifecycle
> - **LO2**: Write publisher and subscriber nodes in Python using `rclpy`
> - **LO2**: Implement services and actions for synchronous and asynchronous robot control

---

## ROS 2 Architecture: DDS Under the Hood

ROS 2's most important architectural difference from ROS 1 is the communication layer. ROS 1 used a centralised master node (`roscore`) that all nodes registered with. If the master crashed, the entire system stopped. ROS 2 replaced this with **DDS (Data Distribution Service)**, a publish-subscribe middleware standard.

DDS is a peer-to-peer protocol. When a ROS 2 node starts, it advertises itself via DDS discovery multicast packets. Other nodes on the same network hear the advertisement and establish direct connections — no master required. The result is a fault-tolerant, distributed system that can scale from a single laptop to dozens of robots on the same network.

```
ROS 1 (Centralised):          ROS 2 (Distributed):

roscore ──── Node A            Node A
   │    ──── Node B              │  ↔ DDS ↔  │
   │    ──── Node C            Node B      Node C
   │
 Single point of failure     No single point of failure
```

### Quality of Service (QoS)

DDS supports configurable Quality of Service (QoS) profiles for each topic. The key QoS axes are:

| QoS Axis | Sensor Data | Commands | Parameters |
|----------|------------|----------|------------|
| Reliability | BEST_EFFORT | RELIABLE | RELIABLE |
| Durability | VOLATILE | VOLATILE | TRANSIENT_LOCAL |
| History | KEEP_LAST(10) | KEEP_LAST(1) | KEEP_LAST(1) |

**BEST_EFFORT** means messages may be dropped if the subscriber is slow — acceptable for high-frequency sensor data where only the latest sample matters. **RELIABLE** means every message is delivered and acknowledged — required for commands that must not be lost.

```python
from rclpy.qos import QoSProfile, QoSReliabilityPolicy, QoSHistoryPolicy

sensor_qos = QoSProfile(
    reliability=QoSReliabilityPolicy.BEST_EFFORT,
    history=QoSHistoryPolicy.KEEP_LAST,
    depth=10
)
```

---

## Nodes: The Building Blocks of ROS 2

A **node** is a process that participates in the ROS 2 graph. Every node:

- Has a unique name within its namespace
- Can publish to and subscribe from topics
- Can offer and call services
- Can host and call actions
- Declares parameters with defaults

### Your First Node

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class HelloNode(Node):
    def __init__(self):
        super().__init__('hello_node')
        # Create a publisher on topic /chatter with queue depth 10
        self.publisher_ = self.create_publisher(String, 'chatter', 10)
        # Create a timer: call self.timer_callback every 1.0 seconds
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.count = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello, Physical AI! Count: {self.count}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.count += 1

def main(args=None):
    rclpy.init(args=args)
    node = HelloNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Key points**:
- `super().__init__('hello_node')` registers the node with DDS under the name `hello_node`.
- `create_publisher(String, 'chatter', 10)` creates a publisher. The `10` is the QoS history depth.
- `create_timer(1.0, callback)` creates a wall-clock timer that fires every 1.0 seconds.
- `rclpy.spin(node)` starts the event loop. The node runs until `Ctrl+C` or `rclpy.shutdown()`.

---

## Topics: Publish-Subscribe Communication

Topics are the primary mechanism for continuous data streams in ROS 2. A topic has a name (e.g., `/camera/image_raw`) and a message type (e.g., `sensor_msgs/Image`). Publishers push messages; subscribers receive them.

### Writing a Subscriber

```python
from rclpy.node import Node
from std_msgs.msg import String

class ListenerNode(Node):
    def __init__(self):
        super().__init__('listener_node')
        # Subscribe to /chatter; call self.listener_callback on each message
        self.subscription = self.create_subscription(
            String,
            'chatter',
            self.listener_callback,
            10  # QoS depth
        )

    def listener_callback(self, msg: String):
        self.get_logger().info(f'Received: "{msg.data}"')
```

### Common ROS 2 Message Types

| Message Type | Package | Use Case |
|-------------|---------|----------|
| `std_msgs/String` | std_msgs | Simple text |
| `std_msgs/Float64` | std_msgs | Single floating-point value |
| `geometry_msgs/Twist` | geometry_msgs | Linear + angular velocity (cmd_vel) |
| `geometry_msgs/PoseStamped` | geometry_msgs | 6-DoF pose with timestamp |
| `sensor_msgs/Image` | sensor_msgs | Camera image |
| `sensor_msgs/LaserScan` | sensor_msgs | 2D LiDAR scan |
| `sensor_msgs/Imu` | sensor_msgs | IMU accelerations and angular velocity |
| `nav_msgs/Odometry` | nav_msgs | Robot pose + velocity estimate |

### Inspecting Topics with CLI Tools

```bash
# List all active topics
ros2 topic list

# Print messages from a topic in real time
ros2 topic echo /chatter

# Check the message type and publisher/subscriber counts
ros2 topic info /chatter --verbose

# Measure topic frequency
ros2 topic hz /camera/image_raw

# Publish a single message from the command line (useful for testing)
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist \
  "{ linear: { x: 0.5 }, angular: { z: 0.0 } }" --once
```

---

## Services: Synchronous Request-Response

Services implement a request-response pattern: a service client sends a request, the service server processes it, and returns a response. Services are blocking — the client waits for the response before continuing.

### Writing a Service Server

```python
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AddTwoIntsServer(Node):
    def __init__(self):
        super().__init__('add_two_ints_server')
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_two_ints_callback
        )

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(
            f'Incoming: {request.a} + {request.b} = {response.sum}'
        )
        return response
```

### Writing a Service Client

```python
import sys
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AddTwoIntsClient(Node):
    def __init__(self):
        super().__init__('add_two_ints_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting...')

    def send_request(self, a, b):
        req = AddTwoInts.Request()
        req.a = a
        req.b = b
        future = self.cli.call_async(req)
        return future
```

**When to use services**: battery level queries, taking a snapshot, resetting a counter, requesting the current map from a SLAM node.

**When NOT to use services**: continuous sensor data (use topics), long-running operations like navigation (use actions).

---

## Actions: Long-Running Tasks with Feedback

Actions are designed for tasks that:
1. Take more than a few milliseconds to complete
2. Should provide progress feedback to the caller
3. May need to be cancelled

The canonical example is robot navigation: "navigate to (x=3.0, y=2.0)". This takes seconds, should report distance-to-goal as feedback, and should be cancellable if the robot needs to stop.

### Action Interface Definition

```
# NavigateToPose.action (nav2_msgs)
geometry_msgs/PoseStamped goal
---
nav2_msgs/NavigationResult result
---
geometry_msgs/PoseStamped current_pose
float32 distance_remaining
```

An action definition has three sections separated by `---`:
1. **Goal**: what the client sends to start the action
2. **Result**: what the server returns when the action completes
3. **Feedback**: what the server sends periodically during execution

### Writing an Action Server

```python
import rclpy
from rclpy.action import ActionServer
from rclpy.node import Node
from action_tutorials_interfaces.action import Fibonacci

class FibonacciActionServer(Node):
    def __init__(self):
        super().__init__('fibonacci_action_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            self.execute_callback
        )

    async def execute_callback(self, goal_handle):
        self.get_logger().info('Executing Fibonacci goal...')
        feedback = Fibonacci.Feedback()
        sequence = [0, 1]

        for i in range(1, goal_handle.request.order):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                return Fibonacci.Result()
            sequence.append(sequence[-2] + sequence[-1])
            feedback.partial_sequence = sequence
            goal_handle.publish_feedback(feedback)

        goal_handle.succeed()
        result = Fibonacci.Result()
        result.sequence = sequence
        return result
```

### Calling an Action with the CLI

```bash
# Send a Fibonacci goal requesting order=10
ros2 action send_goal /fibonacci action_tutorials_interfaces/action/Fibonacci \
  "{ order: 10 }" --feedback
```

---

## The ROS 2 Graph in Practice

Use these CLI commands to inspect a running ROS 2 system:

```bash
# Visualise the entire node graph
ros2 run rqt_graph rqt_graph

# List all nodes
ros2 node list

# Inspect a specific node (topics it publishes/subscribes, services, actions)
ros2 node info /hello_node

# Check service types
ros2 service list --show-types

# Check action types
ros2 action list --show-types
```

---

## Week 3–5 Summary

After completing the fundamentals section, you should be able to:

- ✅ Explain DDS peer-to-peer discovery vs. ROS 1 centralised master
- ✅ Configure QoS profiles appropriately for sensor vs. command topics
- ✅ Write a Python node with publishers, subscribers, timers, and loggers
- ✅ Implement a service server and client for synchronous queries
- ✅ Implement an action server and client with feedback and cancellation
- ✅ Use `ros2 topic`, `ros2 node`, `ros2 service`, and `ros2 action` CLI tools to inspect a live system

Next: [Week 3–5: ROS 2 Advanced](/module-1-ros2/week-3-5-ros2-advanced)
