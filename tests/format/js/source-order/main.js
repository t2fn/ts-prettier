function foo() {
  return bar;
}

for (let i = 0; i < 10; i++) {
  console.log(i);
}

for (const x of items) {
  process(x);
}

while (condition) {
  doSomething();
}

do {
  doAnother();
} while (anotherCondition);

if (value) {
  handle(value);
} else {
  handleDefault();
}

class MyClass {
  constructor() {
    this.init();
  }

  method() {
    return this;
  }
}

const arrow = () => {
  return 42;
};

const arrowShort = () => 42;

async function asyncFunction() {
  return await fetch(url);
}

async () => {
  const data = await fetch(url);
  return data;
};
