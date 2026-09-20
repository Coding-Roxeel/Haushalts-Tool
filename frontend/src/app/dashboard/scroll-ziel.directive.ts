import { Directive, ElementRef, afterRenderEffect, inject, input } from "@angular/core";

@Directive({
    selector: "[appScrollZiel]",
})
export class ScrollZiel {
    readonly appScrollZiel = input.required<number>();
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

    constructor() {
        afterRenderEffect(() => {
            this.element.nativeElement.scrollTop = this.appScrollZiel();
        })
    }
}