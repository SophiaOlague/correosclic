import {
  Equals,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {

@IsString({
  message: 'El correo electrónico debe ser una cadena de texto.',
})
@IsEmail(
  {},
  {
    message: 'El correo electrónico no tiene un formato válido.',
  },
)
@MaxLength(255, {
  message: 'El correo electrónico no puede superar los 255 caracteres.',
})
readonly email: string;

@IsString({
  message: 'La contraseña debe ser una cadena de texto.',
})
@Matches(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/,
  {
    message:
      'La contraseña debe contener entre 8 y 64 caracteres, incluyendo al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.',
  },
)
readonly password: string;

@IsString({
  message: 'La confirmación de la contraseña debe ser una cadena de texto.',
})
readonly confirmPassword: string;

@IsString({
  message: 'El nombre debe ser una cadena de texto.',
})
@MaxLength(100, {
  message: 'El nombre no puede superar los 100 caracteres.',
})
readonly nombre: string;

@IsString({
  message: 'El apellido paterno debe ser una cadena de texto.',
})
@MaxLength(100, {
  message: 'El apellido paterno no puede superar los 100 caracteres.',
})
readonly apellidoPaterno: string;

@IsOptional()
@IsString({
  message: 'El apellido materno debe ser una cadena de texto.',
})
@MaxLength(100, {
  message: 'El apellido materno no puede superar los 100 caracteres.',
})
readonly apellidoMaterno?: string;

@IsOptional()
@IsString({
  message: 'El teléfono debe ser una cadena de texto.',
})
@Matches(/^\+[1-9]\d{1,14}$/, {
  message:
    'El teléfono debe estar en formato internacional E.164. Ejemplo: +526181234567.',
})
readonly telefono?: string;

@IsBoolean({
  message: 'La aceptación de términos debe ser un valor booleano.',
})
@Equals(true, {
  message: 'Debes aceptar los términos y condiciones.',
})
readonly acceptTerms: boolean;
}