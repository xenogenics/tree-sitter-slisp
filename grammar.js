const CHAR = token(/\^([!-\[]|[\]-~]|\\\\|\\e|\\n|\\r|\\t)/);
const NUMBER = token(/-?[0-9]+/);
const STRING = token(/"([^"\\]|\\["\\0\\e\\n\\r\\t])*"/);
const SYMBOL = token(/([a-zA-Z]|[!@$%&*_+\-={}\[\]:#|\\<>?/])([a-zA-Z0-9]|[!@$%&*_+\-={}\[\]:#|\\<>?,/]){0,14}/);
const COMMENT = token(/;.*/);

module.exports = grammar({
  name: "slisp",

  extras: ($) => [/(\s|\f)/, $.comment],

  rules: {
    source_file: ($) => repeat(choice($.top_level_stmt, $.comment)),

    comment: ($) => COMMENT,

    // Top-level statement.

    top_level_stmt: ($) =>
      choice(
        $.function_definition,
        $.macro_definition,
        $.use_module,
      ),

    // Function and macro definitions.

    function_definition: ($) =>
      prec(
        1,
        seq(
          "(",
          "def",
          field("name", $.symbol),
          field("parameters", $.parameters),
          optional(field("docstring", $.string)),
          repeat($.tilde_or_backquote_or_simple_stmt),
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
          repeat($.tilde_or_backquote_or_simple_stmt),
          ")"
        )
      ),

    parameters: ($) =>
      choice(
        $.symbol,
        seq("(", repeat($.symbol), optional(seq($.dot, $.symbol)), ")"),
      ),

    // Use module definition.

    use_module: ($) =>
      prec(
        1,
        seq(
          "(",
          "use",
          repeat(
            choice(
              seq($.quote, $.symbol),
              seq($.quote, "(", repeat($.symbol), ")"),
            )
          ),
          ")"
        )
      ),

    // Statements, including ~() and `().

    tilde_or_backquote_or_simple_stmt: ($) =>
      choice(
        $.tilde_stmt,
        $.backquote_or_simple_stmt,
      ),

    // Statements, including `().

    backquote_or_simple_stmt: ($) =>
      choice(
        $.backquote_stmt,
        $.simple_stmt,
      ),

    // Statements.

    simple_stmt: ($) =>
      choice(
        $.apply_stmt,
        $.let_stmt,
        $.special_stmt,
        $.lambda_stmt,
        $.quote_stmt,
        $.terminal,
      ),

    // Apply statement.

    apply_stmt: ($) =>
      seq(
        "(",
        $.symbol,
        repeat($.tilde_or_backquote_or_simple_stmt),
        optional(seq($.dot, $.backquote_stmt)),
        ")",
      ),

    // Special form "let" statement.

    let_stmt: ($) =>
      seq(
        "(",
        "let",
        "(",
        repeat(
          seq(
            "(",
            $.symbol,
            optional($.dot),
            $.tilde_or_backquote_or_simple_stmt,
            ")",
          ),
        ),
        ")",
        repeat($.tilde_or_backquote_or_simple_stmt),
        ")"
      ),

    // Keyword statements.

    special_stmt: ($) =>
      seq(
        "(",
        choice("if", "prog", "syscall"),
        repeat($.tilde_or_backquote_or_simple_stmt),
        ")"
      ),

    // Lambda statements.

    lambda_stmt: ($) =>
      prec(
        1,
        seq(
          "(",
          "\\",
          field("parameters", $.parameters),
          repeat($.tilde_or_backquote_or_simple_stmt),
          ")"
        )
      ),

    // '() statement.

    quote_stmt: ($) => seq($.quote, $.list_or_terminal),
    
    list: ($) => seq("(", repeat($.item), optional($.dot_item), ")"),
    dot_item: ($) => seq($.dot, $.item),
    item: ($) => choice($.tilde_stmt, $.list_or_terminal),

    list_or_terminal: ($) =>
      choice(
        $.list,
        $.terminal,
      ),

    // ~() statement.

    tilde_stmt: ($) => seq($.tilde, $.backquote_stmt),

    // `() statement.

    backquote_stmt: ($) => seq($.backquote, $.unquote_list_or_terminal),
    unquote_stmt: ($) => seq($.unquote, $.simple_stmt),
    unquote_splice_stmt: ($) => seq($.unquote_splice, $.simple_stmt),

    unquote_list: ($) => seq("(", repeat($.unquote_item), optional($.unquote_dot_item), ")"),
    unquote_dot_item: ($) => seq($.dot, $.unquote_item),
    unquote_item: ($) => choice($.tilde_stmt, $.unquote_list_or_terminal),

    unquote_list_or_terminal: ($) =>
      choice(
        $.unquote_list,
        $.terminal,
        $.unquote_stmt,
        $.unquote_splice_stmt,
      ),

    // Operators.
      
    dot: ($) => ".",
    quote: ($) => "'",
    backquote: ($) => "`",
    unquote: ($) => ",",
    unquote_splice: ($) => ",@",
    tilde: ($) => "~",

    // Terminal.

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
