import ansiEscapes from "ansi-escapes";
export interface IPosition {
  x: number;
  y: number;
}
//实现print、printAt、clearLine
export abstract class BaseUI {
  protected stdout = process.stdout;
  constructor() {}
  protected print(text: string) {
    process.stdout.write.bind(process.stdout)(text);
  }
  printAt(text: string, position: { x: number; y: number }) {
    this.setCursorAt(position);
    this.print(text);
  }
  setCursorAt(position: IPosition) {
    this.print(ansiEscapes.cursorTo(position.x, position.y));
  }

  protected clearTerminal() {
    this.print(ansiEscapes.clearTerminal);
  }

  protected clearLine(row: number) {
    this.printAt(ansiEscapes.eraseLine, { x: 0, y: row });
  }
  get terminalSize(): { rows: number; columns: number } {
    return {
      rows: process.stdout.rows,
      columns: process.stdout.columns,
    };
  }

  abstract render(): void;
}
