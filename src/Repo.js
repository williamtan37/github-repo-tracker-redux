class Repo {
  constructor(owner, name, description){
    this.owner = owner;
    this.name = name;
    this.description = description;
    this.releases = [];
  }

  containsRelease(release){
    for(let i = 0; i < this.releases.length; i++){
      if (this.releases[i].date == release.date)
        return true
    }
    return false
  }
}

export default Repo;