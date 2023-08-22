import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationsRepository } from './publications.repository';
import { MediasService } from '../medias/medias.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class PublicationsService {
  constructor(
    private readonly publicationsRepository: PublicationsRepository,
    @Inject(forwardRef(() => MediasService))
    private readonly mediasService: MediasService,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
  ) {}

  async create(createPublicationDto: CreatePublicationDto) {
    const { mediaId, postId } = createPublicationDto;
    await this.checkMediaAndPostExistance(mediaId, postId);
    return await this.publicationsRepository.createPublication(
      createPublicationDto,
    );
  }

  async checkMediaAndPostExistance(mediaId: number, postId: number) {
    await this.mediasService.findOne(mediaId);
    await this.postsService.findOne(postId);
  }

  async findAll(published?: boolean, after?: Date) {
    return await this.publicationsRepository.findPublications(published, after);
  }

  async findOne(id: number) {
    const publication =
      await this.publicationsRepository.findPublicationById(id);
    if (!publication) throw new NotFoundException();
    return publication;
  }

  async findOneByMediaId(mediaId: number) {
    return await this.publicationsRepository.findPublicationByMediaId(mediaId);
  }

  async findOneByPostId(postId: number) {
    return await this.publicationsRepository.findPublicationByPostId(postId);
  }

  async update(id: number, updatePublicationDto: UpdatePublicationDto) {
    const { mediaId, postId } = updatePublicationDto;
    const publication = await this.findOne(id);
    if (this.isDateInPast(publication.date)) throw new ForbiddenException();
    await this.checkMediaAndPostExistance(mediaId, postId);
    return this.publicationsRepository.updatePublicationById(
      id,
      updatePublicationDto,
    );
  }

  private isDateInPast(
    dateToCheck: Date,
    currentDate: Date = new Date(),
  ): boolean {
    if (dateToCheck < currentDate) return true;
    return false;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.publicationsRepository.deletePublicationById(id);
    return;
  }
}
