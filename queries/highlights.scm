;; Special forms
[
  "cond"
  "if"
  "let"
  "load"
  "match"
  "prog"
  "quote"
  "syscall"
  "unless"
] @keyword

;; Apply
(list . (symbol) @function)

;; Function definitions
[
 "def"
 ] @keyword

(function_definition name: (symbol) @function)
(function_definition parameters: (list (symbol) @variable.parameter))
(function_definition docstring: (string) @comment)


;; Lambda 
[
 "\\"
 ] @keyword

(lambda parameters: (list (symbol) @variable.parameter))

;; Atoms
(char) @number
(comment) @comment
(number) @number
(quote) @operator
(string) @string

;; Punctuation
[
  "("
  ")"
] @punctuation.bracket

;; Operators
[
  "~"
  "'"
  "`"
  ","
] @operator

;; Highlight nil and t as constants, unlike other symbols
[
  "nil"
  "t"
] @constant.builtin

