import XCTest
import SwiftTreeSitter
import TreeSitterSlisp

final class TreeSitterSlispTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_slisp())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading SlightLisp grammar")
    }
}
