module.exports = {
	// ... 
	eleventyComputed: {
		title: (data) => data.page.fileSlug,
		meta_title: (data) => data.page.fileSlug + " Donut Flavors",
		thumb: (data) => {
            if (data.thumb) {
              if (data.thumb.search(/^https?:\/\//) !== -1) {
                return data.thumb;
              }
              return `/assets/img/${data.thumb}`;
            } else {
              return false;
            }
          }
	}
};