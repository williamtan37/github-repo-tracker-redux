import React from 'react';
import ReleaseList from './ReleaseList.js';

class RepositoryList extends React.Component {
  generateList(){
    let list = this.props.repoList.map((repo) =>
      <li key={repo.owner + "-" + repo.name}> 
        <h2>{repo.owner}/{repo.name}</h2>
        {repo.releases.length == 0 && <h3>This repository has no releases</h3>}
        <ReleaseList releases={repo.releases} 
                     onSeenRelease={this.props.onSeenRelease}/>
        <button class="deleteButton" onClick={()=>{this.props.onDelete(repo)}}>Untrack Repository</button>
      </li>);

    return list;
  }

  determineCorrectStyle(){
    if (this.props.repoList.length > 0) 
      return "repositoryList";
    else
      return "repositoryList takeoffTopBorder";
  }

  render(){
    return (
      <ul class={this.determineCorrectStyle()}>
        {this.props.repoList.length > 0 && this.generateList()}
      </ul>
    );
  }
}

export default RepositoryList;