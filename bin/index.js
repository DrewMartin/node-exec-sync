(function() {
  var FFI, fs, getOutput, libc, tmpDir, uniqId, uniqIdK;

  FFI = require("ffi");

  libc = new FFI.Library(null, {
    "system": ["int32", ["string"]]
  });

  fs = require("fs");

  uniqIdK = 0;

  uniqId = function() {
    var prefix;
    prefix = 'tmp';
    return prefix + (new Date()).getTime() + '' + (uniqIdK++) + ('' + Math.random()).split('.').join('');
  };

  tmpDir = function() {
    var dir, name, _i, _len, _ref;
    _ref = ['TMPDIR', 'TMP', 'TEMP'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      if (process.env[name] != null) {
        dir = process.env[name];
        if (dir.charAt(dir.length - 1) === '/') {
          return dir.substr(0, dir.length - 1);
        }
        return dir;
      }
    }
    return '/tmp';
  };

  getOutput = function(path) {
    var output;
    output = fs.readFileSync(path);
    fs.unlinkSync(path);
    output = "" + output;
    if (output.charAt(output.length - 1) === "\n") {
      output = output.substr(0, output.length - 1);
    }
    return output;
  };

  module.exports = function(cmd, noRedirect) {
    var dir, error, id, result, status, stderr, stdout;
    if (noRedirect == null) {
      noRedirect = false;
    }
    id = uniqId();
    if (!noRedirect) {
      stdout = id + '.stdout';
      stderr = id + '.stderr';
      dir = tmpDir();
      cmd = "" + cmd + " > " + dir + "/" + stdout + " 2> " + dir + "/" + stderr;
    }
    status = libc.system(cmd);
    if (!noRedirect) {
      result = getOutput("" + dir + "/" + stdout);
      error = getOutput("" + dir + "/" + stderr);
      return {
        status: status,
        stdout: result,
        stderr: error
      };
    }
    return {
      status: status
    };
  };

}).call(this);
