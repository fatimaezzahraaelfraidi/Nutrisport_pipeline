import { PreparatorSessionDto } from '../src/dto/PreparatorSessionDto';
import { PreparatorSession } from '../src/entity/PreparatorSession';

describe('PreparatorSessionDto', () => {
  it('should convert PreparatorSession to PreparatorSessionDto successfully', () => {
    // Mock data
    const preparatorSession: PreparatorSession = {
      idSession: 1,
      idPreparator: 1,
      currentPosition: null,
      isActive: true,
      preparatorRank: 4.5,
      offers: [],
      devis: [],
      fcmToken: ''
    };

    // Call the toDto method
    const preparatorSessionDto: PreparatorSessionDto = PreparatorSessionDto.toDto(preparatorSession);

    // Assertions
    expect(preparatorSessionDto.idSession).toEqual(preparatorSession.idSession);
    expect(preparatorSessionDto.preparatorRank).toEqual(preparatorSession.preparatorRank);
  });


});
