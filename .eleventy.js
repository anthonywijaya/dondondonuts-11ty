const fs = require("fs");
const htmlmin = require("html-minifier");

const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");

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

function addTiktokPixel(content, outputPath) {
  if (outputPath && outputPath.endsWith('.html')) {
    const tiktokPixelCode = `
    <!-- TikTok Pixel Code -->
    <script>
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${process.env.TIKTOK_PIXEL_ID}');
      ttq.page();
    }(window, document, 'ttq');
    </script>
    <!-- End TikTok Pixel Code -->
    `;
    
    return content.replace('</head>', tiktokPixelCode + '</head>');
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
      fbq('init', '${process.env.META_PIXEL_ID}');
      fbq('track', 'PageView');
      </script>
      <!-- End Meta Pixel Code -->
    `;
    
    return content.replace('</head>', metaPixelCode + '</head>');
  }
  return content;
}

module.exports = function(eleventyConfig) {
  if (process.env.ELEVENTY_PRODUCTION) {
    eleventyConfig.addTransform("htmlmin", htmlminTransform);
  }

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["webp", "jpeg", "auto"],
    widths: [320, 640, 1280, "auto"],
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
    const classicFlavors = collectionApi.getFilteredByGlob("src/input/flavors/classic/*.md")
      .sort((a, b) => {
        if (a.data.new !== b.data.new) {
          return b.data.new ? 1 : -1;
        }
        return a.data.price - b.data.price;
      });
    const premiumFlavors = collectionApi.getFilteredByGlob("src/input/flavors/premium/*.md")
      .sort((a, b) => {
        if (a.data.new !== b.data.new) {
          return b.data.new ? 1 : -1;
        }
        return a.data.price - b.data.price;
      });
    const flavors = {
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

  eleventyConfig.addCollection("cny", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/input/flavors/cny/*.md")
      .sort((a, b) => (a.data.sort || 0) - (b.data.sort || 0));
  });

  eleventyConfig.addFilter("getFlavor", function(collections, flavorPath) {
    const allFlavors = Object.values(collections).flat();
    return allFlavors.find(flavor => {
      const flavorFilePath = flavor.filePathStem.replace('/input/flavors/', '');
      return flavorFilePath === flavorPath;
    });
  });

  // Add transforms
  eleventyConfig.addTransform("addMetaPixel", addMetaPixel);
  eleventyConfig.addTransform("addTiktokPixel", addTiktokPixel);

  // Add 404 page handling for Netlify
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');
        browserSync.addMiddleware("*", (req, res) => {
          res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
          res.write(content_404);
          res.end();
        });
      },
    }
  });

  // Add environment-specific settings
  if (process.env.NETLIFY) {
    console.log("Building for Netlify...");
  }

  return {
    dir: {
      input: "src",
      data: "_data",
      output: "_site"
    },
    pathPrefix: "/",
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ]
  };
};