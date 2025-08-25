// Servicio de IA para procesar información de productos usando OpenRouter
class AIService {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://openrouter.ai/api/v1';
        this.model = 'anthropic/claude-3.5-sonnet'; // Modelo por defecto
    }

    // Configurar la API key
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    // Verificar si la API key está configurada
    isConfigured() {
        return !!this.apiKey;
    }

    // Procesar información del producto con IA
    async processProductInfo(productData) {
        if (!this.isConfigured()) {
            throw new Error('API key de OpenRouter no configurada');
        }

        try {
            const prompt = this.buildPrompt(productData);
            const response = await this.callOpenRouter(prompt);
            return this.parseAIResponse(response);
        } catch (error) {
            console.error('Error procesando con IA:', error);
            throw error;
        }
    }

    // Construir el prompt para la IA
    buildPrompt(productData) {
        return `Analiza la siguiente información de un producto de una página web y extrae los datos más relevantes de manera estructurada.

Información de la página:
- URL: ${productData.url}
- Título: ${productData.title}
- Descripción extraída: ${productData.productInfo.description}

Información del producto extraída:
- Nombre: ${productData.productInfo.name}
- Precio: ${productData.productInfo.price}
- Disponibilidad: ${productData.productInfo.availability}
- Imágenes: ${productData.productInfo.images.length} encontradas

HTML de la página (primeros 1000 caracteres):
${productData.html.substring(0, 1000)}...

Por favor, analiza esta información y proporciona:

1. **Nombre del producto**: Nombre exacto y completo
2. **Precio**: Precio en formato estándar (ej: $99.99)
3. **Descripción**: Descripción clara y concisa del producto
4. **Categoría**: Categoría principal del producto
5. **Marca**: Marca del producto si es identificable
6. **Disponibilidad**: Estado de stock/disponibilidad
7. **Características clave**: Lista de 3-5 características principales
8. **Valoración**: Si hay reviews/rating disponible
9. **URL de la imagen principal**: URL de la imagen más representativa
10. **Tipo de página**: Si es página de producto, categoría, búsqueda, etc.

Responde en formato JSON válido con esta estructura:
{
    "productName": "string",
    "price": "string",
    "description": "string",
    "category": "string",
    "brand": "string",
    "availability": "string",
    "keyFeatures": ["string"],
    "rating": "string",
    "mainImageUrl": "string",
    "pageType": "string",
    "confidence": "number (0-1)"
}`;
    }

    // Llamar a OpenRouter API
    async callOpenRouter(prompt) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/ben1998pe/Chalakoo',
                'X-Title': 'Chalakoo Chrome Extension'
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error de OpenRouter: ${errorData.error?.message || response.statusText}`);
        }

        return await response.json();
    }

    // Parsear la respuesta de la IA
    parseAIResponse(aiResponse) {
        try {
            const content = aiResponse.choices[0]?.message?.content;
            if (!content) {
                throw new Error('Respuesta vacía de la IA');
            }

            // Intentar extraer JSON de la respuesta
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                // Si no hay JSON, crear estructura básica
                return {
                    productName: 'Producto analizado por IA',
                    price: 'Precio no determinado',
                    description: content.substring(0, 200) + '...',
                    category: 'Categoría no determinada',
                    brand: 'Marca no determinada',
                    availability: 'Disponibilidad no determinada',
                    keyFeatures: ['Características extraídas por IA'],
                    rating: 'No disponible',
                    mainImageUrl: '',
                    pageType: 'Página web',
                    confidence: 0.7
                };
            }
        } catch (error) {
            console.error('Error parseando respuesta de IA:', error);
            throw new Error('No se pudo procesar la respuesta de la IA');
        }
    }

    // Cambiar modelo de IA
    setModel(model) {
        this.model = model;
    }

    // Obtener modelos disponibles (ejemplo)
    getAvailableModels() {
        return [
            'anthropic/claude-3.5-sonnet',
            'anthropic/claude-3-haiku',
            'openai/gpt-4o',
            'openai/gpt-3.5-turbo',
            'meta-llama/llama-3.1-8b-instruct',
            'google/gemini-pro'
        ];
    }
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIService;
} else {
    window.AIService = AIService;
}
