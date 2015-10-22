'use strict';

angular.module('pdb.version', [
  'pdb.version.interpolate-filter',
  'pdb.version.version-directive'
])

.value('version', '0.1');
