import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('Health Check')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  getHello(): string {
    return this.appService.getHello();
  }
}
