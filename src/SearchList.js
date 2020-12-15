import { Octokit } from "@octokit/core";
import React from 'react';


const octokit = new Octokit();


class Repo {
  constructor(owner, name, description){
    this.owner = owner;
    this.name = name;
    this.description = description;
  }
}


class SearchList extends React.Component {
  constructor(props) {
    super(props);
  }


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

  render(){
    let repos = this.parseResponse();
    let listItems = repos.map((repo) =>
      <li key={repo.owner + "-" + repo.name}>{repo.name} {repo.owner} </li>
    );

    return (
      <ul>{listItems}</ul>
      );
    }
}

export default SearchList;