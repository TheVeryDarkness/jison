const Shared = {
  printed: [],
  print: function () {
    Shared.printed.push([...arguments].join(' '));
  },
  nothingPrinted: () => {
    const printedDuringTest = Shared.printed;
    Shared.printed = [];
    expect(printedDuringTest).toEqual([]);
  },

  /**
   * use like so:
   *     const capture = Shared.capture(Jison);
   *     <do something noisy>
   *     expect(capture.release()).toEqual(expectedErrorMessages);
   * @param jison
   * @returns {{release: (function(): *[])}}
   */
  capture: (jison) => {
    const oldPrint = jison.print;
    const printed = [];
    jison.print = function () {
      printed.push([...arguments].join(''));
    }
    return {
      release: () => {
        jison.print = oldPrint;
        return printed;
      }
    }
  }
}

expect.extend({
  // convenience to pass messsage when failed (to parse, really failed anything -- TODO: rename?)
  toParse(received, message) {
    return received
      ? { pass: true }
      : { pass: false, message: () => message };
  },

  // test and remove first of the Shared printed results
  printed(_, expected) {
    if (Shared.printed.length < expected.length)
      return { pass: false, message: () => `expected to have printed ${expected}` };
    const got = Shared.printed.splice(0, expected.length); // remove first n printed lines
    for (let i = 0; i < expected.length; ++i) {
      const passed = expected[i] instanceof RegExp
          ? got[i].match(expected[i])
          : got[i] === expected[i];
      if (!passed)
        return { pass: false, message: () => `${i}th element: expected ${got[i]} to match ${expected[i]}` };
    }
    return { pass: true, message: () => `${got.join(", ")} not expected to match ${expected.join(", ")}` };
  }
});

module.exports = Shared;
