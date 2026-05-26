---
id: week-8-10-isaac-sim
title: "Weeks 8–10: Isaac Sim and Synthetic Data"
sidebar_position: 2
---

# Weeks 8–10: Isaac Sim and Synthetic Data Generation

> **Learning Objectives**
> - **LO4**: Launch Isaac Sim scenes and author environments using the Omniverse GUI
> - **LO4**: Import robot models in USD format and configure articulation joints
> - **LO4**: Generate synthetic labelled training datasets using domain randomisation

---

## Isaac Sim Architecture

Isaac Sim is built on **NVIDIA Omniverse**, a platform for physically-based simulation using the **USD (Universal Scene Description)** format developed by Pixar and adopted by NVIDIA for robotics simulation. The key architectural components are:

```
Isaac Sim
├── Omniverse Kit         — Application framework (plugin-based)
├── USD Stage             — The scene graph (everything in the simulation)
├── PhysX 5              — NVIDIA's physics engine (rigid bodies, articulations, fluids)
├── RTX Renderer          — Ray-traced renderer for photorealistic visuals
├── Replicator            — Synthetic data generation framework
└── Python API            — `isaacsim` Python bindings for automation
```

Isaac Sim runs on:
- **Local workstation**: Ubuntu 22.04, NVIDIA RTX GPU (RTX 3070 minimum; RTX 4080+ recommended)
- **Cloud**: AWS g5.4xlarge / g5.12xlarge via NVIDIA Omniverse Cloud

---

## Installing Isaac Sim

### Option A: Omniverse Launcher (Recommended for beginners)

1. Download the NVIDIA Omniverse Launcher from developer.nvidia.com/omniverse
2. Sign in with a free NVIDIA developer account
3. In the Launcher, go to **Exchange → Apps** and install **Isaac Sim 4.x**
4. Launch Isaac Sim from the Launcher

### Option B: Docker Container (Recommended for CI/training)

```bash
# Pull the Isaac Sim container
docker pull nvcr.io/nvidia/isaac-sim:4.1.0

# Run with GPU access and display
docker run --gpus all -it --rm \
  --env DISPLAY=$DISPLAY \
  --volume /tmp/.X11-unix:/tmp/.X11-unix \
  nvcr.io/nvidia/isaac-sim:4.1.0 \
  ./runapp.sh
```

---

## The USD Scene Format

USD (Universal Scene Description) is a scene format that describes 3D environments as a hierarchy of **prims** (primitives). Every object in an Isaac Sim scene — robots, ground planes, lights, cameras — is a prim in the USD stage.

```python
# Working with the Isaac Sim USD stage from Python
import isaacsim
from isaacsim import SimulationApp

# Initialise headless simulation
simulation_app = SimulationApp({"headless": True})

from pxr import Usd, UsdGeom, UsdPhysics, Gf
import omni.kit.commands

# Create a new stage
stage = omni.usd.get_context().get_stage()

# Add a ground plane
omni.kit.commands.execute('AddGroundPlaneCommand',
    stage=stage,
    planePath='/World/GroundPlane',
    axis='Y',
    size=100.0,
    position=Gf.Vec3f(0, 0, 0),
    color=Gf.Vec3f(0.5, 0.5, 0.5)
)

# Add a light
omni.kit.commands.execute('CreatePrimWithDefaultXform',
    prim_type='DomeLight',
    prim_path='/World/DomeLight'
)
stage.GetPrimAtPath('/World/DomeLight').GetAttribute('inputs:intensity').Set(1000.0)
```

---

## Importing a Robot into Isaac Sim

### From URDF

Isaac Sim's URDF importer converts a ROS URDF file to USD:

```python
from omni.importer.urdf import _urdf

import_config = _urdf.ImportConfig()
import_config.merge_fixed_joints = False
import_config.convex_decomp = False
import_config.fix_base = False
import_config.make_default_prim = True
import_config.self_collision = False
import_config.create_physics_scene = True
import_config.import_inertia_tensor = True
import_config.default_drive_strength = 1047.19751
import_config.default_position_drive_damping = 52.35988

# Import the URDF and get the USD prim path
result, prim_path = omni.kit.commands.execute(
    'URDFParseAndImportFile',
    urdf_path='/home/user/ros2_ws/src/my_robot_pkg/urdf/my_robot.urdf',
    import_config=import_config
)
print(f'Robot imported at prim path: {prim_path}')
```

### Configuring Articulation

Once imported, the robot's joints appear as `UsdPhysics.DriveAPI` prims. Configure joint PD controllers:

```python
from pxr import UsdPhysics, PhysxSchema

# Set joint drive parameters for joint_1
joint_prim = stage.GetPrimAtPath(f'{prim_path}/joint_1')
drive = UsdPhysics.DriveAPI.Apply(joint_prim, 'angular')
drive.CreateTypeAttr('force')
drive.CreateMaxForceAttr(10.0)  # Nm
drive.CreateDampingAttr(52.36)
drive.CreateStiffnessAttr(1047.2)
```

---

## Synthetic Data Generation with Replicator

NVIDIA Replicator is Isaac Sim's built-in SDG (Synthetic Data Generation) framework. It orchestrates randomisation of scene parameters and annotation of outputs.

### Basic SDG Pipeline

```python
import omni.replicator.core as rep

# Define the scene elements
with rep.new_layer():
    # Create 10 random objects on the ground
    objects = rep.create.cube(count=10)
    
    # Camera for capturing images
    camera = rep.create.camera(position=(0, 3, 0), look_at=(0, 0, 0))
    
    # Render product: 640x480 RGB + depth + segmentation
    render_product = rep.create.render_product(camera, (640, 480))

# Define randomisations
with rep.trigger.on_frame(num_frames=1000):
    # Randomise object positions
    with objects:
        rep.randomizer.scatter_2d(
            surface_prims=['/World/GroundPlane'],
            check_for_collisions=True
        )
    # Randomise lighting
    with rep.create.light(light_type='dome'):
        rep.randomizer.rotation()
        rep.modify.attribute('intensity', rep.distribution.uniform(200, 2000))

# Configure annotators (what labels to generate)
rep.annotators.attach([
    'rgb',
    'depth',
    'semantic_segmentation',
    'bounding_box_2d_tight',
    'bounding_box_3d',
], render_product)

# Write output to disk
writer = rep.WriterRegistry.get('BasicWriter')
writer.initialize(
    output_dir='/data/synthetic_dataset',
    rgb=True,
    depth=True,
    semantic_segmentation=True,
    bounding_box_2d_tight=True,
)
writer.attach([render_product])

# Run the randomisation pipeline
rep.orchestrator.run()
```

This generates a dataset of 1000 images, each with:
- `rgb/`: JPEG images with randomised object positions and lighting
- `depth/`: 32-bit float depth maps
- `semantic_segmentation/`: per-pixel class labels
- `bounding_box_2d_tight/`: JSON bounding box annotations

### Domain Randomisation for Sim-to-Real

Domain randomisation deliberately varies simulation parameters to make trained models robust to the visual and physical differences between simulation and reality:

```python
# Visual domain randomisation
with rep.trigger.on_frame(num_frames=5000):
    # Randomise textures on all objects
    with objects:
        rep.randomizer.texture(
            textures=rep.utils.get_usd_files('/Replicator/Materials/')
        )
    # Randomise camera noise
    with camera:
        rep.modify.attribute(
            'cameraProperties.noise',
            rep.distribution.uniform(0.0, 0.05)
        )
    # Add/remove random occluders
    with rep.create.cube(count=3, semantics=[('class', 'occluder')]):
        rep.randomizer.scatter_2d(surface_prims=['/World/GroundPlane'])
```

The intuition: if a model trained on data with randomised textures, lighting, and noise still achieves high accuracy, it has learned to focus on structural features (shape, geometry) rather than superficial appearance. This structural understanding transfers better to the real world.

---

## Running a Physics Simulation

For non-rendering workflows (RL training, controller testing), Isaac Sim can step the simulation faster than real time:

```python
from isaacsim import SimulationApp
app = SimulationApp({"headless": True})

import omni
from omni.isaac.core import World
from omni.isaac.core.robots import Robot

world = World(stage_units_in_meters=1.0)
world.scene.add_default_ground_plane()

# Add robot
robot = world.scene.add(
    Robot(prim_path='/World/MyRobot', name='my_robot')
)

world.reset()

# Step the simulation 1000 times at 60 Hz
for i in range(1000):
    world.step(render=False)  # render=False for maximum speed

    # Read joint states
    joint_positions = robot.get_joint_positions()
    joint_velocities = robot.get_joint_velocities()

    # Apply joint torques
    robot.apply_action(
        ArticulationAction(joint_efforts=[0.1, -0.1])
    )

app.close()
```

This pattern — `world.step(render=False)` in a loop — is how Isaac Lab trains RL policies in parallel. With 4096 parallel environments on an A100 GPU, a locomotion policy can see millions of physics steps per minute.

---

## Week 8 Summary

After completing the Isaac Sim section, you should be able to:

- ✅ Launch Isaac Sim (locally or via Docker) and author a basic USD scene
- ✅ Import a URDF robot and configure its articulation drives
- ✅ Write a Replicator script that generates a 1000-image synthetic dataset with bounding boxes
- ✅ Apply visual and physics domain randomisation to improve Sim-to-Real transfer
- ✅ Step the simulation headlessly for maximum speed in training workflows

Next: [Week 8–10: AI-Powered Perception](/module-3-isaac/week-8-10-perception)
