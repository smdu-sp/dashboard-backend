import { Injectable } from '@nestjs/common';
import { Prisma3Service } from 'src/prisma3/prisma3.service';

@Injectable()
export class RelatoriosService {
    constructor(
        private prisma: Prisma3Service,
    ){}

    async listarChamadosPeriodoAno(
        ano_inicio: number = 2020,
        ano_fim?: number
    ) {
        if (!ano_fim) ano_fim = ano_inicio;

        const chamados = await this.prisma.glpi_tickets.findMany({
            where: {
                date_creation: {
                    gte: new Date(`${ano_inicio}-01-01`),
                    lte: new Date(`${ano_fim}-12-31`),
                }
            },
            select: {
                id: true,
                date_creation: true,
                solvedate: true,
            }
        });

        const relatorio = chamados.map((chamado) => {
            const tempoResolução = chamado.solvedate ? Math.ceil((chamado.solvedate.getTime() - chamado.date_creation.getTime()) / (1000 * 3600)) : 0;
            return {
                '#': chamado.id,
                'Data de abertura':  new Date(chamado.date_creation).toLocaleDateString().split('T')[0],
                'Data de resolução': chamado.solvedate && new Date(chamado.solvedate).toLocaleDateString().split('T')[0],
                'Tempo para resolução (em horas)': tempoResolução,
                ' ': '',
            }
        });

        const chamadosResolvidosTotal = chamados.filter(chamado => chamado.solvedate).length;
        const mediaResolucao = Math.round(relatorio.reduce((acc, chamado) => acc + chamado['Tempo para resolução (em horas)'], 0) / chamadosResolvidosTotal);
        console.log({ chamadosResolvidosTotal, mediaResolucao });
        relatorio[0]['Chamados resolvidos'] = chamadosResolvidosTotal;
        relatorio[0]['Média de tempo para resolução (em horas)'] = mediaResolucao;

        return relatorio;
    }
}
