const fs = require("fs");
const htmlmin = require("html-minifier");

module.exports = function(eleventyConfig) {

  if (process.env.ELEVENTY_PRODUCTION) {
    eleventyConfig.addTransform("htmlmin", htmlminTransform);
  }

  eleventyConfig.addLayoutAlias('default', 'layouts/default.njk');

  // Passthrough
  // eleventyConfig.addPassthroughCopy({ "src/static": "." });
  eleventyConfig.addPassthroughCopy({"src/_includes/assets/img/**/*": "assets/img/"});

  // Watch targets
  eleventyConfig.addWatchTarget("./src/_includes/assets/css/");

  // Collections

  eleventyConfig.addCollection("flavors", function (collectionApi) {
		return collectionApi.getFilteredByGlob("src/input/flavors/*.md");
	});
  

  var pathPrefix = "";
  if (process.env.GITHUB_REPOSITORY) {
    pathPrefix = process.env.GITHUB_REPOSITORY.split('/')[1];
  }

  return {
    dir: {
      input: "src"
    },
    pathPrefix
  }
};

function htmlminTransform(content, outputPath) {
  if( outputPath.endsWith(".html") ) {
    let minified = htmlmin.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true
    });
    return minified;
  }
  return content;
}