import React from 'react';
import ReleaseListItem from './ReleaseListItem.js';

class ReleaseList extends React.Component {
  render(){
    let list = this.props.releases.map((release) => {
              return <ReleaseListItem onSeenRelease={this.props.onSeenRelease}
                                      release={release}
                                      key={release.id}/>});
    return(
      <ul class="releaseList">
        {list}
      </ul>
    );
  }
}

export default ReleaseList;