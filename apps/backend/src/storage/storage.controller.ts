import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { StorageService } from '././application/services/storage.service';

@Controller('storage')
export class StorageController {

  constructor(
    private readonly storageService: StorageService,
  ) {}

  @Post('test')
  @UseInterceptors(
    FileInterceptor('file'),
  )
  async upload(

    @UploadedFile()
    file: Express.Multer.File,

  ) {

    const uploaded =
  await this.storageService.upload({

    buffer: file.buffer,

    originalName: file.originalname,

    mimeType: file.mimetype,

});

return uploaded;

  }

}