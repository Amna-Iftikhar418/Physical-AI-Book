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
