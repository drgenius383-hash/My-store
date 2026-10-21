# My Brand Store

A Temu-style online store built with **Next.js 14 (App Router)**, **Tailwind CSS** and **Supabase**.
Customers pay by **manual bank transfer**, upload their receipt, and an admin approves or disapproves the order.
No Paystack, no Flutterwave, no paid services: it runs on Vercel Hobby + Supabase Free.

## What's inside

| Area | Route |
| --- | --- |
| Shop (product grid, search, categories) | `/` |
| Product page | `/product/[id]` |
| Cart | `/cart` |
| Checkout (bank details + "I Have Made Payment") | `/checkout` |
| Upload receipt + confirm order | `/upload-receipt` |
| My orders (live status updates) | `/orders` |
| Sign up / Log in (email or phone) | `/signup`, `/login` |
| Admin panel (Orders, Products, Customers) | `/admin` |

## 1. Set up Supabase (about 5 minutes)

1. Create a free project at <https://supabase.com>.
2. Open **SQL Editor -> New query**, paste the whole of `supabase/schema.sql` and click **Run**.
   This creates the tables, security rules, realtime, and the two public storage buckets (`receipts`, `products`).
3. Open **Authentication -> Providers -> Email** and turn **off "Confirm email"**.
   Supabase's built-in email sender only allows a few emails per hour, so confirmation emails will block sign-ups on the free plan.
   (If you leave it on, sign-up still works but customers must click the link in their email before logging in.)
4. Open **Project Settings -> API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## 2. Add your bank details

Open `lib/config.ts` and replace every `[I WILL FILL]` with your real bank name, account name and account number.
You can also change the store name and currency symbol there.

## 3. Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the 4 values
npm run dev
```

Open <http://localhost:3000>, then <http://localhost:3000/admin> to add your first products.

## 4. Deploy to Vercel (free)

1. Push this folder to a GitHub repository.
2. On <https://vercel.com> click **Add New -> Project** and import the repository. Framework is detected as Next.js.
3. Under **Environment Variables** add:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service_role key (secret) |
   | `ADMIN_PASSWORD` | a long password for `/admin` |

4. Click **Deploy**.
5. In Supabase go to **Authentication -> URL Configuration** and set **Site URL** to your Vercel URL.

`vercel.json` pins the function region to `fra1`. Change it to the region closest to your Supabase project if you prefer.

## How it works

**Customer flow:** sign up (address saved on the profile) -> add to cart -> checkout shows bank details and total ->
"I Have Made Payment" -> `/upload-receipt` -> receipt goes to the `receipts` bucket -> order saved as `pending` ->
"Thanks for submission. Await admin approval." -> `/orders`, which updates live when the admin decides.

**Admin flow:** `/admin` -> password -> Orders tab shows new orders instantly with customer name, phone, delivery address,
items, total and a clickable receipt -> **Approve** / **Disapprove**.
Approving an order reduces product stock; changing an approved order to disapproved puts the stock back.

## Security notes (please read)

- **Passwords** are never stored by this app. Supabase Auth keeps only a bcrypt hash in `auth.users`, which the API cannot read. The admin panel only ever shows name, phone, email and address.
- **Why `SUPABASE_SERVICE_ROLE_KEY` is needed:** the admin panel is protected by a single password, not a Supabase login, so its actions run in server routes (`app/api/admin/*`) after the password cookie is checked. Those routes need the service key to read all customers/orders and edit products. The key is only used on the server and must never start with `NEXT_PUBLIC_`.
- **Order totals are calculated on the server** from current product prices and stock, so a customer cannot change the amount from their browser.
- **Admin session:** an HttpOnly, SameSite=Strict cookie signed with `ADMIN_PASSWORD`, valid 8 hours. Changing `ADMIN_PASSWORD` logs everyone out.
- **Realtime for admin:** Supabase Realtime respects row security, and the admin is not a Supabase user. So the database writes a tiny `order_events` row (order id only, no customer data) whenever an order is created or changes status. The admin page listens to that and reloads orders through the protected API. A 30-second refresh runs as a backup.
- **Receipts bucket is public** (as requested). File names contain a random ID inside the customer's own folder, so links can't be guessed, but anyone who has a link can open it. Make the bucket private and use signed URLs if you want stricter privacy.
- **Phone login:** to log in with a phone number, the app calls a database function that returns the email for that number. This means someone could test whether a phone number is registered. If that matters to you, remove phone login.
- Add a rate limit (for example Vercel Firewall or Cloudflare) if you expect people to guess the admin password.

## Free-plan notes

- Vercel Hobby is meant for personal, non-commercial use. Selling products is commercial use, so check Vercel's current terms; if your store earns money you may need the Pro plan.
- Supabase Free pauses projects after about a week with no activity (you can resume them from the dashboard), and includes 1 GB of file storage. Keep product photos small.
- Product images are served straight from Supabase Storage with plain `<img>` tags, so no Vercel image-optimisation quota is used.

## Project structure

```
app/
  page.tsx                 shop home
  product/[id]/page.tsx    product page
  cart/ checkout/ upload-receipt/ orders/ login/ signup/
  admin/page.tsx           admin (login or dashboard)
  api/orders/              create order (server-side price check)
  api/admin/               login, logout, customers, products, orders, upload-url
components/                Header, ProductCard, QuantitySelector, ...
components/admin/          Orders / Products / Customers tabs
lib/                       supabase clients, auth + cart state, admin auth, config
supabase/schema.sql        tables, RLS, triggers, realtime, storage buckets
```
