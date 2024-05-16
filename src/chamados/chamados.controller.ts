import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ChamadosService } from './chamados.service';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';

@Controller('chamados')
export class ChamadosController {
  constructor(private readonly chamadosService: ChamadosService) {}
  
  @IsPublic()
  @Get()
  findAll(
    @UsuarioAtual() usuario: Usuario, 
    @Query('status') status: string
  ) {
    return this.chamadosService.findAll(usuario, +status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chamadosService.findOne(+id);
  }

}