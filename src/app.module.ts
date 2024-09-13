import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tweet, TweetSchema } from './schema/Tweet.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/twitter-sentiment'),
    MongooseModule.forFeature([{ name: Tweet.name, schema: TweetSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
