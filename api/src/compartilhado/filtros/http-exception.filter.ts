import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class FiltroHttpException implements ExceptionFilter {
  private readonly logger = new Logger(FiltroHttpException.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensagem = 'Erro interno do servidor';
    let codigo = 'ERRO_INTERNO';
    let detalhes: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        mensagem = body;
      } else if (typeof body === 'object' && body !== null) {
        const o = body as Record<string, unknown>;
        mensagem = String(o.message ?? o.error ?? mensagem);
        if (Array.isArray(o.message)) {
          detalhes = o.message;
          mensagem = 'Erro de validação';
          codigo = 'VALIDACAO';
        } else {
          codigo = status === HttpStatus.UNAUTHORIZED ? 'NAO_AUTORIZADO' : `HTTP_${status}`;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.stack);
      mensagem = exception.message;
    }

    response.status(status).json({
      mensagem,
      codigo,
      ...(detalhes !== undefined ? { detalhes } : {}),
    });
  }
}
