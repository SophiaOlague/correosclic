import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import { UploadedFileDto } from '../../dto/uploaded-file.dto';

import {
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {

  private readonly client: S3Client;

  constructor(
    private readonly configService: ConfigService,
  ) {

    this.client = new S3Client({

      region: 'auto',

      endpoint:
        this.configService.get<string>(
          'R2_ENDPOINT',
        ),

      credentials: {

        accessKeyId:
          this.configService.get<string>(
            'R2_ACCESS_KEY_ID',
          )!,

        secretAccessKey:
          this.configService.get<string>(
            'R2_SECRET_ACCESS_KEY',
          )!,

      },

    });

  }

  async upload(
  file: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
  },
): Promise<UploadedFileDto>{

    const extension =
      file.originalName.split('.').pop();

    const fileName =
      `${crypto.randomUUID()}.${extension}`;

    await this.client.send(

      new PutObjectCommand({

        Bucket:
          this.configService.get<string>(
            'R2_BUCKET',
          ),

        Key: fileName,

        Body: file.buffer,

        ContentType:
          file.mimeType,

      }),

    );

    return {

  key: fileName,

  url: `${this.configService.get<string>(
    'R2_PUBLIC_URL',
  )}/${fileName}`,

};

  }

}