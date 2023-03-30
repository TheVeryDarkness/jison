expect.extend({
  toParse(received, message) {
    return received
      ? { pass: true }
      : { pass: false, message: () => message };
  }
});

