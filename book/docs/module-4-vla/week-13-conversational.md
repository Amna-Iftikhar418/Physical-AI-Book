---
id: week-13-conversational
title: "Week 13: Conversational Robotics"
sidebar_position: 3
---

# Week 13: Conversational Robotics

> **Learning Objectives**
> - **LO6**: Integrate OpenAI Whisper for real-time voice command recognition on Jetson
> - **LO6**: Design LLM-based cognitive planning prompts that output structured ROS 2 action plans
> - **LO6**: Build a complete voice-to-action pipeline with error handling and safety fallbacks

---

## The Voice-to-Action Pipeline

Week 13 integrates everything from the course into a complete conversational robot system. The pipeline has five stages:

```
1. LISTEN      Microphone → Whisper ASR → Text
2. UNDERSTAND  Text + Visual Context → LLM → Action Plan (JSON)
3. VALIDATE    Action Plan → Vocabulary Check → Valid / Invalid
4. EXECUTE     Valid Actions → ROS 2 Action Servers → Robot Motion
5. CONFIRM     Result → TTS (Text-to-Speech) → Spoken Response
```

Each stage is a separate ROS 2 node, connected by topics and action servers. This modular design allows each component to be tested, improved, or replaced independently.

---

## Stage 1: OpenAI Whisper for Speech Recognition

**OpenAI Whisper** is an open-weight automatic speech recognition (ASR) model trained on 680,000 hours of audio. The key properties for robotics deployment:

- **Multilingual**: supports 99 languages; relevant for multilingual user bases
- **Noise robust**: trained on real-world noisy audio; works in factory and lab environments
- **Local deployment**: runs entirely on-device; no internet connection required after download
- **Jetson compatible**: runs in real time on Jetson Orin NX with float16 precision

### Model Sizes

| Model | Parameters | Speed (Jetson Orin NX) | WER (English) |
|-------|-----------|----------------------|---------------|
| tiny | 39M | ~8x real time | 14.4% |
| base | 74M | ~5x real time | 10.8% |
| small | 244M | ~2x real time | 8.0% |
| medium | 769M | ~1.2x real time | 6.4% |
| large-v3 | 1550M | ~0.5x real time | 5.1% |

For robotics voice commands, the `small` model provides the best speed/accuracy tradeoff on Jetson Orin NX.

### ROS 2 Whisper Node

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import whisper
import numpy as np
import sounddevice as sd

class WhisperASRNode(Node):
    def __init__(self):
        super().__init__('whisper_asr')
        self.declare_parameter('model_size', 'small')
        self.declare_parameter('sample_rate', 16000)
        self.declare_parameter('record_seconds', 5.0)

        model_size = self.get_parameter('model_size').get_parameter_value().string_value
        self.sample_rate = self.get_parameter('sample_rate').get_parameter_value().integer_value
        self.record_seconds = self.get_parameter('record_seconds').get_parameter_value().double_value

        self.get_logger().info(f'Loading Whisper {model_size} model...')
        self.model = whisper.load_model(model_size)
        self.get_logger().info('Whisper model loaded.')

        self.text_pub = self.create_publisher(String, '/asr/transcription', 10)

        # Listen every record_seconds seconds
        self.timer = self.create_timer(self.record_seconds, self.listen_and_transcribe)

    def listen_and_transcribe(self):
        self.get_logger().info(f'Listening for {self.record_seconds:.1f}s...')
        audio = sd.rec(
            int(self.record_seconds * self.sample_rate),
            samplerate=self.sample_rate,
            channels=1,
            dtype='float32'
        )
        sd.wait()
        audio_flat = audio.flatten()

        # Whisper expects float32, 16kHz
        result = self.model.transcribe(
            audio_flat,
            language='en',
            fp16=True,  # Use float16 on Jetson GPU
            condition_on_previous_text=False  # Avoid hallucinations
        )
        text = result['text'].strip()
        if text:
            self.get_logger().info(f'Transcribed: "{text}"')
            msg = String()
            msg.data = text
            self.text_pub.publish(msg)
```

---

## Stage 2: LLM Cognitive Planning

The transcribed text is passed to an LLM that generates a structured action plan. The key design choices are:

1. **Structured output**: the LLM must output valid JSON, not free text
2. **Bounded action vocabulary**: the LLM only generates actions the robot can execute
3. **Context grounding**: provide the LLM with the robot's current scene (detected objects, position)

### Action Vocabulary Definition

Define the robot's action vocabulary as a Python dataclass or Pydantic model:

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class NavigateAction:
    action: str = "navigate"
    target_object: str = ""   # object name from detection
    x: Optional[float] = None  # or absolute coordinates
    y: Optional[float] = None

@dataclass
class GraspAction:
    action: str = "grasp"
    target_object: str = ""
    approach: str = "top"   # top | side | front

@dataclass
class PlaceAction:
    action: str = "place"
    target_location: str = ""   # e.g., "table", "shelf_A"

@dataclass
class SpeakAction:
    action: str = "speak"
    text: str = ""

VALID_ACTIONS = ["navigate", "grasp", "place", "speak", "wait", "cancel"]
```

### LLM Planner Prompt Design

```python
import google.generativeai as genai
import json
import os

genai.configure(api_key=os.environ['GOOGLE_API_KEY'])

SYSTEM_PROMPT = """You are a robot action planner for a Unitree G1 humanoid robot.
The robot can perform the following actions:
- navigate: move to a detected object or absolute position
- grasp: pick up an object using the right arm
- place: put down the held object at a location
- speak: say something to the user
- wait: pause execution for N seconds
- cancel: stop all motion (safety)

When given a natural language command, you MUST output ONLY a JSON array of action steps.
Do not output any text outside the JSON array.
If a command is unclear or unsafe, output [{"action": "speak", "text": "I cannot do that safely."}]

Available objects in the scene will be provided as context.
"""

model = genai.GenerativeModel(
    model_name='gemini-2.0-flash',
    system_instruction=SYSTEM_PROMPT
)

def generate_action_plan(
    command: str,
    detected_objects: list[dict]
) -> list[dict]:
    objects_str = "\n".join(
        f"- {obj['label']} at position ({obj['x']:.2f}, {obj['y']:.2f})"
        for obj in detected_objects
    )
    prompt = f"""User command: "{command}"

Objects currently visible:
{objects_str}

Generate the action plan as a JSON array:"""

    response = model.generate_content(prompt)
    raw = response.text.strip()

    # Strip markdown code fences if present
    if raw.startswith('```'):
        raw = raw.split('\n', 1)[1].rsplit('```', 1)[0]

    return json.loads(raw)

# Example usage
plan = generate_action_plan(
    command="bring me the blue box",
    detected_objects=[
        {"label": "blue_box", "x": 2.3, "y": 0.5},
        {"label": "chair", "x": 1.1, "y": -0.8},
    ]
)
# Output: [
#   {"action": "navigate", "target_object": "blue_box"},
#   {"action": "grasp", "target_object": "blue_box", "approach": "top"},
#   {"action": "navigate", "target_object": "user"},
#   {"action": "place", "target_location": "user_hands"},
#   {"action": "speak", "text": "Here is the blue box."}
# ]
```

---

## Stage 3: Action Plan Validation

Never execute LLM output without validation. The validator:

```python
class ActionPlanValidator:
    def validate(self, plan: list[dict]) -> tuple[bool, str]:
        if not isinstance(plan, list):
            return False, "Plan must be a list"
        if len(plan) == 0:
            return False, "Empty plan"
        if len(plan) > 10:
            return False, f"Plan too long: {len(plan)} steps (max 10)"

        for i, step in enumerate(plan):
            if 'action' not in step:
                return False, f"Step {i} missing 'action' key"
            if step['action'] not in VALID_ACTIONS:
                return False, f"Step {i} has unknown action: {step['action']}"
            # Check navigate has either target_object or x,y
            if step['action'] == 'navigate':
                if 'target_object' not in step and ('x' not in step or 'y' not in step):
                    return False, f"Step {i} navigate missing target"
        return True, "OK"
```

---

## Stage 4: Action Execution

The executor dispatches validated actions to the appropriate ROS 2 action servers:

```python
class ActionExecutor(Node):
    def __init__(self):
        super().__init__('action_executor')
        self.nav_client = ActionClient(self, NavigateToPose, 'navigate_to_pose')
        self.grasp_client = ActionClient(self, GraspObject, 'grasp_object')
        self.tts_pub = self.create_publisher(String, '/tts/say', 10)

    async def execute_plan(self, plan: list[dict]):
        for step in plan:
            action = step['action']
            self.get_logger().info(f'Executing: {step}')

            if action == 'navigate':
                target = step.get('target_object')
                pose = self.lookup_object_pose(target)
                if pose is None:
                    self.get_logger().warn(f'Object {target} not found, skipping')
                    continue
                await self.navigate_to(pose)

            elif action == 'grasp':
                target = step.get('target_object')
                approach = step.get('approach', 'top')
                success = await self.grasp_object(target, approach)
                if not success:
                    self.speak(f"I couldn't grasp the {target}. Please try again.")
                    return

            elif action == 'speak':
                self.speak(step['text'])

            elif action == 'wait':
                await asyncio.sleep(step.get('seconds', 2.0))

            elif action == 'cancel':
                self.cancel_all_goals()
                self.speak("All motion cancelled.")
                return
```

---

## Stage 5: Text-to-Speech Response

For the robot to confirm actions, a TTS (text-to-speech) node converts text to audio:

```python
# Using espeak-ng (lightweight, runs on Jetson)
import subprocess

class TTSNode(Node):
    def __init__(self):
        super().__init__('tts_node')
        self.create_subscription(String, '/tts/say', self.say_callback, 10)

    def say_callback(self, msg: String):
        subprocess.run(['espeak-ng', '-s', '160', '-v', 'en', msg.data])
```

---

## Multi-Modal Interaction

The full conversational robot supports three input modalities simultaneously:

```python
class MultiModalInputManager(Node):
    def __init__(self):
        super().__init__('multimodal_input')
        self.asr_sub = self.create_subscription(String, '/asr/transcription',
                                                 self.on_voice, 10)
        self.gesture_sub = self.create_subscription(String, '/gesture/detected',
                                                     self.on_gesture, 10)
        self.plan_pub = self.create_publisher(String, '/action_plan_request', 10)

    def on_voice(self, msg: String):
        command = msg.data
        self.get_logger().info(f'Voice command: {command}')
        self.request_plan(command)

    def on_gesture(self, msg: String):
        if msg.data == 'wave':
            self.request_plan("approach the user and greet them")
        elif msg.data == 'stop_hand':
            self.request_plan("cancel all motion")

    def request_plan(self, command: str):
        out = String()
        out.data = command
        self.plan_pub.publish(out)
```

---

## Capstone Preparation

The complete Capstone system integrates all stages:

```bash
# Launch the full VLA stack
ros2 launch physical_ai_capstone capstone.launch.py

# This starts:
#   1. Isaac ROS object detection (/detected_objects)
#   2. Whisper ASR (/asr/transcription)
#   3. LLM planner (subscribes /asr/transcription, publishes /action_plan)
#   4. Action executor (subscribes /action_plan, calls Nav2 + Grasp action servers)
#   5. TTS node (subscribes /tts/say, plays audio)
#   6. Nav2 stack
#   7. Locomotion policy node
```

Test sequence for the Capstone demo:
1. Say: "Bring me the blue box" → observe navigation + grasp + delivery
2. Say: "Go to the door" → observe navigation only
3. Say: "Fly to the moon" → observe graceful rejection: "I cannot do that safely."
4. Wave hand → observe approach and greeting behaviour

---

## Week 13 and Module 4 Summary

After completing Week 13, you have built a complete Physical AI system:

- ✅ Whisper ASR running in real time on Jetson Orin, publishing to `/asr/transcription`
- ✅ LLM planner generating valid JSON action plans from natural language commands
- ✅ Action plan validator rejecting invalid or unsafe plans before execution
- ✅ Action executor dispatching to Nav2, grasp, and TTS action servers
- ✅ Multi-modal input manager combining voice and gesture inputs
- ✅ End-to-end test: voice command → navigation → grasp → spoken confirmation

The Capstone project brings together ROS 2 (Module 1), Gazebo/Unity simulation (Module 2), Isaac ROS perception and Nav2 (Module 3), and the LLM-to-action pipeline (Module 4) into a single deployable system. This is the state of the art in Physical AI engineering.

See the [Assessments](/assessments) chapter for the full Capstone rubric and submission guidelines.
