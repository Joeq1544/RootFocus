# RootFocus
Plant themed productivity app.

## RootFocus Dev Setup

1. Copy the environment template and fill in your values:
   ```bash
   cp .env.local.example .env.local
   ```

2. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```

3. Push the schema to your database:
   ```bash
   npx prisma db push
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.
