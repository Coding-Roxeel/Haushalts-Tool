import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { TerminFormular } from './kalender/termin-formular/termin-formular';
import { SchichtFormular } from './kalender/schicht-formular/schicht-formular';

export const routes: Routes = [
    { path: "", component: Dashboard },
    { path: "kalender/termin-neu", component: TerminFormular },
    { path: "kalender/termin/:id", component: TerminFormular },
    { path: "kalender/schicht-neu", component: SchichtFormular },
    { path: "kalender/schicht/:id", component: SchichtFormular },
];
