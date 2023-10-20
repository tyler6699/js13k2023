function Tile(id, size, x, y, angle, type, solid, column, row, scale) {
  this.id = id;
  this.obj=null;
  this.e = new entity(size, size, x, y, angle, type, "", scale, 0, 0);
  this.column = column;
  this.row = row;
  this.active = true;

  this.update = function(delta) {
    this.e.update(delta);
  }
}
