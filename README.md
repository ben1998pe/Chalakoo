# 🦊 Chalakoo - Chrome Extension

Una extensión de Chrome que permite obtener información de la página web activa y guardar items en un mini-carrito local con persistencia, **ahora potenciada con Inteligencia Artificial**.

## ✨ Características

### 🔍 Extracción de Información
- **Información básica**: Título y URL de la página activa
- **Extracción inteligente**: Análisis automático de contenido de productos
- **Content Script**: Acceso directo al DOM de la página web

### 🤖 Procesamiento con IA (OpenRouter)
- **Análisis inteligente**: Procesamiento del HTML completo con modelos de IA
- **Extracción estructurada**: Información del producto organizada y categorizada
- **Múltiples modelos**: Soporte para Claude, GPT, Llama, Gemini y más
- **Configuración flexible**: Selección de modelo y API key personalizable

### 🛒 Mini-Carrito Local
- **Persistencia**: Almacenamiento local con Chrome Storage API
- **Información enriquecida**: Datos del producto procesados por IA
- **Gestión completa**: Agregar, eliminar y limpiar items
- **Historial**: Ordenamiento por fecha de captura

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/ben1998pe/Chalakoo.git
cd Chalakoo
```

### 2. Instalar en Chrome
1. Abrir Chrome y navegar a `chrome://extensions/`
2. Activar el "Modo desarrollador"
3. Hacer clic en "Cargar extensión sin empaquetar"
4. Seleccionar la carpeta del proyecto

## ⚙️ Configuración

### API Key de OpenRouter
1. Obtener una API key en [OpenRouter](https://openrouter.ai/)
2. Abrir la extensión y pegar la API key en el campo correspondiente
3. Seleccionar el modelo de IA preferido

### Modelos Disponibles
- **Claude 3.5 Sonnet** (recomendado)
- **Claude 3 Haiku**
- **GPT-4o**
- **GPT-3.5 Turbo**
- **Llama 3.1 8B**
- **Gemini Pro**

## 📱 Uso

### 1. Obtener Información Básica
- Hacer clic en "📄 Obtener info de la página"
- La extensión extraerá título y URL de la página activa

### 2. Procesar con IA
- Hacer clic en "🤖 Procesar con IA"
- La extensión analizará el HTML completo de la página
- Se mostrarán los resultados estructurados del análisis

### 3. Guardar en Carrito
- Hacer clic en "💾 Guardar en carrito"
- El item se guardará con toda la información extraída
- Los items procesados por IA incluyen datos enriquecidos

## 🔧 Estructura del Proyecto

```
chalakoo/
├── manifest.json          # Configuración de la extensión
├── popup.html            # Interfaz principal
├── popup.js              # Lógica del popup
├── content.js            # Script de contenido (extracción)
├── ai-service.js         # Servicio de IA (OpenRouter)
├── icon.png              # Icono de la extensión
├── icon.svg              # Icono vectorial
├── .gitignore            # Archivos a ignorar
└── README.md             # Documentación
```

## 🌟 Funcionalidades de IA

### Extracción Inteligente
- **Análisis semántico** del contenido HTML
- **Identificación automática** de productos
- **Extracción de metadatos** estructurados
- **Clasificación inteligente** de contenido

### Datos Procesados
- Nombre del producto
- Precio y disponibilidad
- Descripción detallada
- Categoría y marca
- Características clave
- Valoraciones y reviews
- Imágenes principales
- Nivel de confianza del análisis

## 🔒 Permisos

La extensión requiere los siguientes permisos:
- `activeTab`: Acceso a la pestaña activa
- `scripting`: Ejecución de scripts en páginas
- `storage`: Almacenamiento local de datos
- `tabs`: Acceso a información de pestañas
- `host_permissions`: Acceso a contenido de páginas web

## 🛠️ Desarrollo

### Tecnologías Utilizadas
- **HTML5**: Estructura de la interfaz
- **CSS3**: Estilos y animaciones
- **JavaScript ES6+**: Lógica de la extensión
- **Chrome Extensions API**: Funcionalidades nativas
- **OpenRouter API**: Procesamiento con IA

### Personalización
- Modificar estilos en `popup.html`
- Ajustar lógica en `popup.js`
- Personalizar extracción en `content.js`
- Configurar modelos de IA en `ai-service.js`

## 📊 Características del Carrito

### Información Básica
- Título del producto
- URL de la página
- Fecha de captura
- Estado de procesamiento

### Información Enriquecida (IA)
- Precio del producto
- Categoría
- Marca
- Descripción detallada
- Badge de procesamiento por IA

## 🔮 Futuras Mejoras

- [ ] Exportación de datos (CSV, JSON)
- [ ] Sincronización en la nube
- [ ] Análisis de precios históricos
- [ ] Comparación de productos
- [ ] Notificaciones de cambios
- [ ] Integración con más APIs de IA

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
- Abrir un issue en GitHub
- Revisar la documentación
- Verificar la configuración de la API key

---

**Desarrollado con ❤️ para hacer la extracción de información web más inteligente y eficiente.**

