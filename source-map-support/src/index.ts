function add(a: number, b: number) {
  throw new Error("test error");
  return a + b;
}

add(5, 6);
