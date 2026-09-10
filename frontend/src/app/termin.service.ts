import { Service } from "@angular/core";
import { httpResource } from "@angular/common/http";

export interface Termin {
    id: number;
    person_id: number;
    titel: string;
    datum_zeit: string,
    ende_zeit: string,
}

@Service()
export class TerminService {
    termine = httpResource<Termin[]>(() => "http://127.0.0.1:8000/termine", { defaultValue: [] });
}