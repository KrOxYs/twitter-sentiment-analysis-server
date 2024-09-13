import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TweetDocument = Tweet & Document;

@Schema()
export class Tweet {
  @Prop({ required: true })
  conversation_id: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  tweet: string;

  @Prop({ type: [String], default: [] })
  mentions: string[];

  @Prop({ type: Number, default: 0 })
  replies_count: number;

  @Prop({ type: Number, default: 0 })
  retweets_count: number;

  @Prop({ type: Number, default: 0 })
  likes_count: number;

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ default: '' })
  translated: string;
}

export const TweetSchema = SchemaFactory.createForClass(Tweet);
