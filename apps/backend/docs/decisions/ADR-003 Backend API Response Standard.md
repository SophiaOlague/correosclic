Objetivo
Definir un estándar único para todas las respuestas HTTP del backend de CorreosClic.
Este estándar deberá ser utilizado por todos los módulos del sistema:
IAM (Auth)
Marketplace
Productos
Carrito
Pedidos
Logística
Pagos
Notificaciones
Administración

Principios
1. Usar correctamente los códigos HTTP
Los códigos HTTP indican el resultado general de la operación.
Ejemplos:
Código
Significado
200 -Operación exitosa
201 -Recurso creado
204 -Sin contenido
400 -Datos inválidos
401 -No autenticado
403 -Sin permisos
404 -Recurso no encontrado
409 -Conflicto
422 -Error de validación
500 -Error interno


2. Nunca devolver mensajes ambiguos
Incorrecto:
{
 "message": "Error"
}
Correcto:
{
 "message": "El correo electrónico ya se encuentra registrado."
}

3. Nunca depender del texto del mensaje
Para eso existe el campo:
code
El frontend deberá utilizar siempre ese código para tomar decisiones.

Contrato de Error
Todas las respuestas de error deberán seguir exactamente este formato.
{
 "statusCode": 409,
 "error": "Conflict",
 "message": "El correo electrónico ya se encuentra registrado.",
 "code": "AUTH_EMAIL_ALREADY_EXISTS",
 "timestamp": "2026-06-24T18:00:00.000Z",
 "path": "/api/auth/register"
}

Descripción de los campos
Campo      Descripción
statusCode -Código HTTP
error -Nombre estándar del error HTTP
message -Mensaje entendible para el usuario
code -Código interno estable para frontend
timestamp -Fecha y hora ISO 8601
path -Endpoint solicitado


Contrato de Éxito
Para respuestas exitosas usaremos un formato consistente, evitando envolver innecesariamente la información.
Ejemplo de registro:
{
 "accessToken": "JWT",
 "user": {
   "id": "uuid",
   "email": "usuario@correo.com",
   "nombre": "Juan",
   "apellidoPaterno": "Pérez",
   "roles": [
     "CLIENTE"
   ]
 }
}
Ejemplo para una consulta de perfil:
{
 "id": "uuid",
 "email": "usuario@correo.com",
 "nombre": "Juan",
 "apellidoPaterno": "Pérez"
}
No agregaremos un objeto como:
{
 "success": true,
 "data": { ... }
}
porque NestJS ya comunica el éxito mediante el código HTTP (200, 201, etc.) y ese envoltorio añade una capa innecesaria.

Convención para códigos internos (code)
Todos los códigos seguirán la siguiente estructura:
<MÓDULO>_<DESCRIPCIÓN>
Ejemplos:
Auth
AUTH_EMAIL_ALREADY_EXISTS
AUTH_INVALID_CREDENTIALS
AUTH_ACCOUNT_DISABLED
AUTH_DEFAULT_ROLE_NOT_FOUND
AUTH_INVALID_TOKEN
AUTH_TOKEN_EXPIRED

Marketplace
MARKETPLACE_PRODUCT_NOT_FOUND
MARKETPLACE_STORE_NOT_FOUND
MARKETPLACE_CATEGORY_NOT_FOUND

Pedidos
ORDER_NOT_FOUND
ORDER_ALREADY_CANCELLED
ORDER_INVALID_STATUS

Logística
SHIPMENT_NOT_FOUND
SHIPMENT_ALREADY_DELIVERED
SHIPMENT_INVALID_ROUTE

Pagos
PAYMENT_DECLINED
PAYMENT_ALREADY_REFUNDED
PAYMENT_PROVIDER_ERROR

Seguridad
En autenticación seguiremos una regla importante:
❌ Nunca revelar si un correo existe.
Por ejemplo, en el login siempre responderemos:
{
 "statusCode": 401,
 "error": "Unauthorized",
 "message": "Correo electrónico o contraseña incorrectos.",
 "code": "AUTH_INVALID_CREDENTIALS"
}
Esto evita la enumeración de usuarios, una práctica recomendada de seguridad.
