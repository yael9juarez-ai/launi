# UniEats - Sistema de Gestión de Cafetería UNI

Este proyecto es una aplicación web full-stack construida con **Next.js 15**, **Firebase** y **Genkit AI**. A continuación, se detalla la estructura necesaria para la creación de tus diagramas.

## 1. Estructura de Paquetes (Arquitectura)

- **`src/app` (Capa de Presentación / Routing)**:
    - `layout.tsx`: Layout raíz que inyecta los proveedores globales.
    - `login/`: Gestión de autenticación y perfiles (Admin, Alumno, Cocinero).
    - `client/menu/`: Vista principal del alumno (Carrito, Upselling AI, Ticket Virtual).
    - `admin/dashboard/`: Panel de control financiero y reportes.
    - `admin/menu/`: CRUD de productos y gestión de recetas vinculadas al inventario.
    - `admin/inventory/`: Control de stock de insumos en tiempo real.
    - `admin/kitchen/`: Panel de producción para cocineros (Flujo de pedidos).
    - `admin/pos/`: Punto de venta para cobro manual en caja.
    - `queue/`: Monitor público de estatus de pedidos.

- **`src/firebase` (Capa de Datos y Servicios)**:
    - `provider.tsx`: Proveedor de contexto para Auth y Firestore.
    - `firestore/`: Hooks personalizados (`useCollection`, `useDoc`) para sincronización en tiempo real.
    - `non-blocking-updates.tsx`: Funciones de mutación optimistas para la base de datos.

- **`src/ai` (Capa de Inteligencia Artifical - Genkit)**:
    - `flows/`: Lógica de negocio avanzada (Recomendaciones, Pronóstico de Inventario, Análisis de Ventas).

- **`src/lib` (Capa de Utilidades y Tipos)**:
    - `data.ts`: Definición de interfaces y datos semilla.
    - `utils.ts`: Funciones auxiliares de estilo.

## 2. Diagrama de Clases (Entidades Principales)

Estas son las interfaces de datos (modelos) que definen el sistema:

### `User`
- `id`: string
- `displayName`: string
- `role`: 'admin' | 'cocinero' | 'alumno'
- `email`: string

### `MenuItem` (Producto del Menú)
- `id`: string
- `name`: string
- `price`: number
- `category`: 'Comida' | 'Bebidas' | 'Golosinas'
- `unit`: 'pza' | 'kg' | 'ml' | 'orden'
- `recipe`: `RecipeItem[]`
- `imageUrl`: string

### `Ingredient` (Insumo/Almacén)
- `id`: string
- `name`: string
- `currentStock`: number
- `minStockLevel`: number
- `unitOfMeasure`: string

### `Order` (Pedido)
- `id`: string
- `userId`: string
- `items`: `OrderItem[]`
- `totalAmount`: number
- `status`: 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Picked Up'
- `method`: 'cash' | 'transfer'
- `isRated`: boolean

## 3. Relaciones Clave para Diagramas
1. **Composición**: Un `MenuItem` tiene una `Recipe` compuesta por múltiples `Ingredients`.
2. **Asociación**: Un `User` crea múltiples `Orders`.
3. **Flujo**: Una `Order` cambia de estado a través del panel de `Kitchen` y afecta el stock de `Ingredients`.
