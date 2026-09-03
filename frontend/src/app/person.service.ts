import { Service } from '@angular/core';
import { httpResource } from '@angular/common/http';

export interface Person {
    id: number;
    name: string;
    farbe: string;
}

@Service()
export class PersonService {
    personen = httpResource<Person[]>(() => 'http://127.0.0.1:8000/personen', { defaultValue: [] });
}