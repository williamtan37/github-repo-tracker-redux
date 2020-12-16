import React from 'react';

class SearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleChange(e) {
    this.props.onSearchInputChange(e.target.value);
  }
  handleSubmission(e){
    e.preventDefault();
  }
  handleKeyPress(e){
    if(e.key === 'Enter'){
      this.props.onPressEnter();
    }
  }
  render() {
    const searchValue = this.props.value;

    return (
      <form onSubmit={this.handleSubmission}>
        <label>
          <input value={searchValue}
            onChange={this.handleChange} 
            onKeyPress={this.handleKeyPress}
            placeholder="Press Enter to Search!"/>
        </label>
      </form>
      )
  }
}

export default SearchInput;