import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediasRepository } from './medias.repository';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediasService {
  constructor(private readonly mediasRepository: MediasRepository) {}
  async create(createMediaDto: CreateMediaDto) {
    return await this.mediasRepository.createMedia(createMediaDto);
  }

  async findAll() {
    return await this.mediasRepository.findMedias();
  }

  async findOne(id: number) {
    return await this.mediasRepository.findMediaById(id);
  }

  async update(id: number, updateMediaDto: UpdateMediaDto) {
    return await this.mediasRepository.updateMediaById(id, updateMediaDto);
  }

  async remove(id: number) {
    return await this.mediasRepository.deleteMediaById(id);
  }
}
