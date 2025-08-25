document.addEventListener('DOMContentLoaded', function() {
    const getInfoBtn = document.getElementById('getInfoBtn');
    const infoContainer = document.getElementById('infoContainer');
    const pageTitle = document.getElementById('pageTitle');
    const pageUrl = document.getElementById('pageUrl');
    const saveToCartBtn = document.getElementById('saveToCartBtn');
    const cartItems = document.getElementById('cartItems');
    const clearCartBtn = document.getElementById('clearCartBtn');

    let currentTabInfo = null;

    // Cargar items del carrito al abrir el popup
    loadCartItems();

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

    // Guardar item en el carrito
    saveToCartBtn.addEventListener('click', function() {
        if (currentTabInfo) {
            saveToCart(currentTabInfo);
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

    // Función para guardar en el carrito
    async function saveToCart(itemInfo) {
        try {
            const newItem = {
                id: Date.now().toString(),
                title: itemInfo.title,
                url: itemInfo.url,
                date: new Date().toLocaleString('es-ES')
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
                    <div class="cart-item-url">${item.url}</div>
                    <div class="cart-item-date">${item.date}</div>
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
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Crear nuevo mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        
        if (type === 'error') {
            messageDiv.style.background = 'rgba(231, 76, 60, 0.2)';
            messageDiv.style.borderColor = '#e74c3c';
            messageDiv.style.color = '#e74c3c';
        }

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

