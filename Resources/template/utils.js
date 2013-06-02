/*
Simply Mobile - Mobile Development Framework
Copyright (c) 2012 Model N, Jérôme Ueberschlag, Clémence Aucagne, Jean-Baptiste Pringuey

See the file license.txt for copying permission.
*/

var extend = function (Objects) {
	var res = {};
	for (var i in Objects) {
		for (var j in Objects[i]) {
			res[j] = Objects[i][j];
		}
	}
	return res;
}