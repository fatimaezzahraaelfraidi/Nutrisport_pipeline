interface PreparatorSession {
    idPreparator: number;
    preparatorRank: number;
};
interface Preparator {
    idPreparator: number;
    preparatorRank: number;
}
interface Offer  {
    idOffer: number;
    imageUrl: string;
    imageRef?: string;
    title: string;
    description: string;
    price: number;
    preparatorSession? : Preparator;
    isDeliverable:boolean;
    mealType: string;
    createdAt:string;
    timeCreatedAt :string;
    isAvailable: boolean;
    preparation_time:number;
    caloricValue:number;
    fatsValue:number;
    proteinValue:number;
    carbohydratesValue:number;
    orderCount:number;
};
  