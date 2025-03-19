# Don Don Donuts Website Todo

## Completed Tasks
- [x] Add Eid packages section similar to Valentine's section
- [x] Add sold out feature to Eid packages section

## Pending Tasks
- [ ] Create Eid package collection in Eleventy configuration
- [ ] Add Eid package data files
- [ ] Test the Eid packages section with real data
- [ ] Ensure green color styling is properly applied

# Todo List for Eid Accessories Feature

- [x] Add Eid Accessories UI section with conditional display
- [x] Add enableEidAccessories toggle variable
- [x] ~~Add eidAccessories and eidMessage properties to orderForm~~ Updated: Changed to eidAccessoriesQuantity
- [x] Update getTotalPrice() to include Eid accessories
- [x] Update order summary to display Eid accessories
- [x] Update floating summary bar to show Eid accessories
- [x] ~~Update generateOrderMessage() to include Eid accessories~~ Updated: Show quantity in message
- [x] Add configurable eidAccessoriesPrice variable
- [x] Optimize Eid accessories section for mobile devices

## Completed
- Added Eid Accessories UI section with toggle functionality
- Changed from checkbox to quantity selector (1-n) for Eid accessories
- Updated price calculations to include Eid accessories (multiply quantity × price)
- Updated order summary to display Eid accessories quantity
- Updated floating bar to show Eid accessories quantity
- Updated WhatsApp message to include Eid accessories quantity
- Added configurable eidAccessoriesPrice variable (default: 10,000)
- Improved mobile layout with responsive design:
  - Restructured to use flex-col on mobile and flex-row on larger screens
  - Made image take full width on mobile and 1/3 width on desktop
  - Improved touch targets for mobile users
  - Enhanced spacing and alignment for better readability

## Notes
- Default setting for enableEidAccessories is set to `true`. Set to `false` to disable the feature during non-Eid seasons.
- Eid accessories price is configurable via the eidAccessoriesPrice variable
- When enabled, customers can specify how many Eid decoration sets they want 