import React from 'react';
import { Octokit } from "@octokit/core";

import SearchInput from './SearchInput';
import SearchList from './SearchList';
import Release from '../classes/Release.js'
import RepositoryList from './RepositoryList.js'

import '../styles/App.css';

const octokit = new Octokit();

function ApiExceededBanner(props){
  if (props.show)
    return <p class="apiExccedAlert">You have exceeded the limit for API calls. Please wait or use a VPN.</p>;
  else
    return null;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {searchValue: '', searchQueryResponse: {}, 
                  repoList: [], apiLimitExceeded: false,
                  showSearchList: true};

    this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
    this.handleSearchSubmitQuery = this.handleSearchSubmitQuery.bind(this);
    this.handleSearchListSelected = this.handleSearchListSelected.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSeenRelease = this.handleSeenRelease.bind(this);
    this.handleSearchInputOnFocus = this.handleSearchInputOnFocus.bind(this);
    this.handleSearchInputOnBlur = this.handleSearchInputOnBlur.bind(this);
  }

  componentDidMount(){
    this.setupBeforeUnloadListener();
    this.loadData();
  }

  loadData(){
    let dataJSON = window.localStorage.getItem("data");
    let dataObj = JSON.parse(dataJSON);

    if (dataObj == null)
      dataObj = [];
    else
      dataObj = dataObj.data

     this.setState({repoList: dataObj});
  }

  setupBeforeUnloadListener(){
    window.addEventListener("beforeunload", (ev) => {
      let dataString = JSON.stringify({data: this.state.repoList});
      window.localStorage.setItem("data", dataString);
    });
  };

  handleSearchSubmitQuery() {
    if (this.state.searchValue === '')
      return

    let query = this.state.searchValue + "+in:name";

    octokit.request('GET /search/repositories', {
        q: query
      }).then(
        (res) => {
          this.setState({searchQueryResponse: res, apiLimitExceeded: false});
        }
      ).catch(
        (error) => {
        console.log(error);
        this.setState({apiLimitExceeded: true});
    });
  }

  handleSeenRelease(release){
    let repoList = this.state.repoList.slice();

    for(let i = 0; i < repoList.length; i++){
      for(let j= 0; j < repoList[i].releases.length; j++){
        if (repoList[i].releases[j].id == release.id){
          release.seen = true;
          repoList[i].releases[j] = release;
          break;
        }
      }
    }

    this.setState({repoList: repoList});
  }

  handleSearchInputOnFocus()
  {
    this.setState({showSearchList: true})
  }

  handleSearchInputOnBlur(){
    setTimeout(()=>{this.setState({showSearchList: false})}, 100);
  }
  
  handleSearchInputChange(input) {
    this.setState({searchValue: input})
  }

  handleSearchListSelected(selectedRepo){
    this.updateRepoList(selectedRepo);
  }

  handleRefresh(){
    for(let i = 0; i < this.state.repoList.length; i++)
      this.updateRepoList(this.state.repoList[i]);
  }

  handleDelete(repo){
    let deleteIndex = this.findRepoIndex(repo);
    let repoList = this.state.repoList.slice();
    repoList.splice(deleteIndex, 1);
    this.setState({repoList: repoList});
  }

  parseReleaseReponse(selectedRepo, response){
    if (response.data.length === 0)
      return null;
    else{
      let latest = response.data[0];
      return new Release(latest.tag_name, latest.html_url, latest.published_at, 
                          latest.id, latest.body);
    }
  }

  findRepoIndex(repo){
    let repoList = this.state.repoList;

    for(let i = 0; i < repoList.length; i++){
      if (repoList[i].id == repo.id)
        return i;
    }
    return -1;
  }

  addRepoToList(repo){
    let repoList = this.state.repoList.slice();
    repoList.push(repo);
    this.setState({repoList: repoList});  
  }

  addReleaseToList(repo, release){ 
    let repoIndex = this.findRepoIndex(repo);
    let repoList = this.state.repoList.slice();

    if (!repoList[repoIndex].containsRelease(release)){
      repoList[repoIndex].releases.push(release);
      this.setState({repoList: repoList})
    }
  }

  updateRepoList(repo){
    octokit.request('GET /repos/{owner}/{repo}/releases', {
      owner: repo.owner,
      repo: repo.name
    }).then(
      (response) => {
        let release = this.parseReleaseReponse(repo, response)

        if (this.findRepoIndex(repo) == -1)
          this.addRepoToList(repo);

        if (release != null)
          this.addReleaseToList(repo, release);

        this.setState({apiLimitExceeded: false});
    }).catch(
      (error) => {
        console.log(error);
        this.setState({apiLimitExceeded: true});
    });
  }

  render() {
    return (
      <div class='container'>
        <h1 class="logo">Github Repository Tracker</h1>
        <ApiExceededBanner show={this.state.apiLimitExceeded}/>
          <SearchInput 
            value={this.state.searchValue}
            onSearchInputChange={this.handleSearchInputChange} 
            onPressEnter={this.handleSearchSubmitQuery} 
            onFocus={this.handleSearchInputOnFocus}
            onBlur={this.handleSearchInputOnBlur}/>
          <SearchList response={this.state.searchQueryResponse} 
                      onSearchListSelected={this.handleSearchListSelected}
                      showSearchList={this.state.showSearchList}/>
          <RepositoryList onDelete={this.handleDelete}
                        repoList={this.state.repoList}
                        onSeenRelease={this.handleSeenRelease}/>
          <button onClick={this.handleRefresh}>
            Check for New Releases
          </button>
      </div>
    );
  }
}

export default App;