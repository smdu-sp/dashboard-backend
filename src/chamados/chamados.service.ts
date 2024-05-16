import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma3Service } from 'src/prisma3/prisma3.service';

@Injectable()
export class ChamadosService {

  constructor(private prisma: PrismaService, private prisma3: Prisma3Service) { }
  async findAll(status: number) {
    const data = await this.prisma3.glpi_ticketsatisfactions.findMany({
      where: {
        ...(status === 0 ? { date_answered: null } : status === 1 ? { date_answered: { not: null } } : {})
      },
      include: {
        Tickets: {
          include: {
            Usuarios: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        date_begin: 'asc'
      }
    });
    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} chamado`;
  }
}
