import './App.css';

import React from 'react';
import SearchInput from './SearchInput';
import SearchList from './SearchList';
import { Octokit } from "@octokit/core";

const octokit = new Octokit();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {searchValue: '', searchQueryResponse: {}};

    this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
    this.handleSearchSubmitQuery = this.handleSearchSubmitQuery.bind(this);
  }

  handleSearchInputChange(input) {
    this.setState({searchValue: input})
  }
  handleSearchSubmitQuery() {
    if (this.state.searchValue === '')
      return

    let query = this.state.searchValue + "+in:name";
    octokit.request('GET /search/repositories', {
        q: query
      }).then(
        (res) => {
          console.log(res);
          this.setState({searchQueryResponse: res});
        }
      );
  }
  render() {

    return (
      <div>
        <SearchInput 
          value={this.state.searchValue}
          onSearchInputChange={this.handleSearchInputChange} />
        <br/>
        <button onClick={this.handleSearchSubmitQuery}>Submit</button>
        <SearchList response={this.state.searchQueryResponse} />
        {this.state.searchValue}


      </div>
    )
  }

}

export default App;
