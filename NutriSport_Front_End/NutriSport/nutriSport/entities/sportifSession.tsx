interface SportifSession {
    idSportif: number;
    name: string;
    phone :string;
    currentPosition : location;
};

interface location {
    coordinates: [number, number];
  }