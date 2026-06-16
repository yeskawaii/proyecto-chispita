import os
from google import genai

def generar_ideas_viaje(destino: str, dias: int, presupuesto: float):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    
    prompt = f"""
    Eres un planeador de viajes experto en parejas. 
    Mi novia y yo vamos a {destino} por {dias} días con un presupuesto de ${presupuesto} MXN.
    Dame 3 ideas de actividades románticas o divertidas que podamos hacer.
    Responde corto, directo y sin rodeos.
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
    )
    
    return response.text