import React from 'react';
import './old_fashioned_cifers.css';

function App() {
    return (
        <div className="App">
            <EncodeStuff />
        </div>
    );
}

/// generic classes ///
// icon to toggle between left->right and right->left
class DirectionToggle extends React.Component {
    constructor(props) {
        super(props);
        this.state = { direction: "ltr" };  // left to right
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();
        if (this.state.direction === "ltr") {
            this.setState({ direction: "rtl" });
            this.props.onClick("rtl");
        } else {
            this.setState({ direction: "ltr" });
            this.props.onClick("ltr");
        }
    }

    render() {
        return (
            <button onClick={this.handleClick} alt="Encoding - click to decode" title="Encoding - click to decode" className={this.state.direction === "ltr" ? "ltr" : "rtl" } ></button>
        );
    }
}


// renders a table showing the usage frequency for each letter in the alphabet for the given textBlock.
class FrequencyTable extends React.Component {
    render() {
        const textBlock = this.props.textBlock.toUpperCase();

        const maxBarLength = 100;
        const spacers = [];
        const rows = [];
        let cells = [];
        let maxInstances = 0;
        let maxLetter = 0;

        // calculate letter frequencies and which is most used (maxLetter)
        for (let i = 65; i <= 90; i++) {
            let instances = (textBlock.match(new RegExp(String.fromCharCode(i), "g")) || []).length;
            if (instances > maxInstances) {
                maxInstances = instances;
                maxLetter = i;
            }
            spacers.push(instances);
        }
        // build row of bars
        for (let i = 65; i <= 90; i++) {
            let barStyle = {
                height: maxInstances > 0 ? spacers[i - 65] * maxBarLength / maxInstances : 0,
                width: "10px",
                margin: "auto"
            }
            let letterClass = (i === maxLetter) ? 'max_letter_bar' : 'letter_bar';
            cells.push(
                <td key={"bar" + i}><div className={letterClass} style={barStyle}></div></td>
            )
        }
        rows.push(<tr key="bars" className="bar_row">{cells}</tr>);
        // build row of letters
        cells = [];
        for (let i = 65; i <= 90; i++) {
            let letterClass = (i === maxLetter) ? 'max_letter' : 'letter';
            cells.push(
                <td key={"letter" + i} className={letterClass}>{String.fromCharCode(i)}</td>
            )
        }
        rows.push(<tr key="letters">{cells}</tr>);

        return (
            <div className={this.props.blockName}>
                <div className="sub_tab_name">Letter Frequency {this.props.blockName === "clearText" ? "(clear)" : "(encoded)"}</div>
                <table key={this.props.blockName} className="frequency">
                    <tbody>{rows}</tbody>
                </table>
            </div>
        );
    }
}

// renders a two row table, first row showing the normal alphabet, second row showing the alphabet shifted by the given offset.
class OffsetGrid extends React.Component {
    render() {
        const offset = this.props.offset;
        const rows = [];
        let cells = [];

        // normal alphabet row
        for (let i = 1; i <= 26; i++) {
            let char = String.fromCharCode(i + 64);
            cells.push(<td key={char}>{char}</td>);
        }
        rows.push(
            <tr key="normal">{cells}</tr>
        );
        // offset alphabet row
        cells = [];
        for (let i = 1; i <= 26; i++) {
            let j = i + offset;
            if (j > 26) j = j - 26;
            let char = String.fromCharCode(j + 64);
            cells.push(<td key={char}>{char}</td>);
        }
        rows.push(
            <tr key="offset">{cells}</tr>
        );
        // table with two rows
        return (
            <table className="offset_grid">
                <tbody>{rows}</tbody>
            </table>
        );
    }
}

// renders a 5x5 grid with the given keyword starting top-left and continuing left->right on each row. Letters not used in the keyword follow in alphabetic order.
// I and J are treated as one letter (I) in order to fit in the 25 cells.
class KeywordGrid extends React.Component {
    render() {
        const keyword = ((typeof this.props.keyword === 'string') ? this.props.keyword : "");
        const columns = 5; // this grid is always 5x5 with I and J treated as one entry
        const rows = [];
        let cells = [];
        let rowIndex = 0; // only used to put key on each row

        // create cells (and rows) with the keyword. Unless keyword is divisible by 5 there will be cells left not yet in a row.
        for (let i = 1; i <= keyword.length; i++) {
            cells.push(<td key={keyword[i - 1]} className="keyword">{keyword[i - 1]}</td>);
            if (i % columns === 0) { // enough cells to make a row => append a new row, clear the cells array
                rows.push(
                    <tr key={rowIndex++}>{cells}</tr>
                );
                cells = [];
            }
        }
        // append the rest of the alphabet. cells array probably already contains some cells from the keyword.
        for (let i = 1; i <= 26; i++) {
            let char = String.fromCharCode(i + 64);
            if (char !== "J" && keyword.indexOf(char) < 0) { // append this letter unless it is in the keyword or J (which we leave out so we can fit in 25 cells).
                cells.push(<td key={char}>{char}</td>);
                if (cells.length % columns === 0) { // enough cells to make a row => append a new row, clear the cells array
                    rows.push(
                        <tr key={rowIndex++}>{cells}</tr>
                    );
                    cells = [];
                }
            }
        }
        if (cells.length > 0) { // cells left over => append a new row
            rows.push(
                <tr key={rowIndex++}>{cells}</tr>
            );
        }
        // return table with 5 rows
        return (
            <table className="keyword_grid">
                <tbody>{rows}</tbody>
            </table>
        );
    }
}

// renders the two blocks of text, clear and encoded, and handles updates to them or to the direction of coding (encode/decode).
class TextBlocks extends React.Component {
    constructor(props) {
        super(props);
        this.handleClearTextChange = this.handleClearTextChange.bind(this);
        this.handleCodedTextChange = this.handleCodedTextChange.bind(this);
        this.handleDirectionChange = this.handleDirectionChange.bind(this);
    }

    handleClearTextChange(e) {
        this.props.onClearTextChange(e.target.value);
    }

    handleCodedTextChange(e) {
        this.props.onCodedTextChange(e.target.value);
    }

    handleDirectionChange(direction) {
        this.props.onDirectionChange(direction === "ltr" ? "encode" : "decode");
    }

    render() {
        const codeDirection = this.props.codeDirection;
        const clearText = this.props.clearText;
        const codedText = this.props.codedText;

        return (
            <form>
                <div className="text_blocks">
                    <div>
                        <div className="tab_name">Clear Text{codeDirection === "encode" ? " (type here)" : ""}</div>
                        <textarea id="clearText" rows="6" value={clearText} onChange={this.handleClearTextChange} disabled={codeDirection === "decode"}></textarea>
                    </div>
                    <div id="cipher_directions">
                        <DirectionToggle codeDirection={codeDirection} onClick={this.handleDirectionChange} />
                    </div>
                    <div>
                        <div className="tab_name">Encoded Text{codeDirection === "decode" ? " (type here)" : ""}</div>
                        <textarea id="codedText" rows="6" value={codedText} onChange={this.handleCodedTextChange} disabled={codeDirection === "encode"}></textarea>
                    </div>
                </div>
            </form>
        );
    }
}

// renders the cryptanalysis tools area
class CryptanalysisTools extends React.Component {
    constructor(props) {
        super(props);
        this.handleMethodChange = this.handleMethodChange.bind(this);
        this.handleOffsetChange = this.handleOffsetChange.bind(this);
        this.handleKeywordChange = this.handleKeywordChange.bind(this);
        this.handleKeepChange = this.handleKeepChange.bind(this);
        this.handleKeyword1Change = this.handleKeyword1Change.bind(this);
        this.handleKeyword2Change = this.handleKeyword2Change.bind(this);
    }

    handleMethodChange(codingMethod) {
        this.props.onMethodChange(codingMethod);
    }

    handleOffsetChange(offset) {
        this.props.onOffsetChange(offset);
    }

    handleKeywordChange(keyword) {
        this.props.onKeywordChange(keyword);
    }

    handleKeepChange(keep) {
        this.props.onKeepChange(keep);
    }

    handleKeyword1Change(keyword) {
        this.props.onKeyword1Change(keyword);
    }

    handleKeyword2Change(keyword) {
        this.props.onKeyword2Change(keyword);
    }

    countWords(str) {
        if (str === "")
            return 0;

        //exclude  start and end white-space
        str = str.replace(/(^\s*)|(\s*$)/gi, "");
        //convert 2 or more spaces to 1  
        str = str.replace(/[ ]{2,}/gi, " ");
        // exclude newline with a start spacing  
        str = str.replace(/\n /, "\n");
        // count spaces
        return str.split(' ').length;
    }

    averageWordLength(str) {
        if (str === "")
            return 0;

        //exclude  start and end white-space
        str = str.replace(/(^\s*)|(\s*$)/gi, "");
        //convert 2 or more spaces to 1  
        str = str.replace(/[ ]{2,}/gi, " ");
        // exclude newline with a start spacing  
        str = str.replace(/\n /, "\n");
        // count spaces
        let words = str.split(' ');
        if (words.length === 0)
            return 0;

        let totalWordLengths = 0;
        for (let i = 0; i < words.length; i++) {
            totalWordLengths += words[i].length;
        }
        return Math.round(100 * totalWordLengths / words.length) / 100;
    }

    render() {
        const clearText = this.props.clearText;
        const codedText = this.props.codedText;

        // calc word length
        return (
            <div id="cryptanalysis_tools">
                <CipherControls
                    cipherMethod={this.props.cipherMethod}
                    offset={this.props.offset}
                    keyword={this.props.keyword}
                    keyword1={this.props.keyword1}
                    keyword2={this.props.keyword2}
                    onMethodChange={this.handleMethodChange}
                    onOffsetChange={this.handleOffsetChange}
                    onKeywordChange={this.handleKeywordChange}
                    onKeepChange={this.handleKeepChange}
                    onKeyword1Change={this.handleKeyword1Change}
                    onKeyword2Change={this.handleKeyword2Change}
                />
                <div>
                    <div className="tab_name">Text Analysis Info</div>
                    <div className="info">
                        <div className="frequency_analysis">
                            <FrequencyTable blockName="clearText" textBlock={this.props.clearText} />
                            <FrequencyTable blockName="codedText" textBlock={this.props.codedText} />
                        </div>
                        <div className="other_analysis">
                            <div className="sub_tab_name">General Info</div>
                            <table>
                                <thead>
                                    <tr><th></th><th>Clear</th><th>Encoded</th></tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Word Count</td>
                                        <td>{this.countWords(clearText)}</td>
                                        <td>{this.countWords(codedText)}</td>
                                    </tr>
                                    <tr>
                                        <td>Word Length</td>
                                        <td>{this.averageWordLength(clearText)}</td>
                                        <td>{this.averageWordLength(codedText)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// renders a form with the controls for each of the cipher methods
class CipherControls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keepSpaces: false
        };
        this.handleMethodChange = this.handleMethodChange.bind(this);
        this.handleOffsetChange = this.handleOffsetChange.bind(this);
        this.handleKeywordChange = this.handleKeywordChange.bind(this);
        this.handleKeepChange = this.handleKeepChange.bind(this);
        this.handleKeyword1Change = this.handleKeyword1Change.bind(this);
        this.handleKeyword2Change = this.handleKeyword2Change.bind(this);
    }

    handleMethodChange(e) {
        e.preventDefault();
        this.props.onMethodChange(e.target.value);
    }

    handleOffsetChange(e) {
        this.props.onOffsetChange(e.target.value);
    }

    handleKeywordChange(e) {
        this.props.onKeywordChange(e.target.value);
    }

    handleKeepChange() {
        const keepSpaces = !this.state.keepSpaces;
        this.setState({ keepSpaces: keepSpaces });
        this.props.onKeepChange(keepSpaces);
    }

    handleKeyword1Change(e) {
        this.props.onKeyword1Change(e.target.value);
    }

    handleKeyword2Change(e) {
        this.props.onKeyword2Change(e.target.value);
    }

    render() {
        const cipherMethod = this.props.cipherMethod;
        const offset = this.props.offset;
        const keyword = this.props.keyword;
        const keyword1 = this.props.keyword1;
        const keyword2 = this.props.keyword2;
        const caesarClass = "caesar_btn" + (cipherMethod === "Caesar" ? "_active" : "");
        const playfairClass = "playfair_btn" + (cipherMethod === "Playfair" ? "_active" : "");
        const twoSquareClass = "two_square_btn" + (cipherMethod === "Two-square" ? "_active" : "");

        return (
            <form id="controls">
                <div id="control_panels">
                    <div id="cipher_methods">
                        <button className={caesarClass} value="Caesar" onClick={this.handleMethodChange}>Caesar</button>
                        <button className={playfairClass} value="Playfair" onClick={this.handleMethodChange}>Playfair</button>
                        <button className={twoSquareClass} value="Two-square" onClick={this.handleMethodChange}>Two-square</button>
                    </div>
                    <div id="cipher_properties">
                        <div id="caesar_properties" className={cipherMethod === 'Caesar' ? '' : 'inactive'}>
                            <span>Shift by <input type="text" defaultValue={offset} onChange={this.handleOffsetChange} maxLength="3" size="4" /> letters</span>
                            <OffsetGrid offset={offset} />
                        </div>
                        <div id="playfair_properties" className={cipherMethod === 'Playfair' ? '' : 'inactive'}>
                            <div className="keyword_and_grid">
                                <span>Keyword <input type="text" defaultValue={keyword} onChange={this.handleKeywordChange} minLength="6" maxLength="25" size="21" /></span>
                                <KeywordGrid keyword={keyword} />
                            </div>
                            <div>
                                <label><input type="checkbox" onChange={this.handleKeepChange} /> keep spaces and punctuation</label>
                            </div>
                        </div>
                        <div id="two_square_properties" className={cipherMethod === 'Two-square' ? '' : 'inactive'}>
                            <div className="keyword_and_grid">
                                <span>Keyword1 <input type="text" defaultValue={keyword1} onChange={this.handleKeyword1Change} minLength="6" maxLength="25" size="21" /></span>
                                <KeywordGrid keyword={keyword1} />
                            </div>
                            <div className="keyword_and_grid">
                                <span>Keyword2 <input type="text" defaultValue={keyword2} onChange={this.handleKeyword2Change} minLength="6" maxLength="25" size="21" /></span>
                                <KeywordGrid keyword={keyword2} />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}

/// the main class which deals with input and encodes/decodes the user-entered text using user-chosen options. ///
/// NB: needs changing so each encoding method is handled by its own class ///
class EncodeStuff extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            textBlock: '',
            codeDirection: 'encode',
            cipherMethod: 'Caesar',
            offset: 5,
            keyword: 'SQUANDER',
            keepSpaces: false,
            keyword1: 'EXAMPL',
            keyword2: 'KEYWORD'
        };
        this.handleClearTextChange = this.handleClearTextChange.bind(this);
        this.handleCodedTextChange = this.handleCodedTextChange.bind(this);
        this.handleDirectionChange = this.handleDirectionChange.bind(this);
        this.handleMethodChange = this.handleMethodChange.bind(this);
        this.handleOffsetChange = this.handleOffsetChange.bind(this);
        this.handleKeywordChange = this.handleKeywordChange.bind(this);
        this.handleKeepChange = this.handleKeepChange.bind(this);
        this.handleKeyword1Change = this.handleKeyword1Change.bind(this);
        this.handleKeyword2Change = this.handleKeyword2Change.bind(this);
    }

    handleClearTextChange(textBlock) {
        if (this.state.codeDirection === "encode")
            this.setState({ textBlock: textBlock });
    }

    handleCodedTextChange(textBlock) {
        if (this.state.codeDirection === "decode")
            this.setState({ textBlock: textBlock });
    }

    handleDirectionChange(codeDirection) {
        this.setState({ codeDirection: codeDirection });
        if (codeDirection === 'decode')
            this.setState({ textBlock: this.encodeText(this.state.textBlock, this.state.cipherMethod) });
        else
            this.setState({ textBlock: this.decodeText(this.state.textBlock, this.state.cipherMethod) });
    }

    handleMethodChange(cipherMethod) {
        this.setState({ cipherMethod: cipherMethod });
    }

    handleOffsetChange(offset) {
        if (/^\d+/.test(offset))
            this.setState({ offset: parseInt(offset) });
        else
            this.setState({ offset: 0 });
    }

    handleKeywordChange(keyword) {
        this.setState({ keyword: keyword.toUpperCase() });
    }

    handleKeepChange(keepSpaces) {
        this.setState({ keepSpaces: keepSpaces });
    }

    handleKeyword1Change(keyword) {
        this.setState({ keyword1: keyword.toUpperCase() });
    }

    handleKeyword2Change(keyword) {
        this.setState({ keyword2: keyword.toUpperCase() });
    }

    // returns the given textBlock encoded using the given cipherMethod.
    encodeText(textBlock, cipherMethod) {
        switch (cipherMethod) {
            case 'Caesar':
                return this.encodeTextByCaesar(textBlock, this.state.offset);
            case 'Playfair':
                return this.encodeTextByPlayfair(textBlock, this.state.keyword);
            case 'Two-square':
                return this.encodeTextByTwoSquare(textBlock, this.state.keyword1, this.state.keyword2);
            default:
                return "";
        }
    }

    // returns the given textBlock encoded using the Caesar method which is just shifting the alphabet x letters forward.
    encodeTextByCaesar(textBlock, offset) {
        let transformedText = '';

        for (let i = 0; i < textBlock.length; i++) {
            let letterCode = textBlock.charCodeAt(i);
            let transformedLetterCode = '';
            if (letterCode >= 65 && letterCode <= 90) { // uppercase
                transformedLetterCode = letterCode + offset;
                if (transformedLetterCode > 90) transformedLetterCode -= 26;
            } else if (letterCode >= 97 && letterCode <= 122) { // lowercase
                transformedLetterCode = letterCode + offset;
                if (transformedLetterCode > 122) transformedLetterCode -= 26;
            } else {
                transformedLetterCode = letterCode;
            }
            transformedText += String.fromCharCode(transformedLetterCode);
        }
        return transformedText;
    }

    // returns a string starting with the given keyword followed by the rest of the alphabet.
    // this is equivalent to the grid but in a form usable by indexOf
    buildKeywordGridAsString(keyword) {
        let grid = keyword; // grid starts with keyword

        if (typeof keyword != 'string' || keyword.length < 1) // safety checks
            return '';

        for (let i = 1; i <= 26; i++) {
            let char = String.fromCharCode(i + 64);
            if (char !== "J" && keyword.indexOf(char) < 0) { // skip J (because we combine it with I) and any letters in the keyword
                grid += char;
            }
        }
        return grid;
    }

    // returns the given textBlock encoded using the Playfair cipher which involves a keyword written into a 5x5 grid and a few rules for transforming pairs of characters
    // see https://en.wikipedia.org/wiki/Playfair_cipher
    encodeTextByPlayfair(textBlock, keyword) {
        const columns = 5;
        let clearText = '';
        let transformedText = '';

        if (typeof keyword != 'string' || keyword.length < 1) // safety checks
            return '';

        const grid = this.buildKeywordGridAsString(keyword); // get the grid as a string so indexOf can be used
        // remove all non letters and convert to upper case
        for (let i = 0; i < textBlock.length; i++) {
            let char = textBlock[i].toUpperCase();
            if (char >= 'A' && char <= 'Z')
                clearText += char;
        }
        for (let i = 0; i < clearText.length;) {
            // get pair of letters
            let letter1 = clearText[i] === 'J' ? 'I' : clearText[i];
            let letter2 = '';
            if (i < clearText.length - 1)
                letter2 = clearText[i + 1] === 'J' ? 'I' : clearText[i + 1];
            else
                letter2 = 'Q';
            // if same letters, use Q as second letter
            if (i > 0 && clearText[i] === clearText[i - 1]) {
                letter2 = letter1;
                letter1 = 'Q';
                i++;
            } else if (letter1 === letter2) {
                letter2 = 'Z';
                i++;
            } else {
                i += 2;
            }
            // get letter positions in the grid
            let pos1 = grid.indexOf(letter1);
            let col1 = pos1 % columns;
            let row1 = Math.floor(pos1 / columns);
            let pos2 = grid.indexOf(letter2);
            let col2 = pos2 % columns;
            let row2 = Math.floor(pos2 / columns);
            let tpos1 = -1;
            let tpos2 = -1;
            // transform
            if (col1 === col2) {
                // next down on same column
                row1 = (row1 === columns - 1) ? 0 : row1 + 1;
                row2 = (row2 === columns - 1) ? 0 : row2 + 1;
                tpos1 = col1 + row1 * columns;
                tpos2 = col2 + row2 * columns;
            } else if (row1 === row2) {
                // next along on same column
                col1 = (col1 === columns - 1) ? 0 : col1 + 1;
                col2 = (col2 === columns - 1) ? 0 : col2 + 1;
                tpos1 = col1 + row2 * columns;
                tpos2 = col2 + row1 * columns;
            } else {
                // get letters at opposite corners in the grid
                tpos1 = col2 + row1 * columns;
                tpos2 = col1 + row2 * columns;
            }
            if (tpos1 > 25) tpos1 -= 25;
            if (tpos2 > 25) tpos2 -= 25;
            transformedText += grid[tpos1] + grid[tpos2];
            // add spaces at random intervals (not required but looks good)
            if (Math.random() > 0.5) transformedText += " ";
        }
        return transformedText;
    }

    // returns the given textBlock encoded using the Two-square cipher which involves two keywords, each one written into a 5x5 grid and a few rules for transforming pairs of characters, first from the first grid, second from the second grid
    // see https://en.wikipedia.org/wiki/Two-square_cipher
    encodeTextByTwoSquare(textBlock, keyword1, keyword2) {
        const columns = 5;
        let clearText = '';
        let transformedText = '';

        if (typeof keyword1 != 'string' || keyword1.length < 1 || typeof keyword2 != 'string' || keyword2.length < 1) // safety checks
            return '';

        // get the grids as strings so indexOf can be used
        const grid1 = this.buildKeywordGridAsString(keyword1);
        const grid2 = this.buildKeywordGridAsString(keyword2);
        // remove all non letters and convert to upper case
        for (let i = 0; i < textBlock.length; i++) {
            let char = textBlock[i].toUpperCase();
            if (char >= 'A' && char <= 'Z')
                clearText += char;
        }
        for (let i = 0; i < clearText.length;) {
            // get pair of letters
            let letter1 = clearText[i] === 'J' ? 'I' : clearText[i];
            let letter2 = '';
            if (i < clearText.length - 1)
                letter2 = clearText[i + 1] === 'J' ? 'I' : clearText[i + 1];
            else
                letter2 = 'Q';
            // if same letters, use Q as second letter
            if (i > 0 && clearText[i] === clearText[i - 1]) {
                letter2 = letter1;
                letter1 = 'Q';
                i++;
            } else if (letter1 === letter2) {
                letter2 = 'Z';
                i++;
            } else {
                i += 2;
            }
            // get letter positions in the grid
            let pos1 = grid1.indexOf(letter1);
            let col1 = pos1 % columns;
            let row1 = Math.floor(pos1 / columns);
            let pos2 = grid2.indexOf(letter2);
            let col2 = pos2 % columns;
            let row2 = Math.floor(pos2 / columns);
            let tpos1 = -1;
            let tpos2 = -1;
            // transform
            if (col1 === col2) {
                // next down on same column
                row1 = (row1 === columns - 1) ? 0 : row1 + 1;
                row2 = (row2 === columns - 1) ? 0 : row2 + 1;
                tpos1 = col1 + row1 * columns;
                tpos2 = col2 + row2 * columns;
            } else if (row1 === row2) {
                // next along on same column
                col1 = (col1 === columns - 1) ? 0 : col1 + 1;
                col2 = (col2 === columns - 1) ? 0 : col2 + 1;
                tpos1 = col1 + row2 * columns;
                tpos2 = col2 + row1 * columns;
            } else {
                // get letters at opposite corners in the grid
                tpos1 = col2 + row1 * columns;
                tpos2 = col1 + row2 * columns;
            }
            if (tpos1 > 25) tpos1 -= 25;
            if (tpos2 > 25) tpos2 -= 25;
            transformedText += grid1[tpos1] + grid2[tpos2];
            // add spaces at random intervals (not required but looks good)
            if (Math.random() > 0.5) transformedText += " ";
        }
        return transformedText;
    }

    // returns the given textBlock decoded by the given cipherMethod.
    decodeText(textBlock, cipherMethod) {
        switch (cipherMethod) {
            case 'Caesar':
                return this.decodeTextByCaesar(textBlock, this.state.offset);
            case 'Playfair':
                return this.decodeTextByPlayfair(textBlock, this.state.keyword, this.state.keepSpaces);
            case 'Two-square':
                return this.decodeTextByTwoSquare(textBlock, this.state.keyword1, this.state.keyword2, this.state.keepSpaces);
            default:
                return "";
        }
    }

    // returns the given textBlock decoded using the Caesar method which is just shifting the alphabet x letters backwards.
    decodeTextByCaesar(textBlock, offset) {
        let transformedText = '';

        for (let i = 0; i < textBlock.length; i++) {
            let letterCode = textBlock.charCodeAt(i);
            let transformedLetterCode = '';
            if (letterCode >= 65 && letterCode <= 90) { // uppercase
                transformedLetterCode = letterCode - offset;
                if (transformedLetterCode < 65) transformedLetterCode += 26;
            } else if (letterCode >= 97 && letterCode <= 122) { // lowercase
                transformedLetterCode = letterCode - offset;
                if (transformedLetterCode < 97) transformedLetterCode += 26;
            } else {
                transformedLetterCode = letterCode;
            }
            transformedText += String.fromCharCode(transformedLetterCode);
        }
        return transformedText;
    }

    // returns the given textBlock decoded using the Playfair cipher which involves a keyword written into a 5x5 grid and a few rules for transforming pairs of characters
    // see https://en.wikipedia.org/wiki/Playfair_cipher
    decodeTextByPlayfair(textBlock, keyword, keepSpaces) {
        const columns = 5;
        let codedText = '';
        let transformedText = '';

        if (typeof keyword != 'string' || keyword.length < 1)
            return '';

        const grid = this.buildKeywordGridAsString(keyword);
        // remove all non letters and convert to upper case
        for (let i = 0; i < textBlock.length; i++) {
            let char = textBlock[i].toUpperCase();
            if (char >= 'A' && char <= 'Z')
                codedText += char;
        }
        // ensure even number of characters
        if (codedText.length % 2 === 1)
            codedText = codedText.substring(0, codedText.length - 1);

        // convert pairs of letters
        for (let i = 0; i < codedText.length; i += 2) {
            // get pair of letters
            let letter1 = codedText[i] === 'J' ? 'I' : codedText[i];
            let letter2 = codedText[i + 1] === 'J' ? 'I' : codedText[i + 1];
            // get letter positions in the grid
            let pos1 = grid.indexOf(letter1);
            let col1 = pos1 % columns;
            let row1 = Math.floor(pos1 / columns);
            let pos2 = grid.indexOf(letter2);
            let col2 = pos2 % columns;
            let row2 = Math.floor(pos2 / columns);
            let tpos1 = -1;
            let tpos2 = -1;
            // transform
            if (col1 === col2) {
                // next up on same column
                row1 = (row1 === 0) ? columns - 1 : row1 - 1;
                row2 = (row2 === 0) ? columns - 1 : row2 - 1;
                tpos1 = col1 + row1 * columns;
                tpos2 = col2 + row2 * columns;
            } else if (row1 === row2) {
                // next along on same column
                col1 = (col1 === 0) ? columns - 1 : col1 - 1;
                col2 = (col2 === 0) ? columns - 1 : col2 - 1;
                tpos1 = col1 + row2 * columns;
                tpos2 = col2 + row1 * columns;
            } else {
                // get letters at opposite corners in the grid
                tpos1 = col2 + row1 * columns;
                tpos2 = col1 + row2 * columns;
            }
            if (tpos1 > 25) tpos1 -= 25;
            if (tpos2 > 25) tpos2 -= 25;
            if (grid[tpos1] !== 'Q' && grid[tpos1] !== 'Z' && grid[tpos1] !== 'X')
                transformedText += grid[tpos1];
            if (grid[tpos2] !== 'Q' && grid[tpos2] !== 'Z' && grid[tpos2] !== 'X')
                transformedText += grid[tpos2];
        }
        // if keepSpaces then put non-alpha characters back in
        if (keepSpaces) {
            for (let i = 0; i < textBlock.length; i++) {
                if ((textBlock[i] >= 'A' && textBlock[i] <= 'Z') || (textBlock[i] >= 'a' && textBlock[i] <= 'z'))
                    continue;
                // non-alpha character => insert into transformed text  
                transformedText = transformedText.substring(0, i) + textBlock[i] + transformedText.substring(i);
            }
        }
        return transformedText;
    }

    // returns the given textBlock encoded using the Two-square cipher which involves two keywords, each one written into a 5x5 grid and a few rules for transforming pairs of characters, first from the first grid, second from the second grid
    // see https://en.wikipedia.org/wiki/Two-square_cipher
    decodeTextByTwoSquare(textBlock, keyword1, keyword2, keepSpaces) {
        const columns = 5;
        let codedText = '';
        let transformedText = '';

        if (typeof keyword1 != 'string' || keyword1.length < 1 || typeof keyword2 != 'string' || keyword2.length < 1)
            return '';

        const grid1 = this.buildKeywordGridAsString(keyword1);
        const grid2 = this.buildKeywordGridAsString(keyword2);
        // remove all non letters and convert to upper case
        for (let i = 0; i < textBlock.length; i++) {
            let char = textBlock[i].toUpperCase();
            if (char >= 'A' && char <= 'Z')
                codedText += char;
        }
        // ensure even number of characters
        if (codedText.length % 2 === 1)
            codedText = codedText.substring(0, codedText.length - 1);
        // convert pairs of letters
        for (let i = 0; i < codedText.length; i += 2) {
            // get pair of letters
            let letter1 = codedText[i] === 'J' ? 'I' : codedText[i];
            let letter2 = codedText[i + 1] === 'J' ? 'I' : codedText[i + 1];
            // get letter positions in the grid
            let pos1 = grid1.indexOf(letter1);
            let col1 = pos1 % columns;
            let row1 = Math.floor(pos1 / columns);
            let pos2 = grid2.indexOf(letter2);
            let col2 = pos2 % columns;
            let row2 = Math.floor(pos2 / columns);
            let tpos1 = -1;
            let tpos2 = -1;
            // transform
            if (col1 === col2) {
                // next up on same column
                row1 = (row1 === 0) ? columns - 1 : row1 - 1;
                row2 = (row2 === 0) ? columns - 1 : row2 - 1;
                tpos1 = col1 + row1 * columns;
                tpos2 = col2 + row2 * columns;
            } else if (row1 === row2) {
                // next along on same column
                col1 = (col1 === 0) ? columns - 1 : col1 - 1;
                col2 = (col2 === 0) ? columns - 1 : col2 - 1;
                tpos1 = col1 + row2 * columns;
                tpos2 = col2 + row1 * columns;
            } else {
                // get letters at opposite corners in the grid
                tpos1 = col2 + row1 * columns;
                tpos2 = col1 + row2 * columns;
            }
            if (tpos1 > 25) tpos1 -= 25;
            if (tpos2 > 25) tpos2 -= 25;
            if (grid1[tpos1] !== 'Q' && grid1[tpos1] !== 'Z')
                transformedText += grid1[tpos1];
            if (grid2[tpos2] !== 'Q' && grid2[tpos2] !== 'Z')
                transformedText += grid2[tpos2];
        }
        return transformedText;
    }

    // renders a div containing the clear and encoded text blocks, info about the text blocks, and the controls for encoding
    render() {
        const clearText = (this.state.codeDirection === 'encode') ? this.state.textBlock : this.decodeText(this.state.textBlock, this.state.cipherMethod);
        const codedText = (this.state.codeDirection === 'decode') ? this.state.textBlock : this.encodeText(this.state.textBlock, this.state.cipherMethod);

        return (
            <div className="encode_stuff">
                <TextBlocks
                    codeDirection={this.state.codeDirection}
                    clearText={clearText}
                    codedText={codedText}
                    onClearTextChange={this.handleClearTextChange}
                    onCodedTextChange={this.handleCodedTextChange}
                    onDirectionChange={this.handleDirectionChange}
                />
                <CryptanalysisTools
                    clearText={clearText}
                    codedText={codedText}
                    cipherMethod={this.state.cipherMethod}
                    offset={this.state.offset}
                    keyword={this.state.keyword}
                    keyword1={this.state.keyword1}
                    keyword2={this.state.keyword2}
                    onMethodChange={this.handleMethodChange}
                    onOffsetChange={this.handleOffsetChange}
                    onKeywordChange={this.handleKeywordChange}
                    onKeepChange={this.handleKeepChange}
                    onKeyword1Change={this.handleKeyword1Change}
                    onKeyword2Change={this.handleKeyword2Change}
                />
            </div>
        );
    }
}

export default App;
