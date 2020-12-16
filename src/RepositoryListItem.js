import React from 'react';

class RepositoryListItem extends React.Component {
  generateList(){
    if(this.props.releases.length > 0)
    {
      let list = this.props.releases.map((release) =>
        <li key={release.tag}> 
          {release.tag} / {release.url} / {release.date}
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

export default RepositoryListItem;