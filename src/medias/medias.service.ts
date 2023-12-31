import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediasRepository } from './medias.repository';
import { PublicationsService } from '../publications/publications.service';

@Injectable()
export class MediasService {
  constructor(
    private readonly mediasRepository: MediasRepository,
    private readonly publicationsService: PublicationsService,
  ) {}

  async create(createMediaDto: CreateMediaDto) {
    await this.findMediaWithData(createMediaDto);
    return await this.mediasRepository.createMedia(createMediaDto);
  }

  async findMediaWithData(data: CreateMediaDto) {
    const media = await this.mediasRepository.findMedias(data);
    if (media.length !== 0) throw new ConflictException();
  }

  async findAll() {
    return await this.mediasRepository.findMedias();
  }

  async findOne(id: number) {
    const media = await this.mediasRepository.findMediaById(id);
    if (!media) throw new NotFoundException();
    return media;
  }

  async update(id: number, updateMediaDto: CreateMediaDto) {
    await this.findOne(id);
    await this.findMediaWithData(updateMediaDto);
    return await this.mediasRepository.updateMediaById(id, updateMediaDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    const publication = await this.publicationsService.findOneByMediaId(id);
    if (publication) throw new ForbiddenException();
    await this.mediasRepository.deleteMediaById(id);
    return;
  }
}
