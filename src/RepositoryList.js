import React from 'react';
import RepositoryListItem from './RepositoryListItem.js';

class RepositoryList extends React.Component {
  generateList(){
    if(this.props.repoList.length > 0)
    {
      let list = this.props.repoList.map((repo) =>
        <li key={repo.owner + "-" + repo.name}> 
          {repo.owner}/{repo.name}
          <RepositoryListItem releases={repo.releases} />
        </li>
      );

      return list;
    }
  }

  render(){
    const list = this.generateList();
    return (
      <ul>
        {list}
      </ul>
    );
  }
}

export default RepositoryList;