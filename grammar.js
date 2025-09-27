const CHAR = token(/\^([!-\[]|[\]-~]|\\\\|\\e|\\n|\\r|\\s|\\t)/);
const NUMBER = token(/-?[0-9]+/);
const HEXNUMBER = token(/x[0-9A-F]+/);
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
        $.external_definition,
        $.function_definition,
        $.macro_definition,
        $.use_module,
        $.val_definition,
      ),

    // Function and macro definitions.

    external_definition: ($) =>
      prec(
        1,
        seq(
          "(",
          "ext",
          field("name", $.symbol),
          field("symbol", $.symbol),
          field("signature", $.signature),
          optional(field("docstring", $.string)),
          field("return_type", $.external_type),
          ")"
        )
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

    external_type: ($) => choice("bytes", "integer", "string", "void"),

    parameters: ($) =>
      choice(
        $.symbol,
        seq(
          "(",
          repeat($.decons_stmt),
          optional(seq($.dot, $.symbol)),
          ")"
        ),
      ),

    signature: ($) =>
      seq("(", repeat(seq("(", $.symbol, $.dot, $.external_type, ")")), ")"),

    // Use module definition.

    use_module: ($) =>
      prec(
        1,
        seq(
          "(",
          "use",
          repeat(choice($.use_module_global, $.use_module_select)),
          ")"
        )
      ),

    use_module_global: ($) => seq($.quote, $.symbol),
    use_module_select: ($) => seq($.quote, "(", repeat($.symbol), ")"),

    // Val definition.
    
    val_definition: ($) =>
      seq(
        "(",
        "val",
        field("name", $.symbol),
        choice($.quote_list_or_terminal, $.backquote_stmt),
        ")",
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

    let_bindings: ($) =>
      seq(
        "(",
        repeat(
          seq(
            "(",
            $.decons_stmt,
            optional($.dot),
            $.tilde_or_backquote_or_simple_stmt,
            ")",
          ),
        ),
        ")",
      ),
    
    let_stmt: ($) =>
      seq(
        "(",
        "let",
        choice($.tilde_stmt, $.let_bindings),
        repeat($.tilde_or_backquote_or_simple_stmt),
        ")"
      ),

    // Keyword statements.

    special_stmt: ($) =>
      seq(
        "(",
        choice("if", "prog"),
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

    // Deconstruction statement.

    decons_stmt: ($) => choice($.symbol, $.decons_list),
    decons_list: ($) => seq("(", repeat($.decons_item), optional($.decons_dot_item), ")"),
    decons_dot_item: ($) => seq(".", $.decons_item),
    decons_item: ($) => choice($.symbol, $.wildcard, $.decons_list),

    // '() statement.

    quote_stmt: ($) => seq($.quote, $.quote_list_or_terminal),
    
    quote_list: ($) => seq("(", repeat($.quote_item), optional($.quote_dot_item), ")"),
    quote_dot_item: ($) => seq($.dot, $.quote_item),
    quote_item: ($) => choice($.tilde_stmt, $.quote_list_or_terminal),

    quote_list_or_terminal: ($) =>
      choice(
        $.quote_list,
        $.terminal,
      ),

    // ~() statement.

    tilde_stmt: ($) => seq($.tilde, $.backquote_stmt),

    // `() statement.

    backquote_stmt: ($) => seq($.backquote, $.backquote_list_or_terminal),
    
    backquote_list_or_terminal: ($) =>
      choice(
        $.backquote_list,
        $.terminal,
        $.unquote_stmt,
        $.unquote_splice_stmt,
      ),

    backquote_list: ($) => seq("(", repeat($.backquote_item), optional($.backquote_dot_item), ")"),
    backquote_dot_item: ($) => seq($.dot, $.backquote_item),
    backquote_item: ($) => choice($.tilde_stmt, $.backquote_list_or_terminal),

    unquote_stmt: ($) => seq($.unquote, $.simple_stmt),
    unquote_splice_stmt: ($) => seq($.unquote_splice, $.simple_stmt),

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
        $.symbol,
        $.wildcard,
      ),

    number: ($) => choice(NUMBER, HEXNUMBER),
    char: ($) => CHAR,
    string: ($) => STRING,
    symbol: ($) => choice("nil", "T", "it", "self", SYMBOL),
    wildcard: ($) => "_",
  },
});
