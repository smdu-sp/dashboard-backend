import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { Permissao, Usuario } from '@prisma/client';

@Injectable()
export class UsuariosService {
  constructor (
    private prisma: PrismaService
  ) {}

  async retornaPermissao(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id }});
    return usuario.permissao;
  }

  async validaPermissaoCriador(usuario: Usuario, permissao: Permissao) {
    const permissaoCriador = await this.retornaPermissao(usuario.id);
    if (permissaoCriador == 'ADM' && (permissao == 'SUP' || permissao == 'DEV'))
      permissao = 'ADM';
    if (permissaoCriador == 'SUP' && permissao == 'DEV')
      permissao = 'SUP'
    return permissao;    
  }

  async criar(usuario: Usuario, createUsuarioDto: CreateUsuarioDto) {
    let { nome, email, senha, permissao, status } = createUsuarioDto;
    const hash = await argon.hash(senha);
    permissao = await this.validaPermissaoCriador(usuario, permissao);
    if (await this.buscarPorEmail(email)) throw new ForbiddenException("E-mail já cadastrado.");
    const novoUsuario = await this.prisma.usuario.create({
      data: { nome, email, senha: hash, permissao, status }
    });
    novoUsuario.senha = undefined;
    return novoUsuario;
  }

  async buscarTudo() {
    const usuarios = await this.prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        permissao: true,
        status: true,
        criadoEm: true,
        atualizadoEm: true,
        senha: false
      }
    });
    return usuarios;
  }

  async buscarPorId(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id }
    });
    usuario.senha = undefined;
    return usuario;
  }

  async buscarPorEmail(email: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email }
    });
    return usuario;
  }

  async atualizar (usuario: Usuario, id: string, updateUsuarioDto: UpdateUsuarioDto) {
    if (updateUsuarioDto.senha)
      updateUsuarioDto.senha = await argon.hash(updateUsuarioDto.senha);
    if (updateUsuarioDto.email) {
      const usuario = await this.buscarPorEmail(updateUsuarioDto.email);
      if (usuario && usuario.id !== id) throw new ForbiddenException("E-mail já cadastrado.");
    }
    if (updateUsuarioDto.permissao)
      updateUsuarioDto.permissao = await this.validaPermissaoCriador(usuario, updateUsuarioDto.permissao);
    const usuarioAtualizado = await this.prisma.usuario.update({
      data: updateUsuarioDto,
      where: { id }
    });
    usuarioAtualizado.senha = undefined;
    return usuarioAtualizado;
  }
  
  async excluir (id: string) {
    await this.prisma.usuario.delete({
      where: { id }
    });
    return {
      "mensagem": "Usuário removido com sucesso!"
    }
  }
}
