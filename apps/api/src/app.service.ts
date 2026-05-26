import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo(): { name: string; health: string; clients: string } {
    return {
      name: 'data-form-api',
      health: '/api/health',
      clients: 'POST /api/clients',
    };
  }

  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
