# Proyecto de Ejemplo MongoDB TTL (Time-To-Live)

## Descripción del Proyecto

Este proyecto demuestra la funcionalidad TTL (Time-To-Live) de MongoDB utilizando un conjunto de datos realista del historial de transacciones de tarjetas. El objetivo es crear un entorno de prueba a gran escala para observar cómo MongoDB elimina automáticamente documentos basándose en un campo TTL, y medir las características de rendimiento de este proceso de eliminación. Los documentos están configurados para expirar 5 minutos después de la inserción, permitiendo la observación en tiempo real del proceso de eliminación TTL.

## Lo que Construimos

### Estructura de la Base de Datos
- **Base de Datos**: `yape-ttl-sample`
- **Colección**: `cardHistory` 
- **Tamaño del Documento**: ~1KB por documento
- **Total de Documentos**: 2.5 millones de registros

### Características Principales
1. **Índice TTL**: Los documentos expiran automáticamente basándose en el campo `remove_at`
2. **Datos Realistas**: Cada documento contiene metadatos completos de transacciones de tarjetas
4. **Herramientas de Monitoreo**: Scripts para rastrear el progreso de eliminación TTL

### Esquema del Documento
```javascript
{
  remove_at: Date,           // Campo TTL - documentos expiran 5 minutos después de inserción
  cardId: String,           // Identificador único de tarjeta
  action: String,           // Tipo de acción de transacción
  timestamp: Date,          // Cuándo ocurrió la acción
  metadata: {               // Datos ricos de transacción (~1KB total)
    amount: Number,
    currency: String,
    merchant: String,
    location: Object,
    paymentMethod: Object,
    transaction: Object,
    device: Object,
    additionalData: Object
  }
}
```

## Archivos del Proyecto

### Scripts Principales
- `setup-mongo.js` - Configuración inicial de base de datos y colección con índice TTL
- `test-insert.js` - Inserción de prueba pequeña (1,000 documentos) para validación
- `bulk-insert.js` - Script principal de inserción masiva (2.5M documentos)

### Herramientas de Monitoreo
- `monitor-ttl-deletion.sh` - Monitoreo en tiempo real de eliminación de documentos

### Infraestructura
- `docker-compose.yml` - Contenedores de MongoDB y Mongo Express
- `README.md` - Esta documentación

## Prerrequisitos

1. **Docker & Docker Compose** - Para ejecutar MongoDB y Mongo Express
2. **MongoDB Shell (mongosh)** - Para ejecutar scripts
   ```bash
   brew install mongosh  # macOS con Homebrew
   ```

## Instrucciones de Configuración

### 1. Iniciar la Base de Datos
```bash
cd /ruta/al/proyecto
docker-compose up -d
```

Esto inicia:
- **MongoDB**: `localhost:27017` (admin/password123)
- **Mongo Express**: `http://localhost:8081` (admin/admin123)

### 2. Inicializar la Base de Datos
```bash
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin setup-mongo.js
```

### 3. Probar con Conjunto de Datos Pequeño (Opcional)
```bash
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin test-insert.js
```

### 4. Ejecutar Inserción Masiva Completa
```bash
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin bulk-insert.js
```

## Configuración TTL

### Configuraciones de Expiración
- **Campo TTL**: `remove_at`
- **Tiempo de Expiración**: Configurado a 5 minutos desde el momento de ejecución del script
- **Índice TTL**: `expireAfterSeconds: 0` (documentos expiran exactamente en el tiempo `remove_at`)

### Comportamiento TTL de MongoDB
- La tarea en segundo plano TTL se ejecuta aproximadamente cada 60 segundos
- El tiempo de eliminación depende del tamaño de la colección y la carga del servidor
- Las colecciones grandes (2.5M docs) pueden tomar varios minutos para limpiarse completamente después del tiempo de expiración TTL
- **Prueba Rápida**: Con expiración de 5 minutos, puedes observar el proceso de eliminación en tiempo real

## Monitoreo de Eliminación TTL

### Monitoreo en Tiempo Real
```bash
chmod +x monitor-ttl-deletion.sh
./monitor-ttl-deletion.sh
```

**Nota**: Con expiración de 5 minutos, inicia el monitoreo inmediatamente después de ejecutar la inserción masiva para observar el proceso de eliminación en tiempo real.

### Verificación Manual de Conteo
```bash
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin --eval "db.cardHistory.countDocuments()"
```

## Características de Rendimiento

### Rendimiento de Eliminación
- **Frecuencia de Verificación TTL**: Cada ~60 segundos
- **Tasa de Eliminación**: Varía significativamente basándose en:
  - Tamaño y complejidad del documento
  - Recursos del sistema disponibles
  - Otras operaciones de base de datos
  - Configuración del motor de almacenamiento

## Interfaz Web

Accede a Mongo Express en `http://localhost:8081` para:
- Ver la base de datos `yape-ttl-sample`
- Navegar la colección `cardHistory`
- Monitorear conteos de documentos en tiempo real
- Examinar estructura de documentos e índices

## Casos de Uso

Este proyecto es útil para:
1. **Pruebas de Rendimiento TTL** - Entender tasas de eliminación a escala con respuesta rápida (expiración de 5 minutos)
2. **Planificación de Capacidad de Base de Datos** - Probar uso de almacenamiento y memoria
3. **Aprendizaje de MongoDB** - Experiencia práctica con índices TTL y observación de eliminación en tiempo real
4. **Validación de Estrategia de Limpieza** - Probar políticas automatizadas de retención de datos con retroalimentación inmediata

## Resumen de Inicio Rápido

```bash
# 1. Iniciar contenedores
docker-compose up -d

# 2. Configurar base de datos
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin setup-mongo.js

# 3. Ejecutar inserción masiva (documentos expirarán en 5 minutos)
mongosh mongodb://admin:password123@localhost:27017/yape-ttl-sample --authenticationDatabase admin bulk-insert.js

# 4. Monitorear eliminación TTL (en otra terminal - ¡iniciar inmediatamente!)
./monitor-ttl-deletion.sh

# 5. Ver en navegador
open http://localhost:8081
```

Este proyecto proporciona un entorno completo para entender y probar la funcionalidad TTL de MongoDB a escala, con expiración rápida de 5 minutos para observación en tiempo real.
