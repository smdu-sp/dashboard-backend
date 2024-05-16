import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { AvalicaoService } from './avaliacao.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';

@Controller('avaliacoes')
export class AvaliacaoController {
  constructor(private readonly avaliacaoService: AvalicaoService) { }

  @Permissoes('ADM')
  @Post('criar')
  create(@Body() createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.avaliacaoService.create(createAvaliacaoDto);
  }

  @Permissoes('ADM')
  @Get('listar')
  findAll() {
    return this.avaliacaoService.findAll();
  }
}
