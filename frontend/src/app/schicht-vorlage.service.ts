import { Service } from "@angular/core";
import { httpResource } from "@angular/common/http";

export interface SchichtVorlage {
    id: number;
    name: string;
    start: string;
    ende: string;
}

@Service()
export class SchichtVorlageService {
    schichtVorlagen = httpResource<SchichtVorlage[]>(() => "http://127.0.0.1:8000/schicht-vorlagen", { defaultValue: [] });
}