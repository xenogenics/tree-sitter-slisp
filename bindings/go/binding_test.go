package tree_sitter_slisp_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_slisp "github.com/tree-sitter/tree-sitter-slisp/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_slisp.Language())
	if language == nil {
		t.Errorf("Error loading SlightLisp grammar")
	}
}
