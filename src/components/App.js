import React from 'react';
import { Octokit } from "@octokit/core";

import SearchInput from './SearchInput';
import SearchList from './SearchList';
import Release from '../classes/Release.js'
import RepositoryList from './RepositoryList.js'

import { connect } from 'react-redux';
import { SEARCH } from '../constants/actionTypes';
import { store } from '../store';

import '../styles/App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom"

const octokit = new Octokit();

function About(){
  return(
    <div className="aboutPage">
      <hr></hr>
      <p>Made by William Tan 2020</p>
      <span>You can view this project here at: </span>
      <a href="https://github.com/williamtan37/github-repo-tracker-redux">GitHub</a>
    </div>);
}
function ApiExceededBanner(props){
  if (props.show)
    return <p class="apiExccedAlert">You have exceeded the limit for API calls. Please wait or use a VPN.</p>;
  else
    return null;
}

const mapDispatchToProps = dispatch => ({
  onSearch: (searchValue) =>
    dispatch({ type: SEARCH, payload:{searchValue}}),
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {searchValue: '', searchQueryResponse: {}, 
                  repoList: [], apiLimitExceeded: false,
                  showSearchList: true, isSearchListLoading: false};

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
    let repoList = this.loadData();
    this.handleRefresh(repoList);
  }

  loadData(){
    let dataJSON = window.localStorage.getItem("data");
    let dataObj = JSON.parse(dataJSON);

    if (dataObj == null)
      dataObj = [];
    else
      dataObj = dataObj.data

     this.setState({repoList: dataObj});
     return dataObj;
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

    this.props.onSearch(this.state.searchValue);
    let query = this.state.searchValue + "+in:name";

    this.setState({isSearchListLoading: true});
    octokit.request('GET /search/repositories', {
        q: query
      }).then(
        (res) => {
          this.setState({searchQueryResponse: res, apiLimitExceeded: false,
                         isSearchListLoading: false});
        }
      ).catch(
        (error) => {
        console.log(error);
        this.setState({apiLimitExceeded: true, isSearchListLoading: false});
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
    this.setState({searchValue: input});
  }

  handleSearchListSelected(selectedRepo){
    this.updateRepoList(selectedRepo);
  }

  handleRefresh(repoList){
    for(let i = 0; i < repoList.length; i++){
      this.updateRepoList(repoList[i]);
    }
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
    for(let i = 0; i < this.state.repoList.length; i++){
      if (this.state.repoList[i].id == repo.id)
        return i;
    }
    return -1;
  }

  addRepoToList(repo){
    let repoList = this.state.repoList.slice();
    repoList.push(repo);
    this.setState({repoList: repoList});  
  }

  containsRelease(repo, release){
    for(let i = 0; i < repo.releases.length; i++){
      if (repo.releases[i].id == release.id)
        return true
    }
    return false
  }

  addReleaseToRepo(repo, release){ 
    let repoIndex = this.findRepoIndex(repo);
    let repoList = this.state.repoList.slice();

    if (!this.containsRelease(repoList[repoIndex], release)){
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
        let release = this.parseReleaseReponse(repo, response);
        
        if (this.findRepoIndex(repo) == -1)
          this.addRepoToList(repo);

        if (release != null)
          this.addReleaseToRepo(repo, release);

        this.setState({apiLimitExceeded: false});
    }).catch(
      (error) => {
        console.log(error);
        this.setState({apiLimitExceeded: true});
    });
  }

  render() {
    return (
      <Router>
        <div class='container'>
          <h1 class="logo">GitHub Repository and Release Tracker</h1> 
          <ul className="nav">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
          <p class="about"> This app allows you to track <b>repositories</b> and their <b>latest release</b>. Once tracked, you can refresh this page to check for <b>newer releases</b>. All tracked information will remain until application data is cleared.</p>

          <Switch>
            <Route exact path="/">
              <ApiExceededBanner show={this.state.apiLimitExceeded}/>
              <SearchInput 
                value={this.state.searchValue}
                onSearchInputChange={this.handleSearchInputChange} 
                onPressEnter={this.handleSearchSubmitQuery} 
                onFocus={this.handleSearchInputOnFocus}
                onBlur={this.handleSearchInputOnBlur}/>
              <SearchList response={this.state.searchQueryResponse} 
                          onSearchListSelected={this.handleSearchListSelected}
                          showSearchList={this.state.showSearchList && !this.state.isSearchListLoading}/>
              {this.state.isSearchListLoading && <div class="loader"></div>}
              <RepositoryList onDelete={this.handleDelete}
                            repoList={this.state.repoList}
                            onSeenRelease={this.handleSeenRelease}/>
            </Route>
            <Route path="/about">
              <About/>
            </Route>
            </Switch>
        </div>
      </Router>
    );
  }
}

export default connect(null, mapDispatchToProps)(App);