import { inject, Service } from "@angular/core";
import { HttpClient, httpResource } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { EreignisFarbe } from "./farben";

const TERMINE_URL = "http://127.0.0.1:8000/termine";

export interface Termin {
    id: number;
    person_id: number;
    titel: string;
    datum_zeit: string;
    ende_zeit: string;
    farbe: string;
}


export interface NeuerTermin {
    person_id: number;
    titel: string;
    datum_zeit: string;
    ende_zeit: string;
    farbe: EreignisFarbe;
}

@Service()
export class TerminService {
    private readonly http = inject(HttpClient);

    termine = httpResource<Termin[]>(() => TERMINE_URL, { defaultValue: [] });

    async anlegen(neu: NeuerTermin): Promise<Termin> {
        const angelegt = await firstValueFrom(this.http.post<Termin>(TERMINE_URL, neu));
        this.termine.reload();
        return angelegt;
    }
}