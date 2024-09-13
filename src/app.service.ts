import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as Sentiment from 'sentiment';
import { Tweet, TweetDocument } from './schema/Tweet.schema';

@Injectable()
export class AppService {
  private readonly sentiment = new Sentiment();
  private readonly dataPerPage = 5;

  constructor(
    @InjectModel(Tweet.name) private readonly tweetModel: Model<TweetDocument>,
  ) {}

  /**
   * Analyze sentiment for a batch of tweets.
   * Returns count of positive, neutral, and negative sentiments.
   */
  public async getSentiment() {
    try {
      const tweets = await this.tweetModel.find().limit(1000).exec();
      const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };

      tweets.forEach((tweet) => {
        const { score } = this.sentiment.analyze(tweet.translated);
        if (score > 0) sentimentCounts.positive++;
        else if (score < 0) sentimentCounts.negative++;
        else sentimentCounts.neutral++;
      });

      return sentimentCounts;
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      throw new Error('Failed to fetch sentiment data');
    }
  }

  /**
   * Fetch paginated tweet data and perform sentiment analysis.
   * Returns tweets with sentiment analysis and page information.
   */
  public async getDataSentiment(page: number) {
    try {
      const skip = this.dataPerPage * (page - 1);
      const tweets = await this.tweetModel
        .find()
        .limit(this.dataPerPage)
        .skip(skip)
        .exec();

      const sentimentResult = tweets.map((tweet) => {
        const analysis = this.sentiment.analyze(tweet.translated);
        const sentiment = this.getSentimentLabel(analysis.score);
        const negativeWords = sentiment === 'negative' ? analysis.negative : [];

        return {
          ...tweet.toObject(),
          sentiment,
          negativeWords,
        };
      });

      const totalDocuments = await this.tweetModel.countDocuments();
      return {
        sentimentResult,
        totalPages: Math.ceil(totalDocuments / this.dataPerPage),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error fetching paginated sentiment data:', error);
      throw new Error('Failed to fetch paginated sentiment data');
    }
  }

  /**
   * Fetch the most common negative words from the tweets.
   * Returns the top 10 most frequent negative words.
   */
  public async getNegativeWords() {
    try {
      const tweets = await this.tweetModel.find().exec();
      const negativeWordCounts: Record<string, number> = {};

      tweets.forEach((tweet) => {
        const analysis = this.sentiment.analyze(tweet.translated);
        if (analysis.score <= -2) {
          analysis.negative.forEach((word: any) => {
            negativeWordCounts[word] = (negativeWordCounts[word] || 0) + 1;
          });
        }
      });

      // Sort and get top 10 negative words
      const sortedNegativeWords = Object.entries(negativeWordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [word, count]) => {
          obj[word] = count;
          return obj;
        }, {});

      return sortedNegativeWords;
    } catch (error) {
      console.error('Error fetching negative words:', error);
      throw new Error('Failed to fetch negative words');
    }
  }

  /**
   * Helper function to map sentiment score to a label.
   */
  private getSentimentLabel(score: number): string {
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }
}
