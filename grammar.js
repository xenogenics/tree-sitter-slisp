const CHAR = token(/\^([!-\[]|[\]-~]|\\\\|\\e|\\n|\\r|\\t)/);
const NUMBER = token(/-?[0-9]+/);
const STRING = token(/"([^"\\]|\\["\\0\\e\\n\\r\\t])*"/);
const SYMBOL = token(/([a-zA-Z]|[!@$%&*_+\-={}\[\]:#|\\<>?/])([a-zA-Z0-9]|[!@$%&*_+\-={}\[\]:;|\\<>?,/]){0,14}/);
const COMMENT = token(/;.*/);

module.exports = grammar({
  name: "slisp",

  extras: ($) => [/(\s|\f)/, $.comment],

  rules: {
    source_file: ($) => repeat($._sexp),

    _sexp: ($) =>
      choice(
        $.special_form,
        $.function_definition,
        $.lambda,
        $.list,
        $._atom,
        $.tilde,
        $.backquote,
        $.quote,
        $.unquote,
      ),

    special_form: ($) =>
      seq(
        "(",
        choice(
          "cond",
          "if",
          "let",
          "load",
          "match",
          "prog",
          "quote",
          "syscall",
          "unless",
        ),
        repeat($._sexp),
        ")"
      ),

    function_definition: ($) =>
      prec(
        1,
        seq(
          "(",
          "def",
          field("name", $.symbol),
          field("parameters", $._sexp),
          optional(field("docstring", $.string)),
          repeat($._sexp),
          ")"
        )
      ),

    lambda: ($) =>
      prec(
        1,
        seq("(", "\\", field("parameters", $._sexp), repeat($._sexp), ")")
      ),

    _atom: ($) =>
      choice(
        $.number,
        $.char,
        $.string,
        $.symbol
      ),

    number: ($) => NUMBER,
    char: ($) => CHAR,
    string: ($) => STRING,
    symbol: ($) => choice("nil", "t", SYMBOL),
    tilde: ($) => seq("~", $._sexp),
    backquote: ($) => seq("`", $._sexp),
    quote: ($) => seq("'", $._sexp),
    unquote: ($) => seq(",", $._sexp),
    dot: ($) => token("."),
    list: ($) => seq("(", choice(repeat($._sexp)), ")"),

    comment: ($) => COMMENT,
  },
});
