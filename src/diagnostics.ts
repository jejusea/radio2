export class Diagnostics {
  private errors: string[] = [];
  private skipped = new Set<string>();
  private lastInput = "NONE";
  error(message: string) { this.errors.push(message); this.errors = this.errors.slice(-20); }
  skip(file: string) { this.skipped.add(file); this.error(`SKIP ${file}`); }
  input(kind: string) { this.lastInput = kind; }
  snapshot() { return { lastInput: this.lastInput, errors: this.errors.slice(-5), skipped: [...this.skipped], watchdog: "ACTIVE" }; }
}
