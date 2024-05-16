import { Global, Injectable } from '@nestjs/common';
import { PrismaClient } from '@glpi/prisma/client';

@Global()
@Injectable()
export class Prisma3Service extends PrismaClient {
  constructor() {
    super();
  }
}
