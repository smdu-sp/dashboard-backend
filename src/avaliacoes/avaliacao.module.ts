import { Module } from '@nestjs/common';
import { AvalicaoService } from './avaliacao.service';
import { AvaliacaoController } from './avaliacao.controller';

@Module({
  controllers: [AvaliacaoController],
  providers: [AvalicaoService],
})
export class AvaliacaoModule {}
