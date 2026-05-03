# RoadVault Validation Plan

RoadVault protects the small gear that carries creators' biggest work.

## Recommendation

Launch crowdfunding with the RoadVault Founder Kit first, and position
SessionVault as the future flagship of the ecosystem. The Founder Kit gives
RoadVault a lower-risk, faster path to proof, while the Smart SSD shows the
bigger vision without forcing the first campaign to carry full hardware
complexity.

## Landing Page Structure

1. Hero: protect the small gear that carries creators' biggest work.
2. Problem: missing drives, USBs, SD cards, pouches, and adapters carry real work.
3. Track A: RoadVault Founder Kit.
4. Track B: SessionVault Smart SSD.
5. Price test: $49, $79, $99 Founder Kit anchors.
6. MVP recovery page preview.
7. 30-day validation sprint.
8. Two-track waitlist form.

## Waitlist Capture

The landing page form is wired for Netlify Forms:

- Form name: `roadvault-waitlist`
- POST target: `/`
- Success fallback page: `/thanks.html`
- Anti-spam field: `bot-field`
- Local backup: browser `localStorage` for prototype testing

Deploy the static folder to Netlify before sending real traffic. Netlify should
detect the form during deployment and create a submissions table for the
`roadvault-waitlist` form.

## Track A - RoadVault Founder Kit

Position as the first shippable RoadVault product.

Included:

- TourVault Tech Pouch
- SetVault USB/SD Vault
- NFC Lost Card
- QR Recovery Label
- Hidden tracker pocket
- Creator inventory labels
- Reward/contact recovery page

V1 does not manufacture electronics. It is compatible with existing trackers
such as AirTag, Tile, Chipolo, Pebblebee, and Android Find Hub-style trackers.

## Track B - SessionVault Smart SSD

Position as the future flagship, not the first crowdfunding promise.

Planned direction:

- Encrypted external SSD
- Built-in item tracking
- NFC lost mode
- Rugged creator-focused enclosure
- Project and owner labeling
- Future companion app
- Possible Find My / Android Find Hub compatibility

Do not campaign this as a shipping product until there is a working prototype,
clear certification path, supplier plan, and tested manufacturing cost.

## Pricing Test

Founder Kit anchors:

- $49: accessible impulse price
- $79: recommended founder price
- $99: future retail test

SessionVault interest test:

- $149 to $199 for 1TB target
- $229 to $299 for 2TB target

Use a $1 to $5 reservation only after warm demand is visible.

## Survey Questions

1. What type of creator are you?
2. What gear are you most afraid of losing?
3. Have you ever lost a USB, SD card, drive, pouch, or case?
4. What did it cost you in time, money, or stress?
5. Which product would you buy first: Founder Kit or Smart SSD?
6. What tracker ecosystem do you use?
7. What price feels fair for the Founder Kit?
8. Would you want the tracker included or bring your own tracker?
9. What would make you trust RoadVault enough to buy?
10. Would you back this on crowdfunding or prefer direct preorder?

## Interview Questions

1. Walk me through the last time you almost lost important gear.
2. What small items are mission-critical for you?
3. Where does gear usually disappear?
4. What do you currently do to prevent losing it?
5. What part of RoadVault feels most useful?
6. What feels unnecessary?
7. Would you buy the Founder Kit this month?
8. Would you wait for a Smart SSD instead?
9. What price would make this an easy yes?
10. What would make you hesitate?

## Prototype Shopping List

- Premium tech pouch sample
- USB/SD card organizer
- NFC cards
- Durable QR labels
- Waterproof inventory labels
- AirTag, Pebblebee, Chipolo, or Tile sample trackers
- Small reward/contact landing page
- Product insert card
- Simple branded packaging
- Photo/video setup with real creator gear

## MVP Recovery Page Copy

This RoadVault item belongs to a creator.

Thanks for scanning. This item may contain important music, footage, project
files, or work materials.

Please contact the owner below to arrange return.

- Owner: [Name]
- Contact: [Email / Phone]
- Reward: [Optional reward amount]
- Item ID: [RoadVault ID]

No access is needed to the contents of this item. Please do not open, copy, or
modify any files.

CTA: Contact Owner

## Campaign Positioning

Primary line:

RoadVault protects the small gear that carries creators' biggest work.

Campaign frame:

Back the Founder Kit. Help shape the Smart SSD.

RoadVault is not luggage tracking. It is creator-critical gear recovery for the
USBs, SD cards, SSDs, pouches, and small project gear moving between studios,
venues, airports, and shoots.

## 30-Day Validation Plan

Week 1: Build landing page, mockups, recovery page, survey, and price tests.

Week 2: Drive traffic from creator communities, direct contacts, Instagram, and
music/photo/video networks.

Week 3: Run 15 to 25 interviews with high-intent creators.

Week 4: Open a $1 to $5 reservation test for the winning track.

## Success Criteria

Strong signal:

- 500+ waitlist signups
- 8% to 12% landing page email conversion
- 50+ people choose Founder Kit
- 20+ people say they would pay $79+
- 25+ paid reservations
- Interviewees describe real loss events without being prompted

Weak signal:

- People like the idea but will not choose a product
- Founder Kit feels nice but not urgent
- Smart SSD interest is high but price trust is low
- Fewer than 5 paid reservations after warm outreach

Rethink if no clear buyer segment emerges, no one has a painful loss story, or
people only want a cheap generic tracker.

## Crowdfunding Launch Gate

Launch only when:

- Founder Kit is the clear first product
- Physical prototype is photographed with real creator gear
- Fulfillment can be explained simply
- 1,000 to 2,000 warm emails exist for a modest funding goal
- Paid reservations or equivalent high-intent proof exist
- Reward tiers, shipping, packaging, and supplier costs are known
