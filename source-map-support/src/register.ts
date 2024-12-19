import chalk from "chalk";
import fs from "fs";
import { SourceMapConsumer } from "source-map";
import { fileURLToPath } from "url";
import path from "path";

Error.prepareStackTrace = (error, stackTraces) => {
  const { name, message } = error;
  const errorString = name + ":" + message;

  const processedStack = [];
  for (let stack of stackTraces) {
    const newStack = wrapCallSite(stack);
    processedStack.push(`\n    at ${newStack}`);
  }
  return errorString + processedStack.join("");
};

// 根据url获取原始文件url
function retrieveSourceMapUrl(url: string): string | null {
  let content: string = "";
  const regexp = /# sourceMappingURL=(.*)$/g;
  try {
    content = fs.readFileSync(url, { encoding: "utf-8" }).toString();
  } catch (err) {
    console.log(chalk.red(`读取文件失败，${err}`));
  }
  let match = regexp.exec(content);
  let latestMatch = "";
  while (match) {
    latestMatch = match[1];
    match = regexp.exec(content);
  }
  if (latestMatch) {
    return latestMatch;
  }
  return null;
}

function mapSourcePosition(source: string, line: number, column: number) {
  const regExp = /^file:\/\//;
  if (regExp.test(source)) {
    source = fileURLToPath(source);
  }
  // 当路径不存在，终止
  if (!fs.existsSync(source)) return null;

  // 根据dist源码获取sourceMap文件url
  const sourceMapUrl = retrieveSourceMapUrl(source);
  // 读取文件时，进行错误处理
  if (sourceMapUrl) {
    let dirname = path.dirname(source);
    const sourceMapPath = path.join(dirname, sourceMapUrl);
    let content: string = "";
    try {
      content = fs.readFileSync(sourceMapPath, { encoding: "utf-8" });
    } catch (err) {
      console.log(chalk.red(`读取文件失败，${err}`));
    }
    if (content) {
      const consumer = new SourceMapConsumer(content as any);
      const position = consumer.originalPositionFor({ line, column });
      return {
        source: path.join(dirname, position.source),
        line: position.line,
        column: position.column,
      };
    }
    return null;
  }
}
function wrapCallSite(frame: NodeJS.CallSite) {
  const source = frame.getFileName();

  if (source) {
    let position: Record<string, any> | null | undefined = {
      source: frame.getFileName(),
      line: frame.getLineNumber(),
      column: frame.getColumnNumber(),
    };
    if (source.startsWith("file:/")) {
      position = mapSourcePosition(
        source,
        frame.getLineNumber()!,
        frame.getColumnNumber()!
      );
    }

    const newFrame: Record<string, any> = {};
    newFrame.getFunctionName = function () {
      return frame.getFunctionName();
    };
    newFrame.getFileName = function () {
      return position?.source;
    };
    newFrame.getLineNumber = function () {
      return position?.line;
    };
    newFrame.getColumnNumber = function () {
      return position?.column;
    };
    newFrame.toString = function () {
      return (
        this.getFunctionName() +
        " (" +
        this.getFileName() +
        ":" +
        this.getLineNumber() +
        ":" +
        this.getColumnNumber() +
        ")"
      );
    };
    return newFrame;
  }
  return frame;
}
