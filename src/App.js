import './App.css';

import React from 'react';
import SearchInput from './SearchInput';
import SearchList from './SearchList';
import { Octokit } from "@octokit/core";
import Release from './Release.js'
import RepositoryList from './RepositoryList.js'

const octokit = new Octokit();
var _ = require('lodash');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {searchValue: '', searchQueryResponse: {},
                  repoList: []};

    this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
    this.handleSearchSubmitQuery = this.handleSearchSubmitQuery.bind(this);
    this.handleSearchListSelected = this.handleSearchListSelected.bind(this);
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
          this.setState({searchQueryResponse: res});
        }
      );
  }

  parseReleaseReponse(selectedRepo, response){
      if (response.data.length === 0)
        return null;

      else{
        let latest = response.data[0];
        return new Release(latest.tag_name, latest.html_url, latest.published_at);
      }
    }

  getRepoIndex(repo){
    let repoList = this.state.repoList;

    for(let i = 0; i < repoList.length; i++){
      if (repoList[i].name == repo.name && repoList[i].owner == repo.owner)
        return i;
    }
    return -1;
  }

  addRepoToList(repo){
    let repoIndex =  this.getRepoIndex(repo);

    if(repoIndex == -1){
      let repoList = this.state.repoList.slice();
      repoList.push(repo);
      this.setState({repoList: repoList});
    }  
  }

  addReleaseToRepo(repo, release){
    if (release == null)
      return;

    let repoIndex = this.getRepoIndex(repo);
    let repoList = this.state.repoList.slice();
    if (!repoList[repoIndex].containsRelease(release)){
      repoList[repoIndex].releases.push(release);
      this.setState({repoList: repoList})
    }
  }

  handleSearchListSelected(selectedRepo){
    octokit.request('GET /repos/{owner}/{repo}/releases', {
      owner: selectedRepo.owner,
      repo: selectedRepo.name
    }).then(
      (response) => {
        let release = this.parseReleaseReponse(selectedRepo, response)
        this.addRepoToList(selectedRepo);
        this.addReleaseToRepo(selectedRepo, release);
    }
  );
  }

  render() {
    return (
      <div>
        <SearchInput 
          value={this.state.searchValue}
          onSearchInputChange={this.handleSearchInputChange} />

        <button onClick={this.handleSearchSubmitQuery}>Submit</button>

        <SearchList response={this.state.searchQueryResponse} 
                    onSearchListSelected={this.handleSearchListSelected}/>
        
        <RepositoryList repoList={this.state.repoList}/>
      </div>
    )
  }
}

export default App;