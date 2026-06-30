Extraer expresiones regulares a constantes compartidas.

Por ejemplo:

Hoy tenemos:

@Matches(/^\+[1-9]\d{1,14}$/)

Mañana podríamos tener:

@Matches(PHONE_REGEX)

Y para contraseña:

PASSWORD_REGEX

¿Por qué?

Porque esas expresiones se reutilizarán en:

Cambiar contraseña
Crear empleado
Crear vendedor
Actualizar perfil
Crear administrador

No queremos copiar la misma regex por todo el proyecto.