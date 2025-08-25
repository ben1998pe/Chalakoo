# 🦊 Chalakoo Test v2.0 - Extensión de Chrome

Una extensión de Chrome que permite obtener información de la página web activa y guardar items en un mini-carrito local con persistencia.

## 📋 Características

- **Manifest V3**: Compatible con las últimas versiones de Chrome
- **Interfaz moderna**: Diseño atractivo con gradientes y efectos visuales
- **Funcionalidad principal**: Obtiene el título y URL de la pestaña activa
- **Mini-carrito local**: Guarda, lista y elimina items con persistencia
- **Sin background scripts**: Solo usa los permisos necesarios

## 🚀 Instalación

### Opción 1: Instalación desde archivos (Recomendado para desarrollo)

1. Descarga o clona este repositorio en tu computadora
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo desarrollador" en la esquina superior derecha
4. Haz clic en "Cargar descomprimida"
5. Selecciona la carpeta que contiene estos archivos
6. ¡Listo! La extensión aparecerá en tu barra de herramientas

### Opción 2: Instalación desde Chrome Web Store (Cuando esté disponible)

1. Busca "Chalakoo Test" en la Chrome Web Store
2. Haz clic en "Agregar a Chrome"
3. Confirma la instalación

## 📁 Estructura de archivos

```
chalakoo-test/
├── manifest.json      # Configuración de la extensión
├── popup.html        # Interfaz del popup
├── popup.js          # Lógica de la extensión
├── icon.png          # Icono de la extensión
└── README.md         # Este archivo
```

## 🎯 Uso

### Funcionalidad principal:
1. Haz clic en el icono de la extensión en la barra de herramientas
2. Se abrirá un popup con un botón "Obtener info de la página"
3. Haz clic en el botón para capturar la información de la pestaña activa
4. Se mostrará el título y la URL de la página actual

### Mini-carrito local:
1. Después de obtener la información de una página, haz clic en "💾 Guardar en carrito"
2. El item se guardará con título, URL y fecha de guardado
3. Los items se muestran en la sección "🛒 Mini-carrito local"
4. Puedes eliminar items individuales con el botón "×" o limpiar todo el carrito
5. Los datos persisten incluso después de cerrar el navegador

## ⚙️ Permisos utilizados

- **`activeTab`**: Acceso a la pestaña activa cuando se hace clic en la extensión
- **`scripting`**: Permite ejecutar scripts en la pestaña activa (aunque no se usa en esta versión)
- **`storage`**: Permite guardar y recuperar datos localmente con persistencia

## 🔧 Personalización

Puedes personalizar la extensión editando:

- **`popup.html`**: Cambiar el diseño y estructura del popup
- **`popup.js`**: Modificar la lógica y funcionalidad
- **`icon.png`**: Reemplazar el icono por uno personalizado
- **`manifest.json`**: Cambiar nombre, versión, descripción, etc.

## 🐛 Solución de problemas

### La extensión no aparece
- Verifica que el "Modo desarrollador" esté activado
- Asegúrate de que todos los archivos estén en la misma carpeta
- Revisa la consola de Chrome para errores

### No se obtiene información
- Verifica que la página web no esté bloqueando el acceso
- Asegúrate de que la extensión tenga permisos para la página actual

### Error de permisos
- Verifica que el `manifest.json` tenga la sintaxis correcta
- Asegúrate de que solo uses los permisos `activeTab` y `scripting`

## 📝 Notas técnicas

- **Manifest V3**: Esta extensión usa la versión más reciente del manifiesto de Chrome
- **Sin background scripts**: No se ejecuta código en segundo plano
- **Permisos mínimos**: Solo solicita los permisos absolutamente necesarios
- **Persistencia local**: Usa `chrome.storage.local` para guardar datos permanentemente
- **Compatibilidad**: Funciona en Chrome 88+ y navegadores basados en Chromium

## 🤝 Contribuciones

Si quieres contribuir a este proyecto:

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de solución de problemas
2. Busca en los issues del repositorio
3. Abre un nuevo issue con detalles del problema

---

**Desarrollado con ❤️ para la comunidad de Chrome**

