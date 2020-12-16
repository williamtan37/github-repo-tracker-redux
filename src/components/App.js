import React from 'react';
import { Octokit } from "@octokit/core";
import '../styles/App.css';

import SearchInput from './SearchInput';
import SearchList from './SearchList';
import Release from '../classes/Release.js'
import RepositoryList from './RepositoryList.js'

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
                  showList:true};

    this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
    this.handleSearchSubmitQuery = this.handleSearchSubmitQuery.bind(this);
    this.handleSearchListSelected = this.handleSearchListSelected.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSeenRelease = this.handleSeenRelease.bind(this);
    this.handleSearchInputOnFocus = this.handleSearchInputOnFocus.bind(this);
    this.handleSearchInputOnBlur = this.handleSearchInputOnBlur.bind(this);

  }

  doSomethingBeforeUnload() {
    let dataString = JSON.stringify({data:this.state.repoList});
    var myStorage = window.localStorage;
    myStorage.setItem("info", dataString);
  }

  setupBeforeUnloadListener(){
    window.addEventListener("beforeunload", (ev) => {
        ev.preventDefault();
        return this.doSomethingBeforeUnload();
    });
  };

  componentDidMount(){
    var myStorage = window.localStorage;
     
    let dataObj = JSON.parse(myStorage.getItem("info"));
    console.log(dataObj);
    if (dataObj == null || JSON.stringify(dataObj) == '{}')
      dataObj = [];
    else
      dataObj = dataObj.data

     this.setState({repoList:dataObj});
     this.setupBeforeUnloadListener();
  }

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

    for(let i=0; i<repoList.length; i++){
      for(let j=0; j<repoList[i].releases.length; j++){
        if (repoList[i].releases[j].id == release.id){
          release.seen = true;
          repoList[i].releases[j] = release;
          break;
        }
      }
    }
    this.setState({repoList:repoList});
  }

  handleSearchInputOnFocus()
  {
    this.setState({showList:true})
  }

  handleSearchInputOnBlur(){
    setTimeout(()=>{this.setState({showList:false})},100);
  }
  
  handleSearchInputChange(input) {
    this.setState({searchValue: input})
  }


  parseReleaseReponse(selectedRepo, response){
    if (response.data.length === 0)
      return null;

    else{
      let latest = response.data[0];
      return new Release(latest.tag_name, latest.html_url, latest.published_at, latest.id, latest.body);
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

  //Adds Repo to repoList state if it doesn't already exist.
  addRepoToList(repo){
    let repoIndex =  this.getRepoIndex(repo);

    if(repoIndex == -1){
      let repoList = this.state.repoList.slice();
      repoList.push(repo);
      this.setState({repoList: repoList});
    }  
  }

  //Adds release to Repo Object inside repoList state if it doesnt already exist.
  addReleaseToList(repo, release){ 
    if (release == null)
      return;

    let repoIndex = this.getRepoIndex(repo);
    let repoList = this.state.repoList.slice();
    if (!repoList[repoIndex].containsRelease(release)){
      repoList[repoIndex].releases.push(release);
      this.setState({repoList: repoList})

    }
  }

  updateRepo(repo){
    octokit.request('GET /repos/{owner}/{repo}/releases', {
      owner: repo.owner,
      repo: repo.name
    }).then(
      (response) => {
        let release = this.parseReleaseReponse(repo, response)
        this.addRepoToList(repo);
        this.addReleaseToList(repo, release);
        this.setState({apiLimitExceeded: false});
    }).catch(
      (error) => {
        console.log(error);
        this.setState({apiLimitExceeded: true});
    });
  }

  handleSearchListSelected(selectedRepo){
    this.updateRepo(selectedRepo);
  }

  handleRefresh(){
    for(let i=0; i < this.state.repoList.length; i++){
      this.updateRepo(this.state.repoList[i]);
    }
  }

  handleDelete(repo){
    let repoList = this.state.repoList.slice();

    let deleteIndex = this.getRepoIndex(repo);

    repoList.splice(deleteIndex,1);
    this.setState({repoList:repoList});
  }


  render() {
    return (
      <div class='container'>
        <h1 class="logo">Repo Master</h1>
        <ApiExceededBanner show={this.state.apiLimitExceeded}/>
          <SearchInput 
            value={this.state.searchValue}
            onSearchInputChange={this.handleSearchInputChange} 
            onPressEnter={this.handleSearchSubmitQuery} 
            onFocus={this.handleSearchInputOnFocus}
            onBlur={this.handleSearchInputOnBlur}/>

          <SearchList response={this.state.searchQueryResponse} 
                      onSearchListSelected={this.handleSearchListSelected}
                      showList={this.state.showList}/>
        <RepositoryList onDelete={this.handleDelete}
                        repoList={this.state.repoList}
                        onSeenRelease={this.handleSeenRelease}/>
         <button onClick={this.handleRefresh}>
            Check for Updates
        </button>
      </div>
    );
  }
}


export default App;