---
id: week-8-10-sim-to-real
title: "Weeks 8–10: Sim-to-Real Transfer"
sidebar_position: 4
---

# Weeks 8–10: Sim-to-Real Transfer

> **Learning Objectives**
> - **LO4**: Identify the sources of the simulation-to-reality gap for robot policies
> - **LO4**: Apply domain randomisation and curriculum learning to narrow the reality gap
> - **LO4**: Export a trained Isaac Lab policy for deployment on Jetson Orin hardware

---

## The Reality Gap

A policy trained in simulation almost never works perfectly when transferred to a real robot. The performance degradation is called the **reality gap** and it has multiple sources:

```
Sources of the Reality Gap
──────────────────────────────────────────────────────
Visual gap:
  • Simulation textures look different from real materials
  • Real lighting is messier than simulated dome lights
  • Camera lens distortion not perfectly modelled

Physics gap:
  • Motor backlash and friction not precisely modelled
  • Joint damping drifts over time as hardware wears
  • Floor surface properties (friction) vary room to room
  • Sensor noise models are approximations

Observation gap:
  • Real sensors have calibration errors
  • IMU bias drifts; camera intrinsics change with temperature
  • Time delays between sensing and actuation differ

State gap:
  • The robot's initial state at deployment differs from training
  • Objects have different positions, orientations, and weights
──────────────────────────────────────────────────────
```

The goal of Sim-to-Real transfer techniques is to train policies that are **robust** to all of these variations.

---

## Reinforcement Learning with Isaac Lab

**Isaac Lab** (formerly Isaac Gym) is NVIDIA's RL framework built on Isaac Sim. It enables training with thousands of parallel environments simultaneously on a single GPU.

### Key Concepts

**Environment**: one instance of the simulation (one robot + world). Isaac Lab runs thousands of these in parallel.

**Observation space**: what the policy sees. For a locomotion policy, this is joint positions, joint velocities, base linear velocity, base angular velocity, and projected gravity vector.

**Action space**: what the policy controls. For a locomotion policy, this is target joint positions (PD controller setpoints).

**Reward function**: a scalar signal that the policy maximises. For locomotion: forward velocity reward, minus energy penalty, minus stumble penalty.

### Setting Up a Locomotion Task

```python
# tasks/unitree_g1_locomotion.py
from omni.isaac.lab.utils import configclass
from omni.isaac.lab_tasks.locomotion.velocity.velocity_env_cfg import LocomotionVelocityRoughEnvCfg
from omni.isaac.lab_assets.unitree import UNITREE_G1_CFG

@configclass
class UnitreeG1LocomotionEnvCfg(LocomotionVelocityRoughEnvCfg):
    def __post_init__(self):
        super().__post_init__()
        # Robot configuration
        self.scene.robot = UNITREE_G1_CFG.replace(
            prim_path="{ENV_REGEX_NS}/Robot"
        )
        # 4096 parallel environments
        self.scene.num_envs = 4096
        # 2m spacing between environments
        self.scene.env_spacing = 2.5
        # Terrain: flat for initial training, rough for fine-tuning
        self.scene.terrain.terrain_type = "flat"
```

### Training with PPO

```bash
# Train a Unitree G1 locomotion policy with PPO
python scripts/reinforcement_learning/rsl_rl/train.py \
  --task Isaac-Velocity-Flat-Unitree-G1-v0 \
  --num_envs 4096 \
  --headless

# Training runs ~2000 iterations; wall-clock time ~2 hours on RTX 4090
# Checkpoint saved to: logs/rsl_rl/unitree_g1_locomotion/YYYY-MM-DD_HH-MM-SS/

# Evaluate the trained policy
python scripts/reinforcement_learning/rsl_rl/play.py \
  --task Isaac-Velocity-Flat-Unitree-G1-v0 \
  --num_envs 32 \
  --checkpoint logs/rsl_rl/unitree_g1_locomotion/.../model_2000.pt
```

---

## Domain Randomisation for Sim-to-Real

Domain randomisation deliberately varies simulation parameters during training so the policy learns to handle a wide range of conditions.

### Physics Domain Randomisation

```python
from omni.isaac.lab.utils.noise import AdditiveUniformNoiseCfg, MultipliedNoiseCfg

@configclass
class UnitreeG1LocomotionEnvCfg_TRAIN(UnitreeG1LocomotionEnvCfg):
    def __post_init__(self):
        super().__post_init__()

        # Randomise friction at each episode reset
        self.scene.robot.spawn.physics_material = RigidBodyMaterialCfg(
            friction_combine_mode="multiply",
            static_friction=("uniform", 0.4, 1.2),   # randomised range
            dynamic_friction=("uniform", 0.4, 1.2),
            restitution=0.0
        )

        # Add joint position observation noise (sensor noise simulation)
        self.observations.policy.joint_pos = ObsTermCfg(
            func=mdp.joint_pos_rel,
            noise=AdditiveUniformNoiseCfg(n_min=-0.01, n_max=0.01),
        )

        # Add external push forces to the base (disturbance)
        self.events.push_robot = EventTermCfg(
            func=mdp.push_by_setting_velocity,
            mode="interval",
            interval_range_s=(10.0, 15.0),
            params={
                "velocity_range": {
                    "x": (-0.5, 0.5),
                    "y": (-0.5, 0.5),
                }
            },
        )
```

### Curriculum Learning

Curriculum learning starts training on easy scenarios and gradually increases difficulty:

```python
# Stage 1: Flat terrain, no external disturbances
# Stage 2: Flat terrain, small external pushes
# Stage 3: Rough terrain (gravel), moderate pushes
# Stage 4: Very rough terrain (stairs), large pushes

# The curriculum advances when the mean episode reward exceeds a threshold
class CurriculumManager:
    def __init__(self, stages):
        self.stages = stages
        self.current_stage = 0

    def maybe_advance(self, mean_reward: float):
        threshold = self.stages[self.current_stage]['advance_threshold']
        if mean_reward > threshold and self.current_stage < len(self.stages) - 1:
            self.current_stage += 1
            return True  # Stage advanced
        return False
```

---

## Deploying to Jetson Orin

### Exporting the Policy to ONNX/TensorRT

```python
import torch

# Load checkpoint
from rsl_rl.runners import OnPolicyRunner
runner = OnPolicyRunner(env, train_cfg, log_dir, device='cpu')
runner.load(checkpoint_path)
policy = runner.alg.actor_critic.actor

# Export to ONNX
dummy_obs = torch.zeros(1, 48)  # 48-dim observation vector
torch.onnx.export(
    policy,
    dummy_obs,
    'unitree_g1_policy.onnx',
    input_names=['obs'],
    output_names=['actions'],
    opset_version=11
)

# Compile to TensorRT on Jetson
# (run this command on the Jetson, not the workstation)
# trtexec --onnx=unitree_g1_policy.onnx \
#         --saveEngine=unitree_g1_policy.engine \
#         --fp16
```

### ROS 2 Node for Policy Deployment

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Imu, JointState
from std_msgs.msg import Float64MultiArray
import tensorrt as trt
import numpy as np
import pycuda.driver as cuda
import pycuda.autoinit

class LocomotionPolicyNode(Node):
    def __init__(self):
        super().__init__('locomotion_policy')

        # Load TensorRT engine
        logger = trt.Logger(trt.Logger.WARNING)
        with open('unitree_g1_policy.engine', 'rb') as f:
            engine_data = f.read()
        runtime = trt.Runtime(logger)
        self.engine = runtime.deserialize_cuda_engine(engine_data)
        self.context = self.engine.create_execution_context()

        # ROS 2 I/O
        self.joint_sub = self.create_subscription(
            JointState, '/joint_states', self.joint_callback, 10
        )
        self.imu_sub = self.create_subscription(
            Imu, '/imu/data', self.imu_callback, 10
        )
        self.action_pub = self.create_publisher(
            Float64MultiArray, '/joint_position_commands', 10
        )

        self.joint_pos = np.zeros(23)  # G1 has 23 controllable joints
        self.joint_vel = np.zeros(23)
        self.gravity_proj = np.array([0.0, 0.0, -1.0])

        self.timer = self.create_timer(0.02, self.policy_step)  # 50 Hz

    def imu_callback(self, msg: Imu):
        # Project gravity vector into robot frame
        q = msg.orientation
        # Rotation matrix from quaternion
        g_world = np.array([0.0, 0.0, -9.81])
        # ... quaternion rotation math ...
        self.gravity_proj = g_world / np.linalg.norm(g_world)

    def joint_callback(self, msg: JointState):
        for i, name in enumerate(msg.name[:23]):
            self.joint_pos[i] = msg.position[i]
            self.joint_vel[i] = msg.velocity[i]

    def policy_step(self):
        # Assemble observation vector (must match training)
        obs = np.concatenate([
            self.joint_pos,        # 23 dims
            self.joint_vel,        # 23 dims
            self.gravity_proj,     # 3 dims (projected gravity)
        ]).astype(np.float32)     # Total: 49 dims

        # Run TensorRT inference
        input_buf = cuda.mem_alloc(obs.nbytes)
        output_buf = cuda.mem_alloc(23 * 4)  # 23 action dims, float32
        cuda.memcpy_htod(input_buf, obs)
        self.context.execute_v2([int(input_buf), int(output_buf)])
        actions = np.empty(23, dtype=np.float32)
        cuda.memcpy_dtoh(actions, output_buf)

        # Publish joint position targets
        cmd = Float64MultiArray()
        cmd.data = actions.tolist()
        self.action_pub.publish(cmd)
```

---

## Sim-to-Real Evaluation Protocol

Before deploying a policy to the real Unitree G1, follow this evaluation protocol:

```
Sim-to-Real Evaluation Checklist:
  ✅ Policy achieves >90% success rate on flat terrain in simulation
  ✅ Policy robust to push disturbances (0.5 m/s) in simulation
  ✅ Policy exported to ONNX and verified numerically (max error < 1e-3 vs PyTorch)
  ✅ TensorRT engine runs at ≥50 Hz on target Jetson Orin
  ✅ First real-robot test: robot on safety harness, 25% action scaling
  ✅ Joint temperature monitored throughout (stop if >65°C)
  ✅ Gradually increase action scaling from 25% → 50% → 75% → 100%
  ✅ Document failure modes: joint positions that differ from simulation
```

The most common real-robot failures in locomotion policies:
1. **Joint position offset**: the robot's rest position differs from simulation by 2–5°. Fix with calibration or a positional offset in the deployment node.
2. **Timing jitter**: the policy step is not perfectly periodic on real hardware. Add a low-pass filter on actions.
3. **Terrain friction mismatch**: the real floor has different friction than the simulation default. Re-train with wider friction randomisation range.
