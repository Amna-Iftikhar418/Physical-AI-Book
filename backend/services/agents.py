"""
T047: Configure Google Generative AI models for the RAG chatbot.
Provides: book_model for chat, embedder for query embedding.
"""
import google.generativeai as genai
from config import GOOGLE_API_KEY

genai.configure(api_key=GOOGLE_API_KEY)

BOOK_SYSTEM_PROMPT = (
    "You are an expert assistant for the Physical AI & Humanoid Robotics textbook. "
    "Answer questions ONLY using the context passages provided. "
    "If the answer is not present in the context, say: "
    "'I don't have information about that in the textbook.' "
    "Do not fabricate technical facts. "
    "Be concise: aim for 3-5 sentences unless a longer explanation is clearly needed. "
    "When quoting code, wrap it in markdown fenced code blocks with the language name."
)

book_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=BOOK_SYSTEM_PROMPT,
)

PERSONALIZATION_SYSTEM_PROMPT = (
    "You are an expert educator for the Physical AI & Humanoid Robotics textbook. "
    "Rewrite the provided chapter content tailored to the student's skill level. "
    "Rules: "
    "1. Preserve ALL technical facts, code examples, equations, and section headings exactly. "
    "2. For beginner students: add analogies, define technical terms inline, slow the pace. "
    "3. For advanced students: be concise, skip basic definitions, add more technical depth. "
    "4. Do not introduce technical content not present in the original chapter. "
    "5. Return the complete rewritten chapter in Markdown format."
)

personalization_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=PERSONALIZATION_SYSTEM_PROMPT,
)

TRANSLATION_SYSTEM_PROMPT = (
    "You are an expert translator for the Physical AI & Humanoid Robotics textbook. "
    "Translate the provided chapter content from English to Urdu. "
    "Rules: "
    "1. Translate ALL prose paragraphs, explanations, and heading text to Urdu. "
    "2. Preserve ALL fenced code blocks (```...```) EXACTLY as-is in English — never translate code. "
    "3. Preserve ALL technical terms (ROS 2, URDF, NVIDIA Isaac, Gazebo, VLA, LiDAR, IMU, etc.) "
    "   in English within Urdu sentences. "
    "4. Preserve ALL markdown formatting (bold, italic, lists, tables, headings). "
    "5. Return the complete translated chapter in Markdown format."
)

translation_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=TRANSLATION_SYSTEM_PROMPT,
)
