import React from 'react';
import Repo from "./Repo.js"

class SearchList extends React.Component {
  parseResponse(){
    let result = [];
    if (JSON.stringify(this.props.response) !== '{}'){
      let responseList = this.props.response.data.items;
      let limit = responseList.length < 10 ? responseList.length : 10;
      for(let i = 0; i < limit; i++){
        let r = new Repo(responseList[i].owner.login, responseList[i].name, responseList[i].description);
        result.push(r);
      }

    }
    return result;
  }

  handleClick(selectedRepo){
    this.props.onSearchListSelected(selectedRepo);
  }

  render(){
    let repos = this.parseResponse();
    let listItems = repos.map((repo) =>
      <li key={repo.owner + "-" + repo.name}>
        <a onClick={() => {this.handleClick(repo)}}> {repo.owner}/{repo.name}
        </a>
      </li>
    );

    return (
      <ul>{listItems}</ul>
      );
    }
}

export default SearchList;