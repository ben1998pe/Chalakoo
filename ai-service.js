// Servicio de IA para procesar información de productos usando OpenRouter
class AIService {
    constructor() {
        // API key y modelo se configurarán desde la UI
        this.apiKey = null;
        this.baseUrl = 'https://openrouter.ai/api/v1';
        this.model = 'mistralai/mistral-small-3.2-24b-instruct:free';
    }

    // Configurar la API key (mantenido por compatibilidad)
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
        // Estrategia inteligente para enviar HTML: título + body principal + información específica
        let htmlContent = '';
        
        // 1. Título de la página
        htmlContent += `<title>${productData.title}</title>\n`;
        
        // 2. Buscar y extraer el body principal (donde está la información del producto)
        const bodyMatch = productData.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            const bodyContent = bodyMatch[1];
            
            // Limpiar el body: remover scripts, estilos y elementos innecesarios
            const cleanBody = bodyContent
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remover scripts
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remover estilos
                .replace(/<link[^>]*>/gi, '') // Remover links
                .replace(/<meta[^>]*>/gi, '') // Remover meta tags
                .replace(/<!--[\s\S]*?-->/g, '') // Remover comentarios
                .replace(/\s+/g, ' ') // Comprimir espacios múltiples
                .trim();
            
            // Enviar el body completo pero limitado a un tamaño razonable
            const maxBodyLength = 8000; // Aumentado significativamente
            if (cleanBody.length > maxBodyLength) {
                // Si es muy largo, tomar el inicio y el final (donde suele estar la info del producto)
                const startPart = cleanBody.substring(0, 4000);
                const endPart = cleanBody.substring(cleanBody.length - 4000);
                htmlContent += `<body>\n${startPart}\n...\n${endPart}\n</body>`;
            } else {
                htmlContent += `<body>\n${cleanBody}\n</body>`;
            }
        } else {
            // Fallback: enviar todo el HTML pero limitado
            htmlContent = productData.html.substring(0, 10000); // Aumentado a 10,000 caracteres
        }
        
        console.log('🔍 HTML que se envía a la IA:', htmlContent.substring(0, 500));
        console.log('🔍 Longitud del HTML:', htmlContent.length);
        console.log('🔍 URL de la página:', productData.url);
        console.log('🔍 Título de la página:', productData.title);
        
        return `Analiza esta página web de e-commerce y extrae información DETALLADA y PRECISA del producto PRINCIPAL de la página.

HTML DE LA PÁGINA:
${htmlContent}

INSTRUCCIONES IMPORTANTES:
1. **NOMBRE DEL PRODUCTO**: Extrae SOLO el nombre del producto PRINCIPAL que se está mostrando en la página
2. **PRECIOS DEL PRODUCTO PRINCIPAL**: 
   - Precio actual/online del producto principal
   - Precio regular/original del producto principal (si está tachado)
   - Precios especiales del producto principal (tarjetas, membresías)
   - Porcentajes de descuento del producto principal
   ⚠️ NO incluyas precios de otros productos relacionados o similares
3. **CATEGORÍA**: La categoría del producto PRINCIPAL
4. **DESCRIPCIÓN**: Descripción específica del producto PRINCIPAL
5. **ESPECIFICACIONES**: Especificaciones técnicas del producto PRINCIPAL
6. **DISPONIBILIDAD**: Stock disponible del producto PRINCIPAL
7. **SKU/CÓDIGO**: SKU del producto PRINCIPAL

⚠️ REGLAS CRÍTICAS:
- Extrae SOLO información del PRODUCTO PRINCIPAL de la página
- NO confundas productos relacionados con descuentos
- NO incluyas precios de otros productos en la sección de descuentos
- Si hay productos relacionados, IGNÓRALOS para la extracción
- Busca en TODO el HTML proporcionado
- Si no encuentras algo, usa "No disponible"

RESPONDE EN JSON:
{
    "productName": "nombre completo del producto PRINCIPAL",
    "currentPrice": "precio actual del producto PRINCIPAL",
    "originalPrice": "precio tachado del producto PRINCIPAL si hay",
    "discounts": ["descuentos específicos del producto PRINCIPAL"],
    "category": "categoría del producto PRINCIPAL",
    "description": "descripción del producto PRINCIPAL",
    "specifications": "especificaciones del producto PRINCIPAL",
    "availability": "stock del producto PRINCIPAL",
    "sku": "SKU del producto PRINCIPAL"
}`;
    }

    // Llamar a OpenRouter API
    async callOpenRouter(prompt) {
        console.log('🔍 Enviando prompt a OpenRouter:', prompt.substring(0, 200) + '...');
        
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
                max_tokens: 800, // Aumentado de 300 a 800 para respuestas más completas
                temperature: 0.1
            })
        });

        console.log('📡 Respuesta de OpenRouter:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error de OpenRouter:', errorData);
            throw new Error(`Error de OpenRouter: ${errorData.error?.message || response.statusText}`);
        }

        const responseData = await response.json();
        console.log('📥 Datos completos de OpenRouter:', responseData);
        
        return responseData;
    }

    // Parsear la respuesta de la IA
    parseAIResponse(aiResponse) {
        console.log('🧠 Respuesta completa de IA recibida:', aiResponse);
        
        try {
            const content = aiResponse.choices[0]?.message?.content;
            console.log('📝 Contenido extraído:', content);
            console.log('📝 Tipo de contenido:', typeof content);
            console.log('📝 Longitud del contenido:', content ? content.length : 'undefined');
            
            if (!content) {
                console.error('❌ Contenido vacío o undefined');
                throw new Error('Respuesta vacía de la IA');
            }

            // Intentar extraer JSON de la respuesta
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            console.log('🔍 JSON encontrado:', jsonMatch);
            
            if (jsonMatch) {
                const parsedData = JSON.parse(jsonMatch[0]);
                console.log('✅ JSON parseado exitosamente:', parsedData);
                
                // Validar y completar campos faltantes
                return this.validateAndCompleteData(parsedData);
            } else {
                console.log('⚠️ No se encontró JSON, creando estructura básica');
                // Si no hay JSON, crear estructura básica con la información disponible
                return this.createBasicStructure(content);
            }
        } catch (error) {
            console.error('❌ Error parseando respuesta de IA:', error);
            console.error('❌ Respuesta completa que causó el error:', aiResponse);
            throw new Error('No se pudo procesar la respuesta de la IA');
        }
    }

    // Validar y completar datos faltantes
    validateAndCompleteData(data) {
        const defaultData = {
            productName: 'Producto analizado por IA',
            currentPrice: 'No determinado',
            originalPrice: 'No disponible',
            discounts: [],
            category: 'Categoría no determinada',
            description: 'Descripción no disponible',
            specifications: 'No disponible',
            availability: 'No disponible',
            sku: 'No disponible'
        };

        // Combinar datos recibidos con valores por defecto
        return { ...defaultData, ...data };
    }

    // Crear estructura básica si no hay JSON
    createBasicStructure(content) {
        return {
            productName: 'Producto analizado por IA',
            currentPrice: 'No determinado',
            originalPrice: 'No disponible',
            discounts: [],
            category: 'Categoría no determinada',
            description: content.substring(0, 150) + '...',
            specifications: 'No disponible',
            availability: 'No disponible',
            sku: 'No disponible'
        };
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
