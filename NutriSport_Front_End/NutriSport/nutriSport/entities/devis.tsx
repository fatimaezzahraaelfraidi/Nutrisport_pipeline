interface PreparatorSession {
    idPreparator: number;
    preparatorRank:number;
  }
  interface Devis{
    idDevis: number;
    proposed_price:number;
    createdAt:string;
    preparatorSession: PreparatorSession;
    demand?:Demand;
    title:string;
  }