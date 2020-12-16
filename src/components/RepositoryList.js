import React from 'react';
import RepositoryReleaseList from './RepositoryReleaseList.js';

class RepositoryList extends React.Component {
  generateList(){
    if(this.props.repoList.length > 0)
    {
      let list = this.props.repoList.map((repo) =>
        <li key={repo.owner + "-" + repo.name}> 
          <h2>{repo.owner}/{repo.name}</h2>
          {repo.releases.length == 0 && <h3>This repository has no releases</h3>}
          <RepositoryReleaseList releases={repo.releases} 
                              onSeenRelease={this.props.onSeenRelease}/>
          <button onClick={()=>{this.props.onDelete(repo)}}>Untrack Repository</button>
        </li>
      );

      return list;
    }
  }

  render(){
    const list = this.generateList();
    return (
      <ul class={this.props.repoList.length>0?"repositoryListStyle": "repositoryListStyle takeoffTopBorder"}>
        {list}
      </ul>
    );
  }
}

export default RepositoryList;