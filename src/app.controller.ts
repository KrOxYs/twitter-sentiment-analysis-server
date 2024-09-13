import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api/sentiment')
  getSentiment() {
    return this.appService.getSentiment();
  }

  @Get('/api/sentiment-data')
  getDataSentiment(@Query('page') page: number) {
    const pageNumber = page || 1;
    return this.appService.getDataSentiment(pageNumber);
  }

  @Get('/api/sentiment/negative')
  getNegativeWords() {
    return this.appService.getNegativeWords();
  }
}
