# Project Overview
I want you to help move this 11ty project to nextJS. This is a site where visitors can visit to see our donuts, other relevant information, and make order through WhatsApp. Analyze the current site and make recommendations on the best file structure for the project. Also analyze how our site data is currently being handled, and then redesign how it can be handled using a database and an API.

You will be using NextJS 14 with the app router, shadCN, tailwindCSS, Lucid Icons.
Figure out the best file structure for the project.

I want you to also make a CMS using Strapi with PostgresSQL for our website. This is so we can manage our homepage, our flavors, our discounts, promotions, and black out dates. The CMS will be hosted on a subdomain of our main site, using Render.

## Tech Stack Summary:

	1.	Frontend (Customer Website): Next.js (hosted on Vercel)
	•	Tailwind CSS, ShadCN, Lucid icons for styling
    •	Supabase for authentication
    •	Connected to Strapi as the backend
    •   GA4 for analytics & Meta conversions API for ads retargetting and ads conversions.
	2.	Backend (CMS + API): Strapi (hosted on Render or Heroku)
	•	PostgreSQL and Storage via Supabase
	3.	Dashboard (Orders & CRM): Next.js (hosted on Vercel)
	•	Strapi API for managing orders, customers, etc.
	•	Chart.js or Recharts for analytics
	4.	Database & Storage: Supabase
	•	PostgreSQL for structured data (orders, customers, products)
	•	Supabase Storage for image uploads (payment proofs)
	5.	Hosting:
	•	Next.js website and dashboard hosted on Vercel
	•	Strapi backend hosted on Render
	•	Supabase for database and file storage.

# Core Functions
Keep the functions of the current static site intact. And then I want to add the following functionalities:
1. Add a CMS using Strapi that can manage
   1. our homepage:
   2. our database of flavors, and its data. Maintain the current functionalities to attach tags (best seller/new) and categories.
   3. Manage our discounts and promotions, with extensive features like:
      1. Adding discounts based on a time range
      2. Multiple discounting logic like buy X donuts get Y free, or buy X donuts get Y off.
   4. Manage our black out dates, where orders are already full. A blacked out date is a date where no orders can be made.
2. A dashboard for our CRM where it will:
   1. Maintain a list of our customers who have placed orders.
      1.  Placing orders in the site will lead to a WhatsApp conversation with our customer service team. They are unconfirmed orders since they haven't paid. Our payment process is separated and is done through bank transfer once an order is confirmed after our conversation with the customer. Once a payment is confirmed, a staff will then need to go to this list, select the related customer, and then perform edits to the order if any is requested (for example to the order, the name, and so on). Finally, they will upload the bank transfer confirmation proof (usually a picture). This order will then be labelled as confirmed.
      2.  Another staff will then see the orders and verify the payments. Once done, they will assign the order as Paid. 
      3.  We will have an API to this database that can access all the orders and perform the following operations (in combination):
          1.  Export orders based on a date selection
          2.  Export orders based on its status (Unconfirmed, Confirmed, Paid)
      4. The API will be used to make:
         1. order slips to attach to the order. Order slips are to be attached to boxes, with the order count defining the size of the box. We support boxes of sizes 1, 2, 3, and 6. An order of 12 donuts will require 2 boxes of 6. An order of 4 or 5 donuts will go into a box of 6. Each box will have an order slip.
         2. and daily make list for the kitchen/operation team, with a summary of the count of all flavors needed to be made, and how many boxes are needed.
      5. A dashboard that have all essential analytics in charts, feel free to recommend more analytics, but the primary ones are:
         1. Orders made in a time range: Today, Weekly, Customized
         2. Flavors sold in a time range: Today, Weekly, Customized
         3. Orders status: Unconfirmed, Confirmed, Paid
         4. And filters for each metrics
      6. We will also be able to blast messages to customers WhatsApp, ideally through an API. The messages are:
         1. Promotion updates
         2. Notifications that orders can now be picked up.
3. We will also implement extensive google analytics tracking for events (GA4), and meta conversions api for ads retargetting, and ads conversions. Consider the order statuses as well.


# URLS


# Models
1. Flavors
   1. Name
   2. Description
   3. Image
   4. Price
   5. Tags [Best Seller, New]
   6. Categories [Classic, Premium]

