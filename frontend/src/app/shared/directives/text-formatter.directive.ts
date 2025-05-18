// --- ANGULAR DIRECTIVE REFERENCE FILE ---

// 1. Imports: Bring in necessary tools for building directives and working with forms

// Directive: Decorator that marks a class as an Angular directive.
// ElementRef: Provides access to the host DOM element where the directive is applied.
// HostListener: Decorator to listen for events on the host element.
import { Directive, ElementRef, HostListener } from '@angular/core';

// NgControl: Provides access to an associated Angular form control (like ngModel or formControlName).
// This is crucial for reading/writing the value of an input element within a form.
import { NgControl } from '@angular/forms';

// 2. Directive Definition: Configure the directive with its metadata

// @Directive: The decorator that makes this class an Angular Directive.
@Directive({
  // selector: Defines HOW this directive is applied in the HTML template.
  // '[appTextFormatter]': This is an attribute selector. It means the directive
  // will be applied to any HTML element that has the attribute 'appTextFormatter'.
  // Example usage in template: <input type="text" appTextFormatter>
  selector: '[appTextFormatter]',

  // standalone: Configuration flag (Angular v15.2+).
  // true: The directive is self-contained and doesn't need to be declared in an NgModule.
  //       You import it directly where you use it (e.g., in a component's 'imports' array).
  standalone: true
})
// 3. Directive Class: Contains the logic of the directive
export class TextFormatterDirective {

  // 4. Constructor: Injects dependencies the directive needs.
  // This runs when Angular creates an instance of the directive for an element.
  constructor(
    // private el: ElementRef: Injects a reference to the host HTML element.
    // This allows you to access the element's properties or perform direct DOM manipulation.
    // NOTE: While injected here, 'el' is NOT used directly in the 'onBlur' method in *this* specific directive.
    //       However, it's a very common dependency for directives that *do* need to interact directly with the DOM.
    // BEST PRACTICE NOTE: For safer DOM manipulation (especially with Server-Side Rendering),
    // consider injecting and using 'Renderer2' instead of direct 'el.nativeElement' access.
    private el: ElementRef,

    // private control: NgControl: Injects the Angular form control associated with the host element.
    // This is required to read the element's value within the form context and to update the form control's value.
    // NgControl is a base class representing form directives like NgModel, FormControlName, etc.
    // It gives you access to the form state (validity, touched, dirty) and the form value.
    private control: NgControl
  ) {}

  // 5. HostListener: Listen for events on the host element

  // @HostListener('blur'): Decorator that tells Angular to execute the decorated method
  // whenever the 'blur' event occurs on the host element where this directive is applied.
  // The 'blur' event fires when an element loses focus (e.g., clicking out of an input field).
  // You can listen to many DOM events: 'click', 'mouseover', 'keydown', 'focus', 'input', etc.
  // If you need event data (like the key pressed), you'd use: @HostListener('keydown', ['$event'])
  @HostListener('blur')
  onBlur() {
    // This method runs automatically when the 'blur' event happens on the host element.

    // Check if the form control actually has a value before processing.
    if (this.control.value) {

      // Get the current value from the form control and remove leading/trailing whitespace.
      const value = this.control.value.trim();

      // Check if there's still a value after trimming (handles inputs that were just spaces).
      if (value) {
        // --- The Core Formatting Logic ---
        // Get the first character of the trimmed value and convert it to uppercase.
        const firstChar = value.charAt(0).toUpperCase();
        // Get the rest of the string starting from the second character.
        const restOfString = value.slice(1);
        // Combine the formatted parts.
        const formatted = firstChar + restOfString;
        // --- End Formatting Logic ---

        // Update the value of the associated form control with the formatted string.
        // this.control.control: Accesses the underlying AbstractControl instance managed by NgControl.
        // ?. : Safe navigation operator. Ensures 'setValue' is only called if 'this.control.control' is not null/undefined.
        // setValue(formatted, { emitEvent: false }): Sets the new value.
        // { emitEvent: false }: This is a configuration option for setValue.
        //    emitEvent: false means Angular will NOT emit the 'valueChanges' and 'statusChanges' events
        //    for this form control when the value is changed programmatically by the directive.
        //    This is often used to prevent infinite loops or unintended reactions when a directive
        //    programmatically modifies the form value based on user input that would normally trigger events.
        //    If you wanted the normal form change events to fire, you could use { emitEvent: true } or omit the second argument.
        this.control.control?.setValue(formatted, { emitEvent: false });
      }

    }
  }

  // --- CONCEPTS NOT USED IN THIS SPECIFIC DIRECTIVE, BUT IMPORTANT FOR OTHERS ---

  // @HostBinding: Another important decorator for directives.
  // Use @HostBinding to BIND a property of the directive class to a property or attribute
  // of the host element. Whenever the directive property changes, Angular updates the host element.
  // Example: Change the border color of the input based on a directive property 'isFocused'.
  // @HostBinding('style.borderColor') borderColor!: string;
  // You would then set 'this.borderColor' inside your directive logic (e.g., in @HostListener for 'focus'/'blur').

  // Lifecycle Hooks: Directives have some lifecycle hooks similar to components.
  // ngOnInit(): Called once after the directive is first created and all its inputs are set. Good for initialization.
  // ngOnDestroy(): Called just before Angular destroys the directive. Good for cleanup (like unsubscribing).

  // @Input() / @Output(): Directives can also use @Input and @Output.
  // @Input() config: any; // To receive configuration data from where the directive is applied.
  // @Output() formatApplied = new EventEmitter<string>(); // To emit custom events from the directive.
  // While less common than in components, they are useful if the directive needs external data
  // or needs to signal something specific back to the parent template.

  // --- END OF ADDITIONAL CONCEPTS ---
}