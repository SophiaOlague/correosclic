import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { StorageService } from '././application/services/storage.service';

/**
 * Subida de archivos a R2.
 *
 * Antes era `POST /storage/test` **sin ningún guard**: cualquiera, con sesión
 * o sin ella, podía subir archivos arbitrarios y recibir su URL pública. Ahora
 * exige sesión y valida tipo y tamaño, igual que la subida de imágenes de
 * producto.
 *
 * Es el único punto de subida genérico: lo usa el onboarding de vendedor para
 * resolver el `urlArchivo` que exige `UploadSellerDocumentDto`, y por eso
 * admite PDF además de imágenes.
 */
@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {

  constructor(
    private readonly storageService: StorageService,
  ) {}

  @Post('uploads')
  @UseInterceptors(
    FileInterceptor('file'),
  )
  async upload(

    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType: /^(image\/(jpeg|png|webp)|application\/pdf)$/,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,

  ) {

    return this.storageService.upload({

      buffer: file.buffer,

      originalName: file.originalname,

      mimeType: file.mimetype,

    });

  }

}
