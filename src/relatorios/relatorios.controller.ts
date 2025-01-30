import { Controller, Get, Param } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';

@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Permissoes('ADM')
  @Get('listar-chamados-periodo-ano/:ano_inicio/:ano_fim')
  listarChamadosPeriodoAno(
    @Param('ano_inicio') ano_inicio: string,
    @Param('ano_fim') ano_fim: string
  ) {
    return this.relatoriosService.listarChamadosPeriodoAno(+ano_inicio, +ano_fim);
  }

}
