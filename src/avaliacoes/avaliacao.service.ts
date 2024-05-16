import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';
import { PrismaService } from 'src/prisma/prisma.service';



@Injectable()
export class AvalicaoService {

  constructor(
    private prisma: PrismaService
  ) {}

  async create(createCorDto: CreateAvaliacaoDto) {
    const { comentario, avaliacao, usuario_id = 'aaa' } = createCorDto;
    const criado = await this.prisma.avaliacoes.create({
      
      data: { comentario, avaliacao: parseInt(avaliacao), usuario_id },
    });
    if (!criado) throw new InternalServerErrorException('Erro ao criar avaliacoes');
    return criado;
  }

  async findAll() {
    const avaliacoes = await this.prisma.avaliacoes.findMany({
      orderBy: { usuario_id: 'asc' }
    });
    if (!avaliacoes) throw new InternalServerErrorException('Erro ao buscar avaliacoes');
    return avaliacoes;
  }
}