import React from 'react';
import RepositoryReleaseListItem from './RepositoryReleaseListItem.js';

class RepositoryReleaseList extends React.Component {

  render(){
    let list = this.props.releases.map((release) => {
              return <RepositoryReleaseListItem 
                            onSeenRelease={this.props.onSeenRelease}
                            release={release}
                            key={release.id}/>});
    return(
      <ul class="repositoryReleaseListStyle">
        {list}
      </ul>
    );
  }
}

export default RepositoryReleaseList;