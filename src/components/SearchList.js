import React from 'react';
import Repository from "../classes/Repository.js"

class SearchList extends React.Component {
  parseResponse(){
    let result = [];
    if (JSON.stringify(this.props.response) !== '{}'){
      let responseList = this.props.response.data.items;
      let limit = responseList.length < 10 ? responseList.length : 10;
      for(let i = 0; i < limit; i++){
        let r = new Repository(responseList[i].owner.login, responseList[i].name, 
                              responseList[i].description, responseList[i].id);
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
      <li key={repo.owner + "-" + repo.name}
          onClick={() => {this.handleClick(repo)}}>
        <a> {repo.owner}/<b>{repo.name}</b></a>
      </li>
    );

    return (
      <ul class='searchListStyle'>{listItems}</ul>
      );
    }
}

export default SearchList;