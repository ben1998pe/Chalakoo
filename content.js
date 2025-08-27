// Content script para extraer información de la página
(function() {
    'use strict';

    // Función para extraer información del producto de la página
    function extractProductInfo() {
        const pageInfo = {
            url: window.location.href,
            title: document.title,
            html: extractRelevantHTML(), // Nueva función para extraer solo lo relevante
            timestamp: new Date().toISOString()
        };

        // Log para debug
        console.log('🔍 Chalakoo: HTML extraído:', pageInfo.html.substring(0, 500));
        console.log('🔍 Chalakoo: Longitud del HTML:', pageInfo.html.length);
        console.log('🔍 Chalakoo: Título de la página:', pageInfo.title);
        console.log('🔍 Chalakoo: URL de la página:', pageInfo.url);

        // Intentar extraer información básica del producto
        const productInfo = {
            name: extractProductName(),
            price: extractProductPrice(),
            description: extractProductDescription(),
            images: extractProductImages(),
            availability: extractProductAvailability()
        };

        console.log('🔍 Chalakoo: Información extraída:', productInfo);

        return {
            ...pageInfo,
            productInfo
        };
    }

    // Nueva función para extraer solo el HTML relevante del producto
    function extractRelevantHTML() {
        let relevantHTML = '';
        
        // 1. Título de la página
        relevantHTML += `<title>${document.title}</title>\n`;
        
        // 2. Breadcrumbs (navegación) - Plaza Vea específico
        const breadcrumbs = document.querySelector('.breadcrumb, .breadcrumbs, [class*="breadcrumb"], nav[aria-label*="breadcrumb"], .vtex-breadcrumb, .breadcrumb-container');
        if (breadcrumbs) {
            relevantHTML += `<div class="breadcrumbs">${breadcrumbs.innerHTML}</div>\n`;
        }
        
        // 3. Nombre del producto - Plaza Vea específico
        const productName = document.querySelector('h1, .product-name, .product-title, [class*="product-name"], [class*="product-title"], .vtex-product-name, .product-details-name');
        if (productName) {
            relevantHTML += `<h1 class="product-name">${productName.innerHTML}</h1>\n`;
        }
        
        // 4. Precios - Selectores genéricos para e-commerce
        const priceSelectors = [
            // Selectores genéricos
            '.price, .product-price, [class*="price"], [class*="product-price"]',
            '.price-container, .price-wrapper, .price-box',
            '[data-testid*="price"], [data-testid*="Price"]',
            '.price-current, .price-regular, .price-online',
            '.discount-price, .price-discount, .price-sale',
            // Selectores específicos para Temu
            '[class*="price"], [class*="Price"]',
            '.current-price, .sale-price, .original-price',
            // Selectores para precios tachados
            '.price-old, .price-original, .price-before',
            'del, s, strike, [style*="text-decoration: line-through"]'
        ];
        
        let priceHTML = '';
        priceSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const text = el.textContent.trim();
                    if (text && text.length > 0 && !priceHTML.includes(text)) {
                        // Verificar si contiene números y símbolos de moneda
                        if (/\d+[.,]\d+/.test(text) || /€|\$|£|¥/.test(text)) {
                            priceHTML += `<div class="price-element">${el.outerHTML}</div>\n`;
                        }
                    }
                });
            } catch (e) {
                // Ignorar selectores que fallen
            }
        });
        
        // Búsqueda adicional por patrones de texto para precios
        const pricePatterns = [
            /\d+[.,]\d+\s*€/g,  // 39,98€
            /€\s*\d+[.,]\d+/g,  // €39,98
            /\d+[.,]\d+\s*\$/g,  // 39.98$
            /\$\s*\d+[.,]\d+/g   // $39.98
        ];
        
        const bodyText = document.body.innerText;
        pricePatterns.forEach(pattern => {
            const matches = bodyText.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    if (!priceHTML.includes(match)) {
                        priceHTML += `<div class="price-pattern">Precio encontrado: ${match}</div>\n`;
                    }
                });
            }
        });
        
        if (priceHTML) {
            relevantHTML += `<div class="prices">${priceHTML}</div>\n`;
        }
        
        // 5. Descripción del producto - Plaza Vea específico
        const descriptionSelectors = [
            '.product-description, .description, [class*="description"], [class*="product-description"]',
            '.vtex-product-description, .product-details-description',
            '.product-info, .product-details',
            '[data-testid*="description"], [data-testid*="Description"]'
        ];
        
        let descriptionHTML = '';
        descriptionSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.textContent.trim() && !descriptionHTML.includes(el.textContent.trim())) {
                    descriptionHTML += `<div class="description-element">${el.outerHTML}</div>\n`;
                }
            });
        });
        
        if (descriptionHTML) {
            relevantHTML += `<div class="description">${descriptionHTML}</div>\n`;
        }
        
        // 6. Especificaciones técnicas - Plaza Vea específico
        const specsSelectors = [
            '.specifications, .product-specs, [class*="spec"], [class*="technical"]',
            '.vtex-product-specs, .product-details-specs',
            '.product-features, .product-attributes',
            '[data-testid*="spec"], [data-testid*="Spec"]',
            '.product-details-section, .product-info-section'
        ];
        
        let specsHTML = '';
        specsSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.textContent.trim() && !specsHTML.includes(el.textContent.trim())) {
                    specsHTML += `<div class="specs-element">${el.outerHTML}</div>\n`;
                }
            });
        });
        
        if (specsHTML) {
            relevantHTML += `<div class="specifications">${specsHTML}</div>\n`;
        }
        
        // 7. Información de stock/disponibilidad - Plaza Vea específico
        const availabilitySelectors = [
            '.stock, .availability, [class*="stock"], [class*="availability"]',
            '.vtex-product-availability, .product-stock',
            '.product-status, .inventory-status',
            '[data-testid*="stock"], [data-testid*="Stock"]',
            '.product-availability, .stock-status'
        ];
        
        let availabilityHTML = '';
        availabilitySelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.textContent.trim() && !availabilityHTML.includes(el.textContent.trim())) {
                    availabilityHTML += `<div class="availability-element">${el.outerHTML}</div>\n`;
                }
            });
        });
        
        if (availabilityHTML) {
            relevantHTML += `<div class="availability">${availabilityHTML}</div>\n`;
        }
        
        // 8. SKU o código del producto - Plaza Vea específico
        const skuSelectors = [
            '.sku, .product-code, [class*="sku"], [class*="code"]',
            '.vtex-product-sku, .product-details-sku',
            '.product-id, .item-id',
            '[data-testid*="sku"], [data-testid*="SKU"]',
            '.product-reference, .reference-number'
        ];
        
        let skuHTML = '';
        skuSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.textContent.trim() && !skuHTML.includes(el.textContent.trim())) {
                    skuHTML += `<div class="sku-element">${el.outerHTML}</div>\n`;
                }
            });
        });
        
        if (skuHTML) {
            relevantHTML += `<div class="sku">${skuHTML}</div>\n`;
        }
        
        // 9. Categorías y tags - Selectores genéricos para e-commerce
        const categorySelectors = [
            // Selectores genéricos
            '.categories, .tags, [class*="category"], [class*="tag"]',
            '.product-categories, .product-details-categories',
            '.product-tags, .product-labels',
            '[data-testid*="category"], [data-testid*="Category"]',
            // Breadcrumbs y navegación
            '.breadcrumb, .breadcrumbs, [class*="breadcrumb"]',
            'nav[aria-label*="breadcrumb"], .breadcrumb-container',
            '.category-path, .product-breadcrumb',
            // Selectores específicos para Temu
            '[class*="breadcrumb"], [class*="category"]',
            '.navigation-path, .product-navigation'
        ];
        
        let categoryHTML = '';
        categorySelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el.textContent.trim() && !categoryHTML.includes(el.textContent.trim())) {
                        categoryHTML += `<div class="category-element">${el.outerHTML}</div>\n`;
                    }
                });
            } catch (e) {
                // Ignorar selectores que fallen
            }
        });
        
        // Búsqueda adicional por patrones de texto para categorías
        const categoryPatterns = [
            /Patio[^>]*césped[^>]*jardín/gi,
            /Cortacésped[^>]*herramientas[^>]*eléctricas/gi,
            /Recortadoras[^>]*inalámbricas/gi,
            /Podadoras/gi
        ];
        
        categoryPatterns.forEach(pattern => {
            const matches = bodyText.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    if (!categoryHTML.includes(match)) {
                        categoryHTML += `<div class="category-pattern">Categoría encontrada: ${match}</div>\n`;
                    }
                });
            }
        });
        
        if (categoryHTML) {
            relevantHTML += `<div class="categories">${categoryHTML}</div>\n`;
        }
        
        // Si no se encontró nada específico, buscar en el body principal
        if (relevantHTML.length < 100) {
            const mainContent = document.querySelector('main, .main-content, .product-content, [role="main"], .vtex-product-content');
            if (mainContent) {
                relevantHTML += `<div class="main-content">${mainContent.innerHTML.substring(0, 2000)}</div>\n`;
            }
        }
        
        // 10. Búsqueda adicional en texto visible para Plaza Vea
        const additionalInfo = extractAdditionalInfo();
        if (additionalInfo) {
            relevantHTML += `<div class="additional-info">${additionalInfo}</div>\n`;
        }
        
        // 11. ⚠️ ADVERTENCIA sobre productos relacionados
        relevantHTML += `<div class="warning">⚠️ IMPORTANTE: Extraer SOLO información del PRODUCTO PRINCIPAL, NO de productos relacionados</div>\n`;
        
        console.log('🔍 Chalakoo: HTML relevante extraído:', relevantHTML.substring(0, 500));
        console.log('🔍 Chalakoo: Longitud del HTML relevante:', relevantHTML.length);
        
        return relevantHTML;
    }

    // Función para extraer información adicional del texto visible
    function extractAdditionalInfo() {
        let additionalHTML = '';
        
        // Buscar precios en el texto visible (múltiples monedas)
        const pricePatterns = [
            // Soles (Perú)
            /S\/\s*\d+[.,]\d+/g,  // S/ 319.00
            /\d+[.,]\d+\s*S\//g,  // 319.00 S/
            // Euros (Europa)
            /\d+[.,]\d+\s*€/g,    // 39,98€
            /€\s*\d+[.,]\d+/g,    // €39,98
            // Dólares (US)
            /\$\s*\d+[.,]\d+/g,   // $39.98
            /\d+[.,]\d+\s*\$/g,   // 39.98$
            // Precios con texto
            /Precio\s+(?:Regular|Online|Tarjeta)[:\s]*S\/\s*\d+[.,]\d+/gi,
            /Precio\s+(?:Regular|Online|Tarjeta)[:\s]*€\s*\d+[.,]\d+/gi,
            // Descuentos
            /-\s*\d+%/g,  // -13%, -22%
            /Descuento[:\s]*\d+%/gi,
            // PVR (Precio de Venta Recomendado)
            /PVR[:\s]*€\s*\d+[.,]\d+/gi,
            /Precio\s+PVR[:\s]*€\s*\d+[.,]\d+/gi
        ];
        
        const bodyText = document.body.innerText;
        pricePatterns.forEach(pattern => {
            const matches = bodyText.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    if (!additionalHTML.includes(match)) {
                        additionalHTML += `<div class="price-pattern">${match}</div>\n`;
                    }
                });
            }
        });
        
        // Buscar categorías en el texto visible (múltiples sitios)
        const categoryPatterns = [
            // Plaza Vea
            /Supermercado[^>]*>([^>]+)/gi,
            /Terraza\s+y\s+Aire\s+Libre/gi,
            /Parrillas?/gi,
            /Cajas?\s+Chinas?/gi,
            // Temu y sitios de jardinería
            /Patio[^>]*césped[^>]*jardín/gi,
            /Cortacésped[^>]*herramientas[^>]*eléctricas/gi,
            /Recortadoras[^>]*inalámbricas/gi,
            /Podadoras/gi,
            // Categorías generales
            /[A-Z][a-z]+[^>]*>[^>]*[A-Z][a-z]+/gi
        ];
        
        categoryPatterns.forEach(pattern => {
            const matches = bodyText.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    if (!additionalHTML.includes(match)) {
                        additionalHTML += `<div class="category-pattern">${match}</div>\n`;
                    }
                });
            }
        });
        
        // Buscar especificaciones técnicas
        const specPatterns = [
            /\d+\s*x\s*\d+\s*cm/gi,  // 31 x 48 cm
            /Capacidad[:\s]*\d+KG/gi,  // Capacidad: 6KG
            /Medidas[:\s]*\d+\s*x\s*\d+\s*x\s*\d+/gi,  // Medidas: 60 x 35 x 51
            /Parrilla[^>]*\d+\s*x\s*\d+/gi  // Parrilla 31 x 48
        ];
        
        specPatterns.forEach(pattern => {
            const matches = bodyText.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    if (!additionalHTML.includes(match)) {
                        additionalHTML += `<div class="spec-pattern">${match}</div>\n`;
                    }
                });
            }
        });
        
        return additionalHTML;
    }

    // Extraer nombre del producto
    function extractProductName() {
        // Buscar en diferentes selectores comunes
        const selectors = [
            'h1',
            '[data-testid*="title"]',
            '[class*="title"]',
            '[class*="product-name"]',
            '[class*="product-title"]',
            'h1[class*="product"]',
            '.product-name',
            '.product-title'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }

        return document.title;
    }

    // Extraer precio del producto
    function extractProductPrice() {
        const priceSelectors = [
            '[class*="price"]',
            '[class*="cost"]',
            '[data-testid*="price"]',
            '.price',
            '.cost',
            'span[class*="price"]'
        ];

        for (const selector of priceSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                const text = element.textContent.trim();
                if (text.match(/[\$€£¥]?\d+[.,]\d{2}|\d+[.,]\d{2}[\$€£¥]?/)) {
                    return text;
                }
            }
        }

        return 'Precio no encontrado';
    }

    // Extraer descripción del producto
    function extractProductDescription() {
        const descSelectors = [
            '[class*="description"]',
            '[class*="desc"]',
            '[data-testid*="description"]',
            '.description',
            '.desc',
            'meta[name="description"]'
        ];

        for (const selector of descSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                if (selector.includes('meta')) {
                    return element.getAttribute('content') || '';
                } else if (element.textContent.trim()) {
                    return element.textContent.trim().substring(0, 200) + '...';
                }
            }
        }

        return 'Descripción no encontrada';
    }

    // Extraer imágenes del producto
    function extractProductImages() {
        const imageSelectors = [
            'img[class*="product"]',
            'img[class*="main"]',
            'img[alt*="product"]',
            'img[alt*="main"]',
            '.product-image img',
            '.main-image img'
        ];

        const images = [];
        for (const selector of imageSelectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(img => {
                if (img.src && img.src.startsWith('http')) {
                    images.push({
                        src: img.src,
                        alt: img.alt || 'Producto'
                    });
                }
            });
        }

        return images.slice(0, 3); // Máximo 3 imágenes
    }

    // Extraer disponibilidad del producto
    function extractProductAvailability() {
        const availabilitySelectors = [
            '[class*="stock"]',
            '[class*="availability"]',
            '[class*="inventory"]',
            '.stock',
            '.availability'
        ];

        for (const selector of availabilitySelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }

        return 'Disponibilidad no especificada';
    }

    // Escuchar mensajes del popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractProductInfo') {
            try {
                const productInfo = extractProductInfo();
                sendResponse({ success: true, data: productInfo });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        }
        return true; // Mantener el mensaje activo para respuesta asíncrona
    });

    // Notificar que el content script está cargado
    console.log('Chalakoo content script cargado en:', window.location.href);
})();
