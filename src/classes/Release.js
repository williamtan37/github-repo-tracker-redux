class Release {
  constructor(tag, url, date, id, body){
   this.tag = tag;
   this.url = url;
   this.date = date;
   this.id = id;
   this.body = body;
   this.seen = false;
  }
}

export default Release;