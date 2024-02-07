import { Double } from "typeorm";
import { Devis } from "../entity/Devis";
import { SprotifSession } from "../entity/SportifSession";


export class DevisDto {

  idDevis: number;
  proposed_price: Double;
  idPreparator: number;
  title : string;
  // idSportif : number;

  static toDto(devis: Devis): DevisDto {
    const devisDto: DevisDto = new DevisDto();
    devisDto.idDevis = devis.idDevis;
    devisDto.proposed_price = devis.proposed_price;
    devisDto.idPreparator = devis.preparatorSession.idPreparator;
    devisDto.title = devis.demand.title;
    // devisDto.idSportif = devis.demand.sportifSession.idSportif;
    return devisDto;
  }
}
