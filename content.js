// Content script para extraer información de la página
(function() {
    'use strict';

    // Función para extraer información del producto de la página
    function extractProductInfo() {
        const pageInfo = {
            url: window.location.href,
            title: document.title,
            html: document.documentElement.outerHTML,
            timestamp: new Date().toISOString()
        };

        // Intentar extraer información básica del producto
        const productInfo = {
            name: extractProductName(),
            price: extractProductPrice(),
            description: extractProductDescription(),
            images: extractProductImages(),
            availability: extractProductAvailability()
        };

        return {
            ...pageInfo,
            productInfo
        };
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
