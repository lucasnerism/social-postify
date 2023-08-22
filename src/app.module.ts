import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediasModule } from './medias/medias.module';
import { PostsModule } from './posts/posts.module';
import { PublicationsModule } from './publications/publications.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [MediasModule, PostsModule, PublicationsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
