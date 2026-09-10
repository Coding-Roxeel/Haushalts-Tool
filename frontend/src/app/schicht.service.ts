import { Service } from "@angular/core";
import { httpResource } from "@angular/common/http";

export interface Schicht {
    id: number;
    person_id: number;
    datum: string;
    start: string;
    ende: string;
    vorlage_id: number | null
}

@Service()
export class SchichtService {
    schichten = httpResource<Schicht[]>(() => "http://127.0.0.1:8000/schichten", {defaultValue: [] });
}