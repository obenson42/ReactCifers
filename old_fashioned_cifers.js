import './old_fashioned_codes.css';

const codeMethods = ['shift'];

class ProductCategoryRow extends React.Component {
    render() {
        const category = this.props.category;

        return (
            <tr>
                <th colspan="2">
                    {category}
                </th>
            </tr>

        );
    }
}

class ProductRow extends React.Component {
    render() {
        const product = this.props.product;
        const name = product.stocked ? product.name : <span style={{ color: 'red' }}>{product.name}</span>;

        return (
            <tr>
                <td>{name}</td>
                <td>{product.price}</td>
            </tr>
        );
     }
}

class FrequencyTable extends React.Component {
    render() {
        const clearText = this.props.clearText.toUpperCase();
        const codeMethod = this.props.codeMethod;

        const rows = [];

        for (i = 65; i <= 90; i++) {
            let instances = (clearText.match(new RegExp(string(i), "g")) || []).length;
            let spacer = "";
            for (j = 0; j < instances; j++) {
                spacer += " ";
            }
            rows.push(
                <tr><td>{spacer}</td></tr>
            )
        }

        return (
            <table class="frequency">
                <thead>
                    <tr>
                        <th>Letter Frequency</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
     }
}

class CodeForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleMethodChange = this.handleMethodChange.bind(this);
    }

    handleTextChange(e) {
        this.props.onTextChange(e.target.value);
    }

    handleMethodChange(e) {
        this.props.onMethodChange(e.target.checked);
    }

    render() {
        const clearText = this.props.clearText;
        const codeMethod = this.props.codeMethod;

        return (
            <form>
                <p>
                    <input type="radio" checked={this.props.codeMethod} onChange={this.handleMethodChange} />
                    {' '}
                    Shift
                </p>
                <textarea value={this.props.clearText} onChange={this.handleTextChange} ></textarea>
            </form>
        );
    }
}

class EncodeStuff extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clearText: '',
            codeMethod: 'shift'
        };
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleMethodChange = this.handleMethodChange.bind(this);
    }

    handleTextChange(clearText) {
        this.setState({ clearText: clearText });
    }

    handleMethodChange(codeMethod) {
        this.setState({ codeMethod: codeMethod });
    }

    render() {
        return (
            <div>
                <CodeForm
                    clearText={this.state.clearText}
                    codeMethod={this.state.codeMethod}
                    onTextChange={this.handleTextChange}
                    onMethodChange={this.handlMethodChange}
                />
                <FrequencyTable clearText={this.state.clearText} codeMethod={this.state.codeMethod} />
            </div>
        );
     }
}
