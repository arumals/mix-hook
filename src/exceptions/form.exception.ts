export class FormException<T> extends Error {
  errors: T;

  constructor(errors: T) {
    super("FORM_EXCEPTION");
    this.errors = errors;
  }
}
