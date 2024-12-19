import chalk from "chalk";
import { BaseUI, IPosition } from "./baseUI.js";

export class ScrollUI extends BaseUI {
  // 向下滚动的距离
  private scrollTop: number = 0;

  // 当前选中
  private currentSelect: number = 0;

  // 上下移动
  private readonly KEYS = {
    up: () => this.moveCursor(-1),
    down: () => this.moveCursor(1),
  };
  constructor(private viewList: string[]) {
    super();
    this.render();
  }
  onKeyInput(key: string) {
    if (!["up", "down"].includes(key)) {
      return;
    }
    const name = key as "up" | "down";
    const action = this.KEYS[name];
    action();
    this.render();
  }
  moveCursor(step: number) {
    this.currentSelect += step;
    if (this.currentSelect < 0) {
      this.currentSelect = 0;
    }
    if (this.currentSelect >= this.viewList.length) {
      this.currentSelect = this.viewList.length - 1;
    }

    if (this.currentSelect < this.scrollTop) {
      this.scrollTop--;
    }
    if (this.currentSelect > this.scrollTop + this.terminalSize.rows - 2) {
      this.scrollTop++;
    }
  }

  // private moveCursor(index: number): void {
  //   this.currentSelect += index;

  //   if (this.currentSelect < 0) {
  //     this.currentSelect = 0;
  //   }

  //   if (this.currentSelect >= this.viewList.length) {
  //     this.currentSelect = this.viewList.length - 1;
  //   }

  //   this.fitScroll();
  // }

  // fitScroll() {
  //   const shouldScrollUp = this.currentSelect < this.scrollTop;

  //   const shouldScrollDown =
  //     this.currentSelect > this.scrollTop + this.terminalSize.rows - 2;

  //   if (shouldScrollUp) {
  //     this.scrollTop -= 1;
  //   }

  //   if (shouldScrollDown) {
  //     this.scrollTop += 1;
  //   }

  //   this.clear();
  // }
  bgRow(text: string): string {
    return chalk.bgBlue(
      text,
      " ".repeat(this.terminalSize.columns - text.length)
    );
  }
  clear() {
    for (let row = 0; row < this.terminalSize.rows; row++) {
      this.clearLine(row);
    }
  }
  // 渲染列表
  render() {
    this.clear();
    const list = this.viewList.slice(
      this.scrollTop,
      this.scrollTop + this.terminalSize.rows
    );
    list.forEach((view, index) => {
      const row = index;
      let content = view;
      if (this.currentSelect === this.scrollTop + row) {
        content = this.bgRow(view);
      }
      this.printAt(content, { x: 0, y: row });
    });
  }
}
