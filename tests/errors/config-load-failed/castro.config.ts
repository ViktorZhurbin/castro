// Anything that throws while Bun evaluates the config lands in
// CONFIG_LOAD_FAILED — a bad import, a ReferenceError, a failed validation at
// module scope. An explicit throw keeps the golden deterministic.
throw new Error("CASTRO_PORT must be a number");
