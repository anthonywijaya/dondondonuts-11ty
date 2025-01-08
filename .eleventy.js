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
  eleventyConfig.addPassthroughCopy({ "src/static": "." });
  eleventyConfig.addPassthroughCopy({"src/assets/img/**/*": "assets/img/"});

  // Watch targets
  eleventyConfig.addWatchTarget("./src/_includes/assets/css/");

  //Alpine JS
  eleventyConfig.addPassthroughCopy({
    "./node_modules/alpinejs/dist/cdn.js": "./assets/js/alpine.js",
  });

  //Alpine JS
  eleventyConfig.addPassthroughCopy({
    "./src/assets/js/meta-conversions-api.js": "./assets/js/meta-conversions-api.js",
  });

  //Order JS
  eleventyConfig.addPassthroughCopy({"./src/assets/js/order.js": "./assets/js/order.js"});


  //Tracking JS
  eleventyConfig.addPassthroughCopy({"./src/assets/js/tracking.js": "./assets/js/tracking.js"});

  //Commaize
  eleventyConfig.addFilter("thousandseparator", function (num, locale="en-us") {
    return num.toLocaleString(locale);
  });

  //Json
  eleventyConfig.addDataExtension("json", contents => JSON.parse(contents));


  // Collections


  eleventyConfig.addCollection("flavors", function (collectionApi) {
    // const christmasFlavors = collectionApi.getFilteredByGlob("src/input/flavors/christmas/*.md")
    //   .sort((a, b) => (a.data.sort || Infinity) - (b.data.sort || Infinity));
		const classicFlavors = collectionApi.getFilteredByGlob("src/input/flavors/classic/*.md")
        .sort((a, b) => {
          // First sort by "new" flag
          if (a.data.new !== b.data.new) {
            return b.data.new ? 1 : -1; // New items come first
          }
          // Then sort by price
          return a.data.price - b.data.price;
        });
    const premiumFlavors = collectionApi.getFilteredByGlob("src/input/flavors/premium/*.md")
      .sort((a, b) => {
        // First sort by "new" flag
        if (a.data.new !== b.data.new) {
          return b.data.new ? 1 : -1; // New items come first
        }
        // Then sort by price
        return a.data.price - b.data.price;
      });
    const flavors = {
      // "Christmas": christmasFlavors,
      "Classic": classicFlavors,
      "Premium": premiumFlavors,
    };
    return flavors;
	});

  eleventyConfig.addCollection("specials", function (collectionApi) {
    const specials = collectionApi.getFilteredByGlob("src/input/flavors/christmas/*.md")
      .sort((a, b) => (a.data.sort || Infinity) - (b.data.sort || Infinity));
    return specials;
  });

  eleventyConfig.addFilter("times", function(value, multiplier) {
    return value * multiplier;
  });

  
  // eleventyConfig.addCollection("flavors", function(collectionApi) {
  //   return collectionApi.getFilteredByGlob("src/input/flavors/*/*.md").map(item => {
  //     return {
  //       name: item.fileSlug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
  //       price: item.data.price
  //     };
  //   });
  // });
  

  var pathPrefix = "";
  if (process.env.GITHUB_REPOSITORY) {
    pathPrefix = process.env.GITHUB_REPOSITORY.split('/')[1];
  }

  eleventyConfig.addTransform("addMetaPixel", addMetaPixel);

  eleventyConfig.addCollection("cny", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/input/flavors/cny/*.md")
      .sort((a, b) => (a.data.sort || 0) - (b.data.sort || 0));
  });

  eleventyConfig.addFilter("getFlavor", function(collections, flavorPath) {
    // Flatten all flavors into a single array
    const allFlavors = Object.values(collections).flat();
    
    // Find the flavor that matches the path
    return allFlavors.find(flavor => {
      const flavorFilePath = flavor.filePathStem.replace('/input/flavors/', '');
      return flavorFilePath === flavorPath;
    });
  });

  return {
    dir: {
      input: "src",
      data: "_data"
    },
    //pathPrefix
  }
};

function downloadCSV(csv, filename) {
  const csvFile = new Blob([csv], { type: "text/csv" });
  const downloadLink = document.createElement("a");
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function generateCSV(products) {
  const rows = [['Product', 'Count']];
  products.forEach(product => {
      rows.push([product.name, product.count]);
  });

  const csvContent = rows.map(e => e.join(",")).join("\n");
  downloadCSV(csvContent, 'order.csv');
}

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

function addMetaPixel(content, outputPath) {
  if (outputPath && outputPath.endsWith('.html')) {
    const metaPixelCode = `
      <!-- Meta Pixel Code -->
      <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1064819841680904');
      fbq('track', 'PageView');
      </script>
      <noscript><img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=1064819841680904&ev=PageView&noscript=1"
      /></noscript>
      <!-- End Meta Pixel Code -->
    `;
    
    return content.replace('</head>', metaPixelCode + '</head>');
  }
  return content;
}