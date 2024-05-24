/* eslint-disable prettier/prettier */
import { Usuario } from '@prisma/client';
import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma3Service } from 'src/prisma3/prisma3.service';
import { UpdateChamadosDto } from './dto/update-chamados.dto';
import { AppService } from 'src/app.service';

const meses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];





@Injectable()
export class ChamadosService {
  constructor(private prisma: PrismaService, private prisma3: Prisma3Service, private app: AppService) { }

  async buscarTudo(pagina: number, limite: number, usuario: Usuario, status: number) {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const total = await this.prisma3.glpi_ticketsatisfactions.count();
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const iniciais = await this.prisma3.glpi_ticketsatisfactions.findMany({
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
        date_begin: 'desc'
      },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    if (!iniciais) throw new ForbiddenException('Nenhum processo encontrado');
    return {
      data: iniciais,
      total,
      pagina,
      limite
    };
  }

  async findAll(usuario: Usuario, status: number) {
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
        date_begin: 'desc'
      }
    });
    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} chamado`;
  }

  async avaliar(id: number, updateChamadosDto: UpdateChamadosDto) {
    
    const today = new Date();

    const horaAvaliado = new Date(today)
    horaAvaliado.setHours(today.getHours() - 3);

    const tipo = await this.prisma3.glpi_ticketsatisfactions.findUnique({
      where: { id }
    });
    if (!tipo) throw new InternalServerErrorException('Erro ao buscar tipo');
    return await this.prisma3.glpi_ticketsatisfactions.update({
      where: { id },
      data: { satisfaction: +updateChamadosDto.satisfaction, comment: updateChamadosDto.comment, date_answered: horaAvaliado }
    });
  }

  async chamadosMes(): Promise<{ name: string; tickets: number }[]> {
    const data = await this.prisma3.glpi_users.findMany({
      where: {
        is_active: true,
        auths_id: 6,
      },
      include: {
        tickets: {
          where: {
            type: 2,
            ticket: {
              OR: [
                { status: 5 },
                { status: 6 }
              ],
              solvedate: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth()),
                lte: new Date(new Date().getFullYear(), new Date().getMonth(), 31)
              }
            }
          },
        }
      }
    });
    return data.filter((d) => d.tickets.length > 0).map((d) => ({ name: `${d.firstname} ${d.realname}`, tickets: d.tickets.length }));
  }

  // async chamadosAno(): Promise<{ name: string; tickets: number }[]> {

  //   const data = await this.prisma3.glpi_users.findMany({
  //     where: {
  //       is_active: true,
  //       auths_id: 6,
  //     },
  //     include: {
  //       tickets: {
  //         where: {
  //           type: 2,
  //           ticket: {
  //             OR: [
  //               { status: 5 },
  //               { status: 6 }
  //             ],
  //             solvedate: {
  //               gte: new Date(new Date().getFullYear(), 1),
  //               lte: new Date()
  //             }
  //           }
  //         },
  //       }
  //     }
  //   });
  //   return data.filter((d) => d.tickets.length > 0).map((d) => ({ name: `${d.firstname} ${d.realname}`, tickets: d.tickets.length }));
  // }

  async chamadosPorMes(): Promise<{ name: string; tickets: number }[]> {

    const data = await this.prisma3.glpi_tickets.findMany({
      where: {
        OR: [
          { status: 5 },
          { status: 6 }
        ],
        solvedate: {
          gte: new Date(new Date().getFullYear() - 1, new Date().getMonth() + 1),
          lte: new Date()
        }
      },
      orderBy: {
        solvedate: 'asc'
      }
    });
    const dados = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    data.map((d) => {
      if (d.solvedate) {
        const mes = d.solvedate.getMonth();
        dados[mes] = dados[mes] + 1;
      }
    });
    const final = [];
    for (let i = new Date().getMonth() + 1; final.length < 12; i++) {
      let ano = new Date().getFullYear();
      if (i > new Date().getMonth()) {
        ano = ano - 1;
      }
      final.push({ name: `${meses[i]} - ${ano}`, tickets: dados[i] });
      i = i === 11 ? -1 : i;
    }
    return (final);
  }
  async chamadosAtribuidos(): Promise<{ quantidade: number }> {
    const data = await this.prisma3.glpi_tickets.count({
      where: {
        status: 2
      }
    });
    return { quantidade: data };
  }

  async chamadosNovos(): Promise<{ quantidade: number }> {
    const data = await this.prisma3.glpi_tickets.count({
      where: {
        status: 1
      }
    });
    return { quantidade: data };
  }

  async chamadosAvaliados() {
    const data = await this.prisma3.glpi_ticketsatisfactions.findMany({
      select: {
        satisfaction: true
      }
    });
    return data;
  }

  async chamadosAno(): Promise<{ name: string; tickets: number }[]> {
    // Obtém a data atual
    const currentDate = new Date();

    // Calcula a data há 12 meses atrás
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);

    const data = await this.prisma3.glpi_users.findMany({
      where: {
        is_active: true,
        auths_id: 6,
      },
      include: {
        tickets: {
          where: {
            type: 2,
            ticket: {
              OR: [
                { status: 5 },
                { status: 6 }
              ],
              solvedate: {
                gte: twelveMonthsAgo,
                lte: currentDate,
              }
            }
          },
        }
      }
    });

    return data.filter((d) => d.tickets.length > 0).map((d) => ({ name: `${d.firstname} ${d.realname}`, tickets: d.tickets.length }));
  }

  async chamadosAvaliadosNoAno() {
    const data = await this.prisma3.glpi_ticketsatisfactions.findMany({
      select: {
        satisfaction: true
      },
      where: {
        date_begin: {
          gte: new Date(new Date().getFullYear()),
          lte: new Date()
        }
      }
    });
    return data;
  }
  async chamadosAvaliadosNoMes() {
    const data = await this.prisma3.glpi_ticketsatisfactions.findMany({
      select: {
        satisfaction: true
      },
      where: {
        date_begin: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth()),
          lte: new Date()
        }
      }
    });
    return data;
  }


  async chamadosSeteDiasAtras() {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const data = await this.prisma3.glpi_ticketsatisfactions.findMany({
      select: {
        satisfaction: true,
        date_begin: true
      },
      where: {
        date_begin: {
          lte: sevenDaysAgo
        },
        satisfaction: null
      }
    });

    return data;
  }

  async avaliarSeteDiasAtras() {
      const today = new Date();

      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      sevenDaysAgo.setHours(today.getHours() - 3);

      const horaAvaliado = new Date(today)
      horaAvaliado.setHours(today.getHours() - 3);
    
      const data = await this.prisma3.glpi_ticketsatisfactions.updateMany({
        where: {
          date_begin: {
            lte: sevenDaysAgo
          },
          satisfaction: null
        },
        data: {
          satisfaction: 5,
          comment: "Avaliação feita a após 7 dias.",
          date_answered: horaAvaliado
        }
      });
      if (!data) throw new InternalServerErrorException('Nenhuma avaliação para fazer');
      return data;

    }
    



}
