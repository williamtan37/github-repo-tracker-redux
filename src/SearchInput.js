import React from 'react';

class SearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onSearchInputChange(e.target.value);
  }

  render() {
    const searchValue = this.props.value;

    return (
      <form>
        <label>
          Search for Repository:
          <br/>
          <input value={searchValue}
            onChange={this.handleChange} />
        </label>
      </form>
      )
  }
}

export default SearchInput;