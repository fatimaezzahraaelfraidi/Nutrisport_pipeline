interface Order {
    idOrder: number;
    orderStatus: string;
    createdAt:string;
    devis: Devis;
    offer:Offer;
    description: string;
    price : number;
    isPaid : boolean;
    sportifSession : SportifSession;
    
  }