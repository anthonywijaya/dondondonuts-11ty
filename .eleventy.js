const fs = require("fs");
const htmlmin = require("html-minifier");

const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {

  if (process.env.ELEVENTY_PRODUCTION) {
    eleventyConfig.addTransform("htmlmin", htmlminTransform);
  }

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// which file extensions to process
		extensions: "html",

		// Add any other Image utility options here:

		// optional, output image formats
		// formats: ["webp", "jpeg", "svg"],
		formats: ["webp", "jpeg", "auto"],

		// optional, output image widths
		widths: [320, 640, 1280, "auto"],

		// optional, attributes assigned on <img> override these values.
		defaultAttributes: {
      sizes: '90vw',
			loading: "lazy",
			decoding: "async",
      alt: "",
		},
  });

  eleventyConfig.addLayoutAlias('default', 'layouts/default.njk');

  // Passthrough
  // eleventyConfig.addPassthroughCopy({ "src/static": "." });
  eleventyConfig.addPassthroughCopy({"src/assets/img/**/*": "assets/img/"});

  // Watch targets
  eleventyConfig.addWatchTarget("./src/_includes/assets/css/");

  // Collections

  eleventyConfig.addCollection("flavors", function (collectionApi) {
		const classicFlavors = collectionApi.getFilteredByGlob("src/input/flavors/classic/*.md");
    const premiumFlavors = collectionApi.getFilteredByGlob("src/input/flavors/premium/*.md");
    const flavors = {
      "Classic": [classicFlavors, "12,000"],
      "Premium": [premiumFlavors, "15,000"]
    };
    return flavors;
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