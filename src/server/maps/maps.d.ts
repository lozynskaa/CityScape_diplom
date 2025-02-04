export interface AutosuggestResponse {
  items: AutosuggestItem[];
  offset: number;
  nextOffset: number;
  count: number;
  limit: number;
  queryTerms: QueryTerm[];
}

export interface AutosuggestItem {
  title: string;
  id: string;
  politicalView: string;
  ontologyId: string;
  resultType: string;
  houseNumberType: string;
  addressBlockType: string;
  localityType: string;
  administrativeAreaType: string;
  address: Address;
  position: Position;
  access: Access[];
  distance: number;
  excursionDistance: number;
  mapView: MapView;
  categories: Category[];
  chains: Chain[];
  references: Reference[];
  foodTypes: FoodType[];
  contacts: Contact[];
  openingHours: OpeningHour[];
  timeZone: TimeZone;
  highlights: Highlights;
  phonemes: Phonemes;
  media: Media;
  streetInfo: StreetInfo[];
  accessRestrictions: AccessRestriction[];
}

export interface Address {
  label: string;
  countryCode: string;
  countryName: string;
  stateCode: string;
  state: string;
  countyCode: string;
  county: string;
  city: string;
  district: string;
  subdistrict: string;
  street: string;
  streets: string[];
  block: string;
  subblock: string;
  postalCode: string;
  houseNumber: string;
  building: string;
  unit: string;
}

export interface Position {
  lat: number;
  lng: number;
}

export interface Access {
  lat: number;
  lng: number;
}

export interface MapView {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface Category {
  id: string;
  name: string;
  primary: boolean;
}

export interface Chain {
  id: string;
}

export interface Reference {
  supplier: Supplier;
  id: string;
}

export interface Supplier {
  id: string;
}

export interface FoodType {
  id: string;
  name: string;
  primary: boolean;
}

export interface Contact {
  phone: ContactItem[];
  mobile: ContactItem[];
  tollFree: ContactItem[];
  fax: ContactItem[];
  www: ContactItem[];
  email: ContactItem[];
}

export interface ContactItem {
  label: string;
  value: string;
  categories: Pick<SubCategory, "id">[];
}

export interface OpeningHour {
  categories: Category8[];
  text: string[];
  isOpen: boolean;
  structured: Structured[];
}

export interface Structured {
  start: string;
  duration: string;
  recurrence: string;
}

export interface TimeZone {
  name: string;
  utcOffset: string;
}

export interface Highlights {
  title: Label[];
  address: SubAddress;
}

export interface Title {
  start: number;
  end: number;
}

export interface SubAddress {
  label: Label[];
  country: Label[];
  countryCode: Label[];
  state: Label[];
  stateCode: Label[];
  county: Label[];
  countyCode: Label[];
  city: Label[];
  district: Label[];
  subdistrict: Label[];
  block: Label[];
  subblock: Label[];
  street: Label[];
  streets: Label[][];
  postalCode: Label[];
  houseNumber: Label[];
  building: Label[];
}

export interface Phonemes {
  placeName: PhonemesItem[];
  countryName: PhonemesItem[];
  state: PhonemesItem[];
  county: PhonemesItem[];
  city: PhonemesItem[];
  district: PhonemesItem[];
  subdistrict: PhonemesItem[];
  street: PhonemesItem[];
  block: PhonemesItem[];
  subblock: PhonemesItem[];
}

export interface Media {
  images: {
    items: MediaItem[];
  };
  editorials: {
    items: MediaItem[];
  };
  ratings: {
    items: MediaItem[];
  };
}

export interface MediaItem {
  description?: string;
  language: string;
  href: string;
  supplier: Supplier;
  count?: number;
  average?: number;
}

export interface StreetInfo {
  baseName: string;
  streetType: string;
  streetTypePrecedes: boolean;
  streetTypeAttached: boolean;
  prefix: string;
  suffix: string;
  direction: string;
  language: string;
}

export interface AccessRestriction {
  categories: Pick<Category, "id">[];
  restricted: boolean;
}

export interface QueryTerm {
  term: string;
  replaces: string;
  start: number;
  end: number;
}

export interface AutosuggestDisplayItem {
  id: string;
  value: string;
  label: string;
  address: Address;
  resultType: string;
  position: Position;
}
