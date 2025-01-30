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
    }
}
