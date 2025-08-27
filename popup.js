document.addEventListener('DOMContentLoaded', function() {
    const getInfoBtn = document.getElementById('getInfoBtn');
    const processWithAIBtn = document.getElementById('processWithAIBtn');
    const infoContainer = document.getElementById('infoContainer');
    const pageTitle = document.getElementById('pageTitle');
    const pageUrl = document.getElementById('pageUrl');
    const saveToCartBtn = document.getElementById('saveToCartBtn');
    const cartItems = document.getElementById('cartItems');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelSelect = document.getElementById('modelSelect');
    const aiResults = document.getElementById('aiResults');
    const aiResultsContent = document.getElementById('aiResultsContent');
    const aiDetailedResults = document.getElementById('aiDetailedResults'); // Added this line

    let currentTabInfo = null;
    let currentProductData = null;
    let aiService = new AIService();

    // Cargar items del carrito al abrir el popup
        loadCartItems();
    
    // Cargar configuración guardada
    loadAIConfig();
    // Configurar API key cuando cambie
    apiKeyInput.addEventListener('input', function() {
        aiService.setApiKey(this.value);
        saveAIConfig();
    });

    // Configurar modelo cuando cambie
    modelSelect.addEventListener('change', function() {
        aiService.setModel(this.value);
        saveAIConfig();
    });

    async function loadAIConfig() {
        try {
            const result = await chrome.storage.local.get(['aiApiKey', 'aiModel']);
            if (result.aiApiKey) {
                apiKeyInput.value = result.aiApiKey;
                aiService.setApiKey(result.aiApiKey);
            }
            if (result.aiModel) {
                modelSelect.value = result.aiModel;
                aiService.setModel(result.aiModel);
            }
        } catch (error) {
            console.error('Error cargando configuración de IA:', error);
        }
    }

    async function saveAIConfig() {
        try {
            await chrome.storage.local.set({
                aiApiKey: apiKeyInput.value,
                aiModel: modelSelect.value
            });
        } catch (error) {
            console.error('Error guardando configuración de IA:', error);
        }
    }

    getInfoBtn.addEventListener('click', async function() {
        try {
            // Obtener la pestaña activa
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab) {
                // Guardar información de la pestaña actual
                currentTabInfo = {
                    title: tab.title || 'Sin título',
                    url: tab.url || 'Sin URL'
                };
                
                // Mostrar la información
                pageTitle.textContent = currentTabInfo.title;
                pageUrl.textContent = currentTabInfo.url;
                
                // Mostrar el contenedor de información
                infoContainer.classList.remove('hidden');
                
                // Cambiar el texto del botón temporalmente
                const originalText = getInfoBtn.textContent;
                getInfoBtn.textContent = '¡Info obtenida!';
                getInfoBtn.style.background = 'linear-gradient(45deg, #00b894, #00a085)';
                
                // Restaurar el botón después de 2 segundos
                setTimeout(() => {
                    getInfoBtn.textContent = originalText;
                    getInfoBtn.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a24)';
                }, 2000);
                
            } else {
                throw new Error('No se pudo obtener la información de la pestaña');
            }
            
        } catch (error) {
            console.error('Error al obtener información:', error);
            
            // Mostrar mensaje de error
            pageTitle.textContent = 'Error al obtener información';
            pageUrl.textContent = error.message;
            infoContainer.classList.remove('hidden');
            
            // Cambiar el texto del botón temporalmente
            const originalText = getInfoBtn.textContent;
            getInfoBtn.textContent = 'Error - Reintentar';
            getInfoBtn.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
            
            // Restaurar el botón después de 3 segundos
            setTimeout(() => {
                getInfoBtn.textContent = originalText;
                getInfoBtn.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a24)';
            }, 3000);
        }
    });

    // Procesar con IA
    processWithAIBtn.addEventListener('click', async function() {
        try {
            if (!aiService.isConfigured()) {
                showMessage('Por favor, configura tu API key de OpenRouter primero', 'error');
                return;
            }

            // Cambiar estado del botón
            const originalText = processWithAIBtn.textContent;
            processWithAIBtn.textContent = '🔄 Procesando...';
            processWithAIBtn.disabled = true;

            // Obtener la pestaña activa
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No se pudo obtener la información de la pestaña');
            }

            // Extraer información del producto usando el content script
            const productData = await extractProductInfoFromTab(tab.id);
            currentProductData = productData;

            // Procesar con IA
            const aiResult = await aiService.processProductInfo(productData);
            
            // Mostrar resultados
            displayAIResults(aiResult);
            
            // Restaurar botón
            processWithAIBtn.textContent = originalText;
            processWithAIBtn.disabled = false;
            
            showMessage('¡Producto procesado con IA exitosamente!', 'success');
            
        } catch (error) {
            console.error('Error procesando con IA:', error);
            showMessage(`Error: ${error.message}`, 'error');
            
            // Restaurar botón
            processWithAIBtn.textContent = '🤖 Procesar con IA';
            processWithAIBtn.disabled = false;
        }
    });

    // Extraer información del producto desde la pestaña
    async function extractProductInfoFromTab(tabId) {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { action: 'extractProductInfo' }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error('No se pudo comunicar con la página. Asegúrate de estar en una página web válida.'));
                    return;
                }
                
                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response?.error || 'Error al extraer información del producto'));
                }
            });
        });
    }

    // Mostrar resultados de IA
    function displayAIResults(aiResult) {
        // Información principal mejorada
        aiResultsContent.innerHTML = `
            <div class="ai-result-item">
                <div class="ai-result-label">Nombre del producto:</div>
                <div class="ai-result-value">${aiResult.productName || 'No determinado'}</div>
            </div>
            <div class="ai-result-item">
                <div class="ai-result-label">Precio actual:</div>
                <div class="ai-result-value">${aiResult.currentPrice || 'No determinado'}</div>
            </div>
            ${aiResult.originalPrice && aiResult.originalPrice !== 'No disponible' ? `
            <div class="ai-result-item">
                <div class="ai-result-label">Precio original:</div>
                <div class="ai-result-value">${aiResult.originalPrice}</div>
            </div>` : ''}
            ${aiResult.discounts && aiResult.discounts.length > 0 ? `
            <div class="ai-result-item">
                <div class="ai-result-label">Descuentos:</div>
                <div class="ai-result-value">${aiResult.discounts.join(', ')}</div>
            </div>` : ''}
            <div class="ai-result-item">
                <div class="ai-result-label">Categoría:</div>
                <div class="ai-result-value">${aiResult.category || 'No determinada'}</div>
            </div>
            <div class="ai-result-item">
                <div class="ai-result-label">Descripción:</div>
                <div class="ai-result-value">${aiResult.description || 'No disponible'}</div>
            </div>
            ${aiResult.specifications && aiResult.specifications !== 'No disponible' ? `
            <div class="ai-result-item">
                <div class="ai-result-label">Especificaciones:</div>
                <div class="ai-result-value">${aiResult.specifications}</div>
            </div>` : ''}
            ${aiResult.availability && aiResult.availability !== 'No disponible' ? `
            <div class="ai-result-item">
                <div class="ai-result-label">Disponibilidad:</div>
                <div class="ai-result-value">${aiResult.availability}</div>
            </div>` : ''}
            ${aiResult.sku && aiResult.sku !== 'No disponible' ? `
            <div class="ai-result-item">
                <div class="ai-result-label">SKU:</div>
                <div class="ai-result-value">${aiResult.sku}</div>
            </div>` : ''}
        `;
        
        // Ocultar la sección detallada ya que no la necesitamos
        aiDetailedResults.classList.add('hidden');
        
        aiResults.classList.remove('hidden');
    }

    // Guardar item en el carrito
    saveToCartBtn.addEventListener('click', function() {
        if (currentTabInfo) {
            // Si tenemos datos de IA, usarlos para guardar información más detallada
            if (currentProductData && currentProductData.aiResult) {
                saveToCartWithAI(currentProductData);
            } else {
                saveToCart(currentTabInfo);
            }
        } else {
            showMessage('Primero obtén la información de la página', 'error');
        }
    });

    // Limpiar todo el carrito
    clearCartBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el carrito?')) {
            clearCart();
        }
    });

    // Función para guardar en el carrito con información de IA
    async function saveToCartWithAI(productData) {
        try {
            const aiResult = productData.aiResult;
            const newItem = {
                id: Date.now().toString(),
                title: aiResult.productName || productData.title,
                url: productData.url,
                price: aiResult.currentPrice,
                originalPrice: aiResult.originalPrice,
                discounts: aiResult.discounts || [],
                category: aiResult.category,
                description: aiResult.description,
                date: new Date().toLocaleString('es-ES'),
                aiProcessed: true
            };

            // Obtener items existentes
            const result = await chrome.storage.local.get(['cartItems']);
            const existingItems = result.cartItems || [];
            
            // Verificar si ya existe un item con la misma URL
            const existingIndex = existingItems.findIndex(item => item.url === newItem.url);
            if (existingIndex !== -1) {
                // Actualizar item existente
                existingItems[existingIndex] = newItem;
                showMessage('Item actualizado en el carrito', 'success');
            } else {
                // Agregar nuevo item
                existingItems.push(newItem);
                showMessage('Item guardado en el carrito', 'success');
            }

            // Guardar en storage
            await chrome.storage.local.set({ cartItems: existingItems });
            
            // Recargar la lista
            loadCartItems();
            
        } catch (error) {
            console.error('Error al guardar en el carrito:', error);
            showMessage('Error al guardar en el carrito', 'error');
        }
    }

    // Función para guardar en el carrito
    async function saveToCart(itemInfo) {
        try {
            const newItem = {
                id: Date.now().toString(),
                title: itemInfo.title,
                url: itemInfo.url,
                date: new Date().toLocaleString('es-ES'),
                aiProcessed: false
            };

            // Obtener items existentes
            const result = await chrome.storage.local.get(['cartItems']);
            const existingItems = result.cartItems || [];
            
            // Verificar si ya existe un item con la misma URL
            const existingIndex = existingItems.findIndex(item => item.url === newItem.url);
            if (existingIndex !== -1) {
                // Actualizar item existente
                existingItems[existingIndex] = newItem;
                showMessage('Item actualizado en el carrito', 'success');
            } else {
                // Agregar nuevo item
                existingItems.push(newItem);
                showMessage('Item guardado en el carrito', 'success');
            }

            // Guardar en storage
            await chrome.storage.local.set({ cartItems: existingItems });
            
            // Recargar la lista
            loadCartItems();
            
        } catch (error) {
            console.error('Error al guardar en el carrito:', error);
            showMessage('Error al guardar en el carrito', 'error');
        }
    }

    // Función para cargar items del carrito
    async function loadCartItems() {
        try {
            const result = await chrome.storage.local.get(['cartItems']);
            const items = result.cartItems || [];
            
            if (items.length === 0) {
                cartItems.innerHTML = '<div class="empty-cart">No hay items guardados</div>';
                return;
            }

            // Ordenar por fecha (más reciente primero)
            items.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            cartItems.innerHTML = items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <button class="cart-item-delete" onclick="deleteCartItem('${item.id}')">×</button>
                    <div class="cart-item-title">${item.title}</div>
                    ${item.price ? `<div class="cart-item-price">💰 ${item.price}</div>` : ''}
                    ${item.originalPrice && item.originalPrice !== 'No disponible' ? `<div class="cart-item-original-price">💸 ${item.originalPrice}</div>` : ''}
                    ${item.discounts && item.discounts.length > 0 ? `<div class="cart-item-discounts">🎯 ${item.discounts.join(', ')}</div>` : ''}
                    ${item.category ? `<div class="cart-item-category">📂 ${item.category}</div>` : ''}
                    <div class="cart-item-url">${item.url}</div>
                    <div class="cart-item-date">${item.date}</div>
                    ${item.aiProcessed ? '<div class="ai-badge">🤖 IA</div>' : ''}
                </div>
            `).join('');

        } catch (error) {
            console.error('Error al cargar items del carrito:', error);
            cartItems.innerHTML = '<div class="empty-cart">Error al cargar items</div>';
        }
    }

    // Función para eliminar un item específico
    window.deleteCartItem = async function(itemId) {
        try {
            const result = await chrome.storage.local.get(['cartItems']);
            const items = result.cartItems || [];
            
            const filteredItems = items.filter(item => item.id !== itemId);
            await chrome.storage.local.set({ cartItems: filteredItems });
            
            showMessage('Item eliminado del carrito', 'success');
            loadCartItems();
            
        } catch (error) {
            console.error('Error al eliminar item:', error);
            showMessage('Error al eliminar item', 'error');
        }
    };

    // Función para limpiar todo el carrito
    async function clearCart() {
        try {
            await chrome.storage.local.remove(['cartItems']);
            showMessage('Carrito limpiado', 'success');
            loadCartItems();
            
        } catch (error) {
            console.error('Error al limpiar carrito:', error);
            showMessage('Error al limpiar carrito', 'error');
        }
    }

    // Función para mostrar mensajes
    function showMessage(message, type = 'success') {
        // Remover mensajes existentes
        const existingMessage = document.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Crear nuevo mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        messageDiv.textContent = message;

        // Insertar después del botón de guardar
        saveToCartBtn.parentNode.insertBefore(messageDiv, saveToCartBtn.nextSibling);

        // Remover mensaje después de 3 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
});