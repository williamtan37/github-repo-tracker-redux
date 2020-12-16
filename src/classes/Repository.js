class Repository {
  constructor(owner, name, description, id){
    this.owner = owner;
    this.name = name;
    this.description = description;
    this.id = id;
    this.releases = []; //A repository has many releases
  }

  containsRelease(release){
    for(let i = 0; i < this.releases.length; i++){
      if (this.releases[i].id == release.id)
        return true
    }
    return false
  }
}

export default Repository;