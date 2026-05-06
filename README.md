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

## 2. Diagrama de Clases (Entidades Principales)

### `User`
- `id`: string
- `displayName`: string
- `role`: 'admin' | 'cocinero' | 'alumno'

### `MenuItem`
- `id`: string
- `name`: string
- `price`: number
- `recipe`: `RecipeItem[]` (Vínculo con Ingredients)
- `unit`: string (pza, kg, etc.)

### `Ingredient`
- `id`: string
- `name`: string
- `currentStock`: number
- `minStockLevel`: number

### `Order`
- `id`: string
- `status`: 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Picked Up'
- `method`: 'cash' | 'transfer'
- `items`: `OrderItem[]`

## 3. Arquitectura de Procesos (Para Diagramas de Flujo)

### A. Flujo de Pedido y Venta (Venta Ciclo de Vida)
1. **Inicio**: El Alumno selecciona productos. El sistema valida stock en tiempo real consultando `ingredients`.
2. **Selección de Pago**:
    - **Efectivo**: El pedido queda en `Pending`. El Admin debe buscarlo en el Dashboard y presionar "Confirmar Pago".
    - **Transferencia**: El Alumno visualiza QR/CLABE, realiza el pago y envía comprobante. El Admin confirma en sistema.
3. **Producción**: Una vez pagado, el estado cambia a `Preparing`. Aparece automáticamente en el panel de `Kitchen`.
4. **Finalización**: El Cocinero marca como `Ready for Pickup`. El sistema notifica al Monitor Público (`Queue`).
5. **Entrega**: El Alumno muestra su Ticket Virtual. El Cocinero marca como `Picked Up`.

### B. Proceso de Gestión de Inventario (Descuento Automático)
1. Al confirmar una venta (`Order`), el sistema itera sobre el arreglo `recipe` de cada `MenuItem` vendido.
2. Por cada ingrediente, ejecuta una resta: `currentStock = currentStock - (cantidad_receta * cantidad_pedida)`.
3. Si un ingrediente llega a su `minStockLevel`, el sistema resalta el ítem en el panel de Inventario y lo bloquea en el Menú del Alumno si no hay suficiente para una ración completa.

### C. Proceso de Inteligencia Artificial (Upselling)
1. Mientras el Alumno añade productos, Genkit analiza la categoría.
2. Si añade "Comida", el flujo `smartMenuRecommendation` sugiere "Bebidas" o "Golosinas" para aumentar el ticket promedio.
3. Se genera un mensaje persuasivo basado en el contexto actual del carrito.

## 4. Relaciones Clave
1. **Composición**: Un `MenuItem` contiene una receta (`RecipeItem`).
2. **Asociación**: Un `User` posee múltiples `Orders`.
3. **Dependencia**: La disponibilidad de un `MenuItem` depende del estado del stock de sus `Ingredients`.
