import {  Geometry } from 'typeorm';
import { Offer } from '../entity/Offer';


export class OfferDto {
  idOffer: number;

  title: string;

  price: number;

  preparation_time : number;

  isDeliverable: boolean;

  isAvailable: boolean;

  createdAt: Date;
  updatedAt: Date;

  geographicalArea: Geometry;
  idPreparatorSession : number;

  static toDto(offer: Offer): OfferDto {
    const offerDto: OfferDto = new OfferDto();
    offerDto.idOffer=offer.idOffer;
    offerDto.title=offer.title;
    offerDto.price=offer.price;
    offerDto.preparation_time=offer.preparation_time;
    offerDto.isAvailable=offer.isDeliverable;
    offerDto.isAvailable=offer.isAvailable;
    offerDto.createdAt=offer.createdAt;
    offerDto.updatedAt=offer.updatedAt;
    offerDto.geographicalArea=offer.geographicalArea;
    offerDto.idPreparatorSession=offer.preparatorSession.idSession;
    return offerDto;
  }
}
