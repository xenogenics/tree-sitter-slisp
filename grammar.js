const CHAR = token(/\^([!-\[]|[\]-~]|\\\\|\\e|\\n|\\r|\\t)/);
const NUMBER = token(/-?[0-9]+/);
const STRING = token(/"([^"\\]|\\["\\0\\e\\n\\r\\t])*"/);
const SYMBOL = token(/([a-zA-Z]|[!@$%&*_+\-={}\[\]:#|\\<>?/])([a-zA-Z0-9]|[!@$%&*_+\-={}\[\]:;|\\<>?,/]){0,14}/);
const COMMENT = token(/;.*/);

module.exports = grammar({
  name: "slisp",

  extras: ($) => [/(\s|\f)/, $.comment],

  rules: {
    source_file: ($) => repeat(choice($.top_level_statement, $.comment)),

    comment: ($) => COMMENT,

    top_level_statement: ($) =>
      choice(
        $.function_definition,
        $.macro_definition,
        $.use_module,
      ),

    function_definition: ($) =>
      prec(
        1,
        seq(
          "(",
          "def",
          field("name", $.symbol),
          field("parameters", $.parameters),
          optional(field("docstring", $.string)),
          repeat($.statement),
          ")"
        )
      ),
      
    macro_definition: ($) =>
      prec(
        1,
        seq(
          "(",
          "mac",
          field("name", $.symbol),
          field("parameters", $.parameters),
          optional(field("docstring", $.string)),
          repeat($.statement),
          ")"
        )
      ),

    parameters: ($) =>
      choice(
        $.symbol,
        seq("(", repeat($.symbol), optional(seq(".", $.symbol)), ")"),
      ),

    use_module: ($) =>
      prec(
        1,
        seq(
          "(",
          "use",
          repeat(
            choice(
              seq("'", $.symbol),
              seq("'", "(", repeat($.symbol), ")"),
            )
          ),
          ")"
        )
      ),

    statement: ($) =>
      choice(
        $.apply,
        $.special_form,
        $.lambda,
        $.tilde,
        $.backquote,
        $.quote,
        $.terminal,
      ),
      
    dot_statement: ($) => seq(".", $.statement),

    apply: ($) =>
      seq(
        "(",
        $.symbol,
        repeat($.statement),
        optional($.dot_statement),
        ")",
      ),

    special_form: ($) =>
      seq(
        "(",
        choice(
          "if",
          "let",
          "prog",
          "quote",
          "syscall",
        ),
        repeat($.statement),
        ")"
      ),

    lambda: ($) =>
      prec(
        1,
        seq("(", "\\", field("parameters", $.parameters), repeat($.statement), ")")
      ),

    tilde: ($) => seq("~", $.statement),
    backquote: ($) => seq("`", choice($.list_or_terminal, $.unquote)),
    quote: ($) => seq("'", $.list_or_terminal),
    unquote: ($) => seq(",", $.statement),

    list: ($) => seq("(", repeat($.item), optional($.dot_item), ")"),
    dot_item: ($) => seq(".", $.item),
    item: ($) => choice($.tilde, $.list_or_terminal),

    list_or_terminal: ($) =>
      choice(
        $.list,
        $.terminal,
      ),

    terminal: ($) =>
      choice(
        $.number,
        $.char,
        $.string,
        $.symbol
      ),

    number: ($) => NUMBER,
    char: ($) => CHAR,
    string: ($) => STRING,
    symbol: ($) => choice("nil", "T", "it", SYMBOL),
  },
});
