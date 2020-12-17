class Repository {
  constructor(owner, name, description, id){
    this.owner = owner;
    this.name = name;
    this.description = description;
    this.id = id;
    this.releases = [];
  }
}

export default Repository;