import { PreparatorSession } from "../entity/PreparatorSession";

export class PreparatorSessionDto {

    idSession: number;
    preparatorRank: number;

    static toDto(preparatorSession: PreparatorSession): PreparatorSessionDto {
      const preparatorSessionDto: PreparatorSessionDto = new PreparatorSessionDto();
      preparatorSessionDto.idSession = preparatorSession.idSession;
      preparatorSessionDto.preparatorRank = preparatorSession.preparatorRank
      return preparatorSessionDto;
    }
  }