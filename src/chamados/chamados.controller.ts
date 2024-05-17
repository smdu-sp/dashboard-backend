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

  @Get('atribuidos') //localhost:3000/chamados/atribuidos
  chamadosAtribuidos() {
    return this.chamadosService.chamadosAtribuidos();
  }
  
  @Get('novos')
  chamadosNovos() {
    return this.chamadosService.chamadosNovos();
  }
}
