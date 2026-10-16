// Prints the site's data (xr-data.js + xr-content.js) as JSON, for tools/build_seo.py.
// Runs on any Mac with no installs: osascript -l JavaScript tools/export_data.js <site_dir>

// Minimal browser globals the data files touch at load time (must be global: eval runs there)
var window = this;
var location = { search: '' };
var document = {};
var localStorage = { getItem: function () { return null; }, setItem: function () {} };

function run(argv) {
  var read = function (p) { return $.NSString.stringWithContentsOfFileEncodingError(argv[0] + '/' + p, $.NSUTF8StringEncoding, null).js; };
  (0, eval)(read('xr-data.js'));
  (0, eval)(read('xr-content.js'));
  return JSON.stringify({ properties: window.XR.properties, communities: window.XR.communities, content: window.XR_CONTENT });
}
