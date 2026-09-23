import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { TerminNeu } from './kalender/termin-neu/termin-neu';

export const routes: Routes = [
    { path: "", component: Dashboard },
    { path: "kalender/termin-neu", component: TerminNeu },
];
