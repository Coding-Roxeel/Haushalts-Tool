import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { TerminFormular } from './kalender/termin-formular/termin-formular';

export const routes: Routes = [
    { path: "", component: Dashboard },
    { path: "kalender/termin-neu", component: TerminFormular },
    { path: "kalender/termin/:id", component: TerminFormular },
];
