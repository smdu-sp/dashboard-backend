import { Usuario } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma3Service } from 'src/prisma3/prisma3.service';

@Injectable()
export class ChamadosService {
  constructor(private prisma: PrismaService, private prisma3: Prisma3Service) { }
  async findAll(usuario: Usuario, status: number) {
    console.log(usuario);
    const data = await this.prisma3.glpi_ticketsatisfactions.findMany({
      where: {
        ...(usuario && usuario.permissao === 'USR' ? { 
          Tickets: {
            Usuarios: {
              some: {
                type: 1,
                user: {
                  name: {
                    contains: usuario.login
                  }
                }
              }
            }
          }
        } : {}),
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
