import React from 'react';

import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    currSearch: state.home.searchValue,
}};


class ReleaseListItem extends React.Component {
  constructor(props){
    super(props);
    this.handleClickedRelease = this.handleClickedRelease.bind(this);
    this.state = {showInfo: false};
  }

  generateHeader(){
    let date = new Date(this.props.release.date);
    let header = '';

    if(!this.props.release.seen)
      header += "NEW!-----";

    header += this.props.release.tag + "-----";
    header += date.toLocaleDateString(); 

    if(!this.state.showInfo)
      header += "----" + "Click to Show";
    else
      header += "----" + "Click to Hide";

    return header;
  }

  handleClickedRelease(){
    this.setState({showInfo: !this.state.showInfo});
    this.props.onSeenRelease(this.props.release);
  }

  handleShowInfo(){
    return (
      <div>
        <pre>{this.props.release.body}</pre>
        <p>Your current search keyword is: {this.props.currSearch}</p>
      </div>    
      );
  }

  render(){ 
    return(
      <li key={this.props.release.tag}> 
        <button class={this.props.release.seen?'seen':'new'}
                onClick={this.handleClickedRelease}>
          {this.generateHeader()}
        </button>
        {this.state.showInfo && this.handleShowInfo()}
      </li>
    );
  }
}

export default connect(mapStateToProps, null)(ReleaseListItem);