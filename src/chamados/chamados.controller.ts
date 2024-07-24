/* eslint-disable prettier/prettier */
import { Controller, Get, Body, Patch, Param, Query } from '@nestjs/common';
import { ChamadosService } from './chamados.service';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';
import { UpdateChamadosDto } from './dto/update-chamados.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('chamados')
export class ChamadosController {
  constructor(private readonly chamadosService: ChamadosService) {}

  @Get()
  findAll(
    @UsuarioAtual() usuario: Usuario, 
    @Query('status') status: string
  ) {
    return this.chamadosService.findAll(usuario, +status);
  }

  @Get('encontrar/:id') //localhost:3000/chamados/id
  findOne(@Param('id') id: string) {
    return this.chamadosService.findOne(+id);
  }

  @Patch('avaliar/:id')
  avaliar(@Param('id') id: number, @Body() updateChamadosDto: UpdateChamadosDto) {
    return this.chamadosService.avaliar(+id, updateChamadosDto);
  }

  @Patch('avaliar-sete-dias')
  avaliarSeteDiasAtras() {
    return this.chamadosService.avaliarSeteDiasAtras();
  }

  @Get('mes')
  chamadosMes() {
    return this.chamadosService.chamadosMes();
  }

  @Get('ano')
  chamadosAno() {
    return this.chamadosService.chamadosAno();
  }

  @Get('mensal')
  chamadosPorMes() {
    return this.chamadosService.chamadosPorMes();
  }

  // @Get('doze-meses')
  // chamadosDozeMeses() {
  //   return this.chamadosService.chamadosDozeMeses();
  // }

  @Get('atribuidos') //localhost:3000/chamados/atribuidos
  chamadosAtribuidos() {
    return this.chamadosService.chamadosAtribuidos();
  }
  
  @Get('novos')
  chamadosNovos() {
    return this.chamadosService.chamadosNovos();
  }

  @Get('avaliados')
  chamadosAvaliados() {
    return this.chamadosService.chamadosAvaliados();
  }

  @Get('avaliados/ano')
  chamadosAvaliadosNoAno() {
    return this.chamadosService.chamadosAvaliadosNoAno();
  }

  @Get('avaliados/mes')
  chamadosAvaliadosNoMes() {
    return this.chamadosService.chamadosAvaliadosNoMes();
  }

  @Get('sete-dias-atras')
  chamadosSeteDiasAtras() {
    return this.chamadosService.chamadosSeteDiasAtras();
  }

  @Get('buscar-tudo')
  buscarTudo(@Query('pagina') pagina: number = 1, @Query('limite') limite: number = 10,     

  @UsuarioAtual() usuario: Usuario, 
  @Query('status') status: string) {
    
    return this.chamadosService.buscarTudo(+pagina, +limite, usuario, +status);
  }

  @IsPublic()
  @Get('ultimo')
  ultimoChamado(){
    return this.chamadosService.ultimoChamado();
  }
}
